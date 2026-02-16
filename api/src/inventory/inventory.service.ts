import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RoomTypeInventoryDailyEntity } from './room-type-inventory-daily.entity';
import { InventoryHoldEntity } from './inventory-hold.entity';
import { BookingOrderEntity } from '../booking-order/booking-order.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  private getInventoryRepo(): Repository<RoomTypeInventoryDailyEntity> {
    return this.dataSource.getRepository(RoomTypeInventoryDailyEntity);
  }

  private getHoldRepo(): Repository<InventoryHoldEntity> {
    return this.dataSource.getRepository(InventoryHoldEntity);
  }

  private getBookingOrderRepo(): Repository<BookingOrderEntity> {
    return this.dataSource.getRepository(BookingOrderEntity);
  }

  async assertRoomTypeOperable(userId: string, roomTypeId: string) {
    const result = await this.dataSource.query(`
      SELECT 
        h.id as hotel_id,
        h.status as hotel_status,
        rt.status as room_type_status
      FROM room_type rt
      JOIN hotel h ON h.id = rt.hotel_id
      WHERE rt.id = $1
    `, [roomTypeId]);

    if (!result || result.length === 0) {
      throw new ForbiddenException('房型不存在');
    }

    const hotel = result[0];
    if (hotel.hotel_status !== 'APPROVED') {
      throw new ForbiddenException('酒店未审核通过，无法操作');
    }

    if (hotel.room_type_status !== 'APPROVED') {
      throw new ForbiddenException('房型未审核通过，无法操作');
    }

    const merchantCheck = await this.dataSource.query(`
      SELECT merchant_id FROM hotel WHERE id = $1
    `, [hotel.hotel_id]);

    if (!merchantCheck || merchantCheck.length === 0 || merchantCheck[0].merchant_id !== userId) {
      throw new ForbiddenException('无权操作此房型');
    }
  }

  async checkAvailability(userId: string, roomTypeId: string, from: Date, to: Date) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const result = await queryRunner.manager.query(`
        WITH dates AS (
          SELECT generate_series($3::date, ($4::date - interval '1 day')::date, interval '1 day')::date AS d
        )
        SELECT 
          dates.d AS date,
          i.total_qty AS "totalQty",
          i.used_qty  AS "usedQty",
          i.hold_qty  AS "holdQty",
          (i.total_qty - i.used_qty - i.hold_qty) AS "remainQty"
        FROM dates
        JOIN room_type_inventory_daily i 
          ON i.room_type_id = $2 AND i.date = dates.d
        JOIN room_type rt ON rt.id = i.room_type_id
        JOIN hotel h ON h.id = rt.hotel_id
        WHERE rt.id = $2
          AND h.status = 'APPROVED'
          AND rt.status = 'APPROVED'
          AND h.merchant_id = $1
        ORDER BY dates.d
      `, [userId, roomTypeId, from, to]);

      const rangeRemainQty = await queryRunner.manager.query(`
        WITH dates AS (
          SELECT generate_series($3::date, ($4::date - interval '1 day')::date, interval '1 day')::date AS d
        )
        SELECT MIN(i.total_qty - i.used_qty - i.hold_qty) as min_remain_qty
        FROM dates
        JOIN room_type_inventory_daily i 
          ON i.room_type_id = $2 AND i.date = dates.d
        JOIN room_type rt ON rt.id = i.room_type_id
        JOIN hotel h ON h.id = rt.hotel_id
        WHERE rt.id = $2
          AND h.status = 'APPROVED'
          AND rt.status = 'APPROVED'
          AND h.merchant_id = $1
      `, [userId, roomTypeId, from, to]);

      await queryRunner.commitTransaction();
      return {
        daily: result,
        rangeRemainQty: rangeRemainQty?.[0]?.min_remain_qty || 0,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async holdInventory(userId: string, roomTypeId: string, checkIn: Date, checkOut: Date, qty: number) {
    await this.assertRoomTypeOperable(userId, roomTypeId);

    const queryRunner = this.dataSource.createQueryRunner();
    const holdToken = uuidv4();
    const expireAt = new Date(Date.now() + 15 * 60 * 1000);

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const holdRepo = queryRunner.manager.getRepository(InventoryHoldEntity);

      const checkResult = await queryRunner.manager.query(`
        WITH dates AS (
          SELECT generate_series($2::date, ($3::date - interval '1 day')::date, interval '1 day')::date AS d
        ),
        upd AS (
          UPDATE room_type_inventory_daily i
          SET hold_qty = holdQty + $4,
              updated_at = now()
          FROM dates
          WHERE i.room_type_id = $1
            AND i.date = dates.d
            AND (i.total_qty - i.used_qty - i.holdQty) >= $4
          RETURNING i.date
        )
        SELECT 
          (SELECT COUNT(*) FROM dates) AS need_days,
          (SELECT COUNT(*) FROM upd)   AS updated_days
      `, [roomTypeId, checkIn, checkOut, qty]);

      const needDays = parseInt(checkResult[0].need_days);
      const updatedDays = parseInt(checkResult[0].updated_days);

      if (updatedDays !== needDays) {
        throw new Error('INSUFFICIENT_INVENTORY: 库存不足或部分日期不可用');
      }

      await holdRepo.insert({
        holdToken,
        roomTypeId,
        checkIn,
        checkOut,
        qty,
        status: 'ACTIVE',
        expireAt,
      });

      await queryRunner.commitTransaction();
      return {
        holdToken,
        expireAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.message.includes('INSUFFICIENT_INVENTORY')) {
        throw error;
      }
      throw new Error('HOLD_FAILED: 锁定库存失败');
    } finally {
      await queryRunner.release();
    }
  }

  async confirmHold(holdToken: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const holdRepo = queryRunner.manager.getRepository(InventoryHoldEntity);
      const bookingOrderRepo = queryRunner.manager.getRepository(BookingOrderEntity);

      const hold = await queryRunner.manager.query(`
        SELECT * FROM inventory_hold 
        WHERE hold_token = $1 
        FOR UPDATE
      `, [holdToken]);

      if (!hold || hold.length === 0) {
        throw new Error('HOLD_NOT_FOUND: 锁定记录不存在');
      }

      if (hold[0].status !== 'ACTIVE') {
        throw new Error('HOLD_ALREADY_CONVERTED: 锁定已被转换或已过期');
      }

      const now = new Date();
      if (hold[0].expire_at && new Date(hold[0].expire_at) < now) {
        throw new Error('HOLD_EXPIRED: 锁定已过期');
      }

      await this.assertRoomTypeOperable(userId, hold[0].room_type_id);

      const updateResult = await queryRunner.manager.query(`
        WITH dates AS (
          SELECT generate_series($2::date, ($3::date - interval '1 day')::date, interval '1 day')::date AS d
        ),
        upd AS (
          UPDATE room_type_inventory_daily i
          SET hold_qty = holdQty - $4,
              used_qty = usedQty + $4,
              updated_at = now()
          FROM dates
          WHERE i.room_type_id = $1
            AND i.date = dates.d
            AND i.holdQty >= $4
          RETURNING i.date
        )
        SELECT 
          (SELECT COUNT(*) FROM dates) AS need_days,
          (SELECT COUNT(*) FROM upd)   AS updated_days
      `, [hold[0].room_type_id, hold[0].check_in, hold[0].check_out, hold[0].qty]);

      const needDays = parseInt(updateResult[0].need_days);
      const updatedDays = parseInt(updateResult[0].updated_days);

      if (updatedDays !== needDays) {
        throw new Error('CONFIRM_FAILED: 确认订单失败，库存不足');
      }

      await holdRepo.update(
        { holdToken },
        { status: 'CONVERTED' }
      );

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.message.includes('HOLD_NOT_FOUND') || 
          error.message.includes('HOLD_ALREADY_CONVERTED') || 
          error.message.includes('HOLD_EXPIRED') ||
          error.message.includes('CONFIRM_FAILED')) {
        throw error;
      }
      throw new Error('CONFIRM_FAILED: 确认订单失败');
    } finally {
      await queryRunner.release();
    }
  }

  async expireHolds(limit: number = 100) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const holdRepo = queryRunner.manager.getRepository(InventoryHoldEntity);

      const now = new Date();
      const expiredHolds = await holdRepo.find({
        where: {
          status: 'ACTIVE',
        },
        order: { expireAt: 'ASC' },
        take: limit,
      });

      const validExpiredHolds = expiredHolds.filter(h => 
        h.expireAt && new Date(h.expireAt) < now
      );

      for (const hold of validExpiredHolds) {
        await queryRunner.manager.query(`
          WITH dates AS (
            SELECT generate_series($2::date, ($3::date - interval '1 day')::date, interval '1 day')::date AS d
          )
          UPDATE room_type_inventory_daily i
          SET hold_qty = holdQty - $1,
              updated_at = now()
          FROM dates
          WHERE i.room_type_id = $2
            AND i.date = dates.d
        `, [hold.qty, hold.roomTypeId, hold.checkIn, hold.checkOut]);
      }

      if (validExpiredHolds.length > 0) {
        await holdRepo.update(
          { id: In(validExpiredHolds.map(h => h.id)) },
          { status: 'EXPIRED' }
        );
      }

      await queryRunner.commitTransaction();
      return {
        expiredCount: validExpiredHolds.length,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('EXPIRE_JOB_FAILED: 过期锁定清理失败');
    } finally {
      await queryRunner.release();
    }
  }

  async initInventory(userId: string, roomTypeId: string, from: Date, to: Date, totalQty: number) {
    await this.assertRoomTypeOperable(userId, roomTypeId);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const inventoryRepo = queryRunner.manager.getRepository(RoomTypeInventoryDailyEntity);

      const dates = this.getDatesInRange(from, to);
      const roomType = await queryRunner.manager
        .getRepository(RoomTypeEntity)
        .createQueryBuilder('rt')
        .select('rt.hotelId', 'hotelId')
        .where('rt.id = :roomTypeId', { roomTypeId })
        .getRawOne();

      const hotelId = roomType?.hotelId;

      for (const date of dates) {
        const existingInventory = await inventoryRepo.findOne({
          where: { hotelId, roomTypeId, date }
        });

        if (existingInventory) {
          existingInventory.totalQty = totalQty;
          await inventoryRepo.save(existingInventory);
        } else {
          const newInventory = inventoryRepo.create({
            hotelId,
            roomTypeId,
            date,
            totalQty,
            usedQty: 0,
            holdQty: 0
          });
          await inventoryRepo.save(newInventory);
        }
      }

      await queryRunner.commitTransaction();
      return {
        initializedCount: dates.length,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('INIT_INVENTORY_FAILED: 初始化库存失败');
    } finally {
      await queryRunner.release();
    }
  }

  async getDailyInventory(userId: string, roomTypeIds: string[], from: Date, to: Date) {
    const inventory = await this.getInventoryRepo()
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.roomType', 'rt')
      .leftJoinAndSelect('rt.hotel', 'h')
      .where('i.roomTypeId IN (:...roomTypeIds)', { roomTypeIds })
      .andWhere('i.date BETWEEN :from AND :to', { from, to })
      .andWhere('h.status = :hotelStatus', { hotelStatus: 'APPROVED' })
      .andWhere('rt.status = :status', { status: 'APPROVED' })
      .andWhere('h.merchantId = :userId', { userId })
      .orderBy('i.roomTypeId', 'ASC')
      .addOrderBy('i.date', 'ASC')
      .getMany();

    const roomTypes = await this.dataSource.getRepository(RoomTypeEntity)
      .createQueryBuilder('rt')
      .where('rt.id IN (:...roomTypeIds)', { roomTypeIds })
      .getMany();

    const roomTypeMap = new Map(roomTypes.map(rt => [rt.id, rt]));
    const inventoryMap = new Map<string, any>();

    const dates = this.getDatesInRange(from, to);
    dates.forEach(date => {
      roomTypes.forEach(roomType => {
        const key = `${roomType.id}_${date.toISOString().split('T')[0]}`;
        const existingInv = inventory.find(i => {
          const invDate = i.date instanceof Date ? i.date : new Date(i.date);
          return i.roomTypeId === roomType.id && 
            invDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
        });

        const totalQty = existingInv ? Number(existingInv.totalQty) : null;
        const usedQty = existingInv ? Number(existingInv.usedQty) : null;
        const holdQty = existingInv ? Number(existingInv.holdQty) : 0;

        inventoryMap.set(key, {
          date: date,
          roomTypeId: roomType.id,
          totalQty: totalQty,
          usedQty: usedQty,
          holdQty: holdQty,
          remainQty: totalQty !== null ? totalQty - usedQty - holdQty : null,
          isDefault: !existingInv
        });
      });
    });

    return Array.from(inventoryMap.values());
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  async updateDailyInventory(userId: string, roomTypeId: string, date: Date, totalQty: number) {
    await this.assertRoomTypeOperable(userId, roomTypeId);

    const inventoryRepo = this.getInventoryRepo();
    const roomType = await this.dataSource
      .getRepository(RoomTypeEntity)
      .createQueryBuilder('rt')
      .select('rt.hotelId', 'hotelId')
      .where('rt.id = :roomTypeId', { roomTypeId })
      .getRawOne();

    const hotelId = roomType?.hotelId;

    const existingInventory = await inventoryRepo.findOne({
      where: { hotelId, roomTypeId, date }
    });

    if (existingInventory) {
      existingInventory.totalQty = totalQty;
      existingInventory.updatedBy = userId;
      await inventoryRepo.save(existingInventory);
    } else {
      const newInventory = inventoryRepo.create({
        hotelId,
        roomTypeId,
        date,
        totalQty,
        usedQty: 0,
        holdQty: 0,
        createdBy: userId
      });
      await inventoryRepo.save(newInventory);
    }

    return { roomTypeId, date, totalQty };
  }
}
