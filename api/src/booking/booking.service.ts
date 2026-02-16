import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BookingOrderEntity } from '../booking-order/booking-order.entity';
import { InventoryHoldEntity } from '../inventory/inventory-hold.entity';
import { RoomTypeInventoryDailyEntity } from '../inventory/room-type-inventory-daily.entity';
import { RoomTypePriceDailyEntity } from '../room-type-price-daily/room-type-price-daily.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';
import { HotelEntity } from '../hotel/hotel.entity';

interface PrepareBookingDto {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

interface SubmitBookingDto {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  nights: number;
  adults: number;
  children: number;
  guestName: string;
  guestPhone: string;
  idCard: string;
  remarks?: string;
}

interface PrepareBookingResponse {
  hotel: HotelEntity;
  roomType: RoomTypeEntity;
  prices: Array<{ date: string; price: number }>;
  totalPrice: number;
  nights: number;
  calculatedRooms: number;
}

interface SubmitBookingResponse {
  orderId: string;
  orderNo: string;
  holdToken: string;
  expireAt: string;
}

interface CheckInventoryDto {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
}

interface CheckInventoryResponse {
  available: boolean;
  message?: string;
  minRemainingQty?: number;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  private getBookingOrderRepo(): Repository<BookingOrderEntity> {
    return this.dataSource.getRepository(BookingOrderEntity);
  }

  private getHoldRepo(): Repository<InventoryHoldEntity> {
    return this.dataSource.getRepository(InventoryHoldEntity);
  }

  private getInventoryRepo(): Repository<RoomTypeInventoryDailyEntity> {
    return this.dataSource.getRepository(RoomTypeInventoryDailyEntity);
  }

  private getPriceRepo(): Repository<RoomTypePriceDailyEntity> {
    return this.dataSource.getRepository(RoomTypePriceDailyEntity);
  }

  private getRoomTypeRepo(): Repository<RoomTypeEntity> {
    return this.dataSource.getRepository(RoomTypeEntity);
  }

  private getHotelRepo(): Repository<HotelEntity> {
    return this.dataSource.getRepository(HotelEntity);
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  async checkInventory(
    dto: CheckInventoryDto,
  ): Promise<CheckInventoryResponse> {
    const { roomTypeId, checkIn, checkOut, rooms } = dto;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const inventoryRecords = await this.getInventoryRepo().find({
      where: {
        roomTypeId,
        date: In(this.getDatesInRange(checkInDate, checkOutDate).map((d) => d)),
      },
    });

    let minRemainingQty = Infinity;

    for (const inventory of inventoryRecords) {
      const remainQty =
        (inventory.totalQty || 0) -
        (inventory.usedQty || 0) -
        (inventory.holdQty || 0);
      minRemainingQty = Math.min(minRemainingQty, remainQty);

      if (remainQty < rooms) {
        const dateStr = inventory.date instanceof Date 
          ? inventory.date.toISOString().split('T')[0] 
          : String(inventory.date);
        return {
          available: false,
          message: `${dateStr} 库存不足`,
          minRemainingQty: minRemainingQty === Infinity ? 0 : minRemainingQty,
        };
      }
    }

    if (inventoryRecords.length === 0) {
      return {
        available: false,
        message: '该房型暂无库存信息',
        minRemainingQty: 0,
      };
    }

    return {
      available: true,
      minRemainingQty: minRemainingQty === Infinity ? 0 : minRemainingQty,
    };
  }

  async prepareBooking(
    userId: string,
    dto: PrepareBookingDto,
  ): Promise<PrepareBookingResponse> {
    const { hotelId, roomTypeId, checkIn, checkOut, rooms, adults, children } = dto;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) {
      throw new BadRequestException('入住日期必须早于退房日期');
    }

    const hotel = await this.getHotelRepo().findOne({
      where: { id: hotelId, status: 'APPROVED' },
    });

    if (!hotel) {
      throw new NotFoundException('酒店不存在或未审核通过');
    }

    const roomType = await this.getRoomTypeRepo().findOne({
      where: { id: roomTypeId, status: 'APPROVED' },
    });

    if (!roomType) {
      throw new NotFoundException('房型不存在或未审核通过');
    }

    if (roomType.hotelId !== hotelId) {
      throw new BadRequestException('房型与酒店不匹配');
    }

    const calculatedRooms = Math.ceil(adults / (roomType.maxGuests || 1));

    const prices = await this.getPriceRepo()
      .createQueryBuilder('p')
      .select(['p.date', 'p.price'])
      .where('p.roomTypeId = :roomTypeId', { roomTypeId })
      .andWhere('p.date >= :checkIn', { checkIn: checkInDate })
      .andWhere('p.date < :checkOut', { checkOut: checkOutDate })
      .orderBy('p.date', 'ASC')
      .getMany();

    if (prices.length === 0) {
      const defaultPrice = roomType.defaultPrice || 0;
      const datePrices = [];
      for (let i = 0; i < nights; i++) {
        const date = new Date(checkInDate);
        date.setDate(date.getDate() + i);
        datePrices.push({
          date: date.toISOString().split('T')[0],
          price: defaultPrice,
        });
      }
      return {
        hotel,
        roomType,
        prices: datePrices,
        totalPrice: defaultPrice * nights * rooms,
        nights,
        calculatedRooms,
      };
    }

    const totalPrice = prices.reduce((sum, p) => sum + Number(p.price), 0) * rooms;

    return {
      hotel,
      roomType,
      prices: prices.map((p) => ({
        date: p.date instanceof Date ? p.date.toISOString().split('T')[0] : String(p.date),
        price: Number(p.price),
      })),
      totalPrice,
      nights,
      calculatedRooms,
    };
  }

  async submitBooking(
    userId: string,
    dto: SubmitBookingDto,
  ): Promise<SubmitBookingResponse> {
    const {
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      rooms,
      nights,
      adults,
      children,
      guestName,
      guestPhone,
      idCard,
      remarks,
    } = dto;

    if (!this.validateIdCard(idCard)) {
      throw new BadRequestException('身份证号格式不正确');
    }

    if (!this.validatePhone(guestPhone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const roomType = await queryRunner.manager.findOne(RoomTypeEntity, {
        where: { id: roomTypeId, status: 'APPROVED' },
      });

      if (!roomType) {
        throw new NotFoundException('房型不存在或未审核通过');
      }

      const inventoryRecords = await queryRunner.manager.find(
        RoomTypeInventoryDailyEntity,
        {
          where: {
            roomTypeId,
            date: In(
              this.getDatesInRange(checkInDate, checkOutDate).map((d) => d),
            ),
          },
        },
      );

      for (const inventory of inventoryRecords) {
        const remainQty =
          (inventory.totalQty || 0) -
          (inventory.usedQty || 0) -
          (inventory.holdQty || 0);
        if (remainQty < rooms) {
          const dateStr = inventory.date instanceof Date 
            ? inventory.date.toISOString().split('T')[0] 
            : String(inventory.date);
          throw new BadRequestException(
            `${dateStr} 库存不足`,
          );
        }
      }

      const holdToken = uuidv4();
      const expireAt = new Date(Date.now() + 1 * 60 * 1000);

      const hold = queryRunner.manager.create(InventoryHoldEntity, {
        hotelId,
        roomTypeId,
        holdToken,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        qty: rooms * nights,
        status: 'ACTIVE',
        expireAt,
      });

      await queryRunner.manager.save(hold);

      for (const inventory of inventoryRecords) {
        inventory.holdQty = (inventory.holdQty || 0) + rooms;
        await queryRunner.manager.save(inventory);
      }

      const prices = await queryRunner.manager.find(RoomTypePriceDailyEntity, {
        where: {
          roomTypeId,
          date: In(
            this.getDatesInRange(checkInDate, checkOutDate).map((d) => d),
          ),
        },
      });

      const priceDetail = prices.map((p) => ({
        date: p.date instanceof Date ? p.date.toISOString().split('T')[0] : String(p.date),
        price: Number(p.price),
      }));

      const totalPrice = prices.reduce((sum, p) => sum + Number(p.price), 0) * rooms;

      const orderNo = this.generateOrderNo();

      const order = queryRunner.manager.create(BookingOrderEntity, {
        orderNo,
        userId,
        hotelId,
        roomTypeId,
        checkinDate: checkInDate,
        checkoutDate: checkOutDate,
        nights,
        rooms,
        guestName,
        guestPhone,
        idCard,
        totalAmount: totalPrice,
        unitPrice: totalPrice / rooms / nights,
        priceDetail,
        status: 'PENDING',
      });

      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return {
        orderId: savedOrder.id,
        orderNo,
        holdToken,
        expireAt: expireAt.toISOString(),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmBooking(
    userId: string,
    orderId: string,
    holdToken: string,
  ): Promise<{ success: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const order = await queryRunner.manager.findOne(BookingOrderEntity, {
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (order.userId !== userId) {
        throw new BadRequestException('无权操作此订单');
      }

      if (order.status !== 'PENDING') {
        throw new BadRequestException('订单状态不正确');
      }

      const hold = await queryRunner.manager.findOne(InventoryHoldEntity, {
        where: { holdToken },
      });

      if (!hold) {
        throw new NotFoundException('库存锁定记录不存在');
      }

      if (hold.status !== 'ACTIVE') {
        throw new BadRequestException('库存锁定状态不正确');
      }

      hold.status = 'CONVERTED';
      await queryRunner.manager.save(hold);

      const inventoryRecords = await queryRunner.manager.find(
        RoomTypeInventoryDailyEntity,
        {
          where: {
            roomTypeId: order.roomTypeId,
            date: In(
              this.getDatesInRange(
                new Date(order.checkinDate),
                new Date(order.checkoutDate),
              ).map((d) => d),
            ),
          },
        },
      );

      for (const inventory of inventoryRecords) {
        inventory.holdQty = Math.max(0, (inventory.holdQty || 0) - order.rooms);
        inventory.usedQty = (inventory.usedQty || 0) + order.rooms;
        await queryRunner.manager.save(inventory);
      }

      order.status = 'CONFIRMED';
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelBooking(
    userId: string,
    orderId: string,
    holdToken: string,
  ): Promise<{ success: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const order = await queryRunner.manager.findOne(BookingOrderEntity, {
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('订单不存在');
      }

      if (order.userId !== userId) {
        throw new BadRequestException('无权操作此订单');
      }

      if (order.status !== 'PENDING') {
        throw new BadRequestException('订单状态不正确');
      }

      const hold = await queryRunner.manager.findOne(InventoryHoldEntity, {
        where: { holdToken },
      });

      if (!hold) {
        throw new NotFoundException('库存锁定记录不存在');
      }

      if (hold.status !== 'ACTIVE') {
        throw new BadRequestException('库存锁定状态不正确');
      }

      hold.status = 'CANCELLED';
      await queryRunner.manager.save(hold);

      const inventoryRecords = await queryRunner.manager.find(
        RoomTypeInventoryDailyEntity,
        {
          where: {
            roomTypeId: order.roomTypeId,
            date: In(
              this.getDatesInRange(
                new Date(order.checkinDate),
                new Date(order.checkoutDate),
              ).map((d) => d),
            ),
          },
        },
      );

      for (const inventory of inventoryRecords) {
        inventory.holdQty = Math.max(0, (inventory.holdQty || 0) - order.rooms);
        await queryRunner.manager.save(inventory);
      }

      order.status = 'CANCELLED';
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORDER${timestamp}${random}`;
  }

  async mockPayment(
    userId: string,
    orderId: string,
  ): Promise<{ success: boolean; orderNo: string }> {
    const order = await this.getBookingOrderRepo().findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('无权操作此订单');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('订单状态不正确，无法支付');
    }

    order.status = 'PAID';
    await this.getBookingOrderRepo().save(order);

    return {
      success: true,
      orderNo: order.orderNo || '',
    };
  }

  private validateIdCard(idCard: string): boolean {
    const pattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    return pattern.test(idCard);
  }

  private validatePhone(phone: string): boolean {
    const pattern = /^1[3-9]\d{9}$/;
    return pattern.test(phone);
  }
}
