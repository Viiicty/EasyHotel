import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RoomRatePlanEntity } from '../room-rate-plan/room-rate-plan.entity';
import { RoomRatePlanDailyEntity } from '../room-rate-plan/room-rate-plan-daily.entity';
import { RoomTypeInventoryDailyEntity } from './room-type-inventory-daily.entity';
import { InventoryHoldEntity } from './inventory-hold.entity';
import { BookingOrderEntity } from '../booking-order/booking-order.entity';

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

  private getRatePlanRepo(): Repository<RoomRatePlanEntity> {
    return this.dataSource.getRepository(RoomRatePlanEntity);
  }

  private getRatePlanDailyRepo(): Repository<RoomRatePlanDailyEntity> {
    return this.dataSource.getRepository(RoomRatePlanDailyEntity);
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
          ON i.room_type_id = $2 AND i.d = dates.d
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
          ON i.room_type_id = $2 AND i.d = dates.d
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
          SET hold_qty = hold_qty + $4,
              updated_at = now()
          FROM dates
          WHERE i.room_type_id = $1
            AND i.d = dates.d
            AND (i.total_qty - i.used_qty - i.hold_qty) >= $4
          RETURNING i.d
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
          SET hold_qty = hold_qty - $4,
              used_qty = used_qty + $4,
              updated_at = now()
          FROM dates
          WHERE i.room_type_id = $1
            AND i.d = dates.d
            AND i.hold_qty >= $4
          RETURNING i.d
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
          SET hold_qty = hold_qty - $1,
              updated_at = now()
          FROM dates
          WHERE i.room_type_id = $2
            AND i.d = dates.d
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

      const result = await queryRunner.manager.query(`
        INSERT INTO room_type_inventory_daily (id, room_type_id, d, total_qty, used_qty, hold_qty, updated_at, created_at)
        SELECT 
          gen_random_uuid() as id,
          $1::uuid as room_type_id,
          d::date as d,
          $2::int as total_qty,
          0 as used_qty,
          0 as hold_qty,
          now() as updated_at,
          now() as created_at
        FROM generate_series($3::date, ($4::date - interval '1 day')::date, interval '1 day')::date as d(d)
        ON CONFLICT (room_type_id, d) 
        DO UPDATE SET 
          total_qty = EXCLUDED.total_qty,
          updated_at = now()
        RETURNING room_type_id, d, total_qty
      `, [roomTypeId, totalQty, from, to]);

      await queryRunner.commitTransaction();
      return {
        initializedCount: result.length,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('INIT_INVENTORY_FAILED: 初始化库存失败');
    } finally {
      await queryRunner.release();
    }
  }

  async getDailyInventory(userId: string, roomTypeIds: string[], from: Date, to: Date) {
    const result = await this.dataSource.query(`
      WITH dates AS (
        SELECT generate_series($2::date, ($3::date - interval '1 day')::date, interval '1 day')::date AS d
      )
      SELECT 
        dates.d AS date,
        i.room_type_id AS "roomTypeId",
        i.total_qty AS "totalQty",
        i.used_qty AS "usedQty",
        i.hold_qty AS "holdQty",
        (i.total_qty - i.used_qty - i.hold_qty) AS "remainQty"
      FROM dates
      JOIN room_type_inventory_daily i 
        ON i.d = dates.d
      JOIN room_type rt ON rt.id = i.room_type_id
      JOIN hotel h ON h.id = rt.hotel_id
      WHERE i.room_type_id = ANY($1)
        AND i.d >= $2
        AND i.d < $3
        AND h.status = 'APPROVED'
        AND rt.status = 'APPROVED'
        AND h.merchant_id = $4
      ORDER BY i.room_type_id, dates.d
    `, [roomTypeIds, from, to, userId]);

    return result;
  }

  async updateDailyInventory(userId: string, roomTypeId: string, date: Date, totalQty: number) {
    await this.assertRoomTypeOperable(userId, roomTypeId);

    const result = await this.dataSource.query(`
      INSERT INTO room_type_inventory_daily (id, room_type_id, d, total_qty, used_qty, hold_qty, updated_at, created_at)
      VALUES (
        gen_random_uuid(),
        $1::uuid,
        $2::date,
        $3::int,
        0,
        0,
        now(),
        now()
      )
      ON CONFLICT (room_type_id, d) 
      DO UPDATE SET 
        total_qty = EXCLUDED.total_qty,
        updated_at = now()
      RETURNING room_type_id, d, total_qty
    `, [roomTypeId, date, totalQty]);

    return result[0];
  }
}
