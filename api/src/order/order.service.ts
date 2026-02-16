import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { BookingOrderEntity } from '../booking-order/booking-order.entity';
import { InventoryHoldEntity } from '../inventory/inventory-hold.entity';
import { RoomTypeInventoryDailyEntity } from '../inventory/room-type-inventory-daily.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { CreateOrderDto, OrderQueryDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  private getOrderRepo(): Repository<BookingOrderEntity> {
    return this.dataSource.getRepository(BookingOrderEntity);
  }

  private getHoldRepo(): Repository<InventoryHoldEntity> {
    return this.dataSource.getRepository(InventoryHoldEntity);
  }

  private getInventoryRepo(): Repository<RoomTypeInventoryDailyEntity> {
    return this.dataSource.getRepository(RoomTypeInventoryDailyEntity);
  }

  async getUserOrders(userId: string, query: OrderQueryDto) {
    const { status, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.getOrderRepo()
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.hotel', 'hotel')
      .leftJoinAndSelect('order.roomType', 'roomType')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdTime', 'DESC');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    const [orders, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getOrderById(orderId: string, userId?: string) {
    const queryBuilder = this.getOrderRepo()
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.hotel', 'hotel')
      .leftJoinAndSelect('order.roomType', 'roomType')
      .where('order.id = :orderId', { orderId });

    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.getOrderById(orderId);

    const { status, rejectReason } = dto;

    if (status === 'CANCELLED' && order.status !== 'PAID') {
      throw new BadRequestException('只有已支付的订单才能取消');
    }

    if (status === 'CONFIRMED' && order.status !== 'PAID') {
      throw new BadRequestException('只有已支付的订单才能确认');
    }

    order.status = status;
    await this.getOrderRepo().save(order);

    if (status === 'CONFIRMED') {
      await this.confirmInventoryHold(orderId);
    }

    if (status === 'CANCELLED' || status === 'REFUNDED') {
      await this.releaseInventoryHold(orderId);
    }

    return order;
  }

  private async confirmInventoryHold(orderId: string) {
    const hold = await this.getHoldRepo().findOne({
      where: { orderId },
    });

    if (!hold) {
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const inventoryRecords = await queryRunner.manager.find(
        RoomTypeInventoryDailyEntity,
        {
          where: {
            roomTypeId: hold.roomTypeId,
            date: In(this.getDatesInRange(hold.checkIn, hold.checkOut)),
          },
        },
      );

      for (const inventory of inventoryRecords) {
        inventory.holdQty = Math.max(0, (inventory.holdQty || 0) - hold.qty);
        inventory.usedQty = (inventory.usedQty || 0) + hold.qty;
        await queryRunner.manager.save(inventory);
      }

      hold.status = 'CONVERTED';
      await queryRunner.manager.save(hold);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async releaseInventoryHold(orderId: string) {
    const hold = await this.getHoldRepo().findOne({
      where: { orderId },
    });

    if (!hold) {
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const inventoryRecords = await queryRunner.manager.find(
        RoomTypeInventoryDailyEntity,
        {
          where: {
            roomTypeId: hold.roomTypeId,
            date: In(this.getDatesInRange(hold.checkIn, hold.checkOut)),
          },
        },
      );

      for (const inventory of inventoryRecords) {
        inventory.holdQty = Math.max(0, (inventory.holdQty || 0) - hold.qty);
        await queryRunner.manager.save(inventory);
      }

      hold.status = 'CANCELLED';
      await queryRunner.manager.save(hold);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  async checkOrderStatus(orderId: string) {
    const order = await this.getOrderById(orderId);
    const hold = await this.getHoldRepo().findOne({
      where: { orderId },
    });

    const now = new Date();
    let remainingTime = 0;

    if (hold && hold.expireAt) {
      const expireTime = new Date(hold.expireAt);
      remainingTime = Math.max(0, Math.floor((expireTime.getTime() - now.getTime()) / 1000));
    }

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      status: order.status,
      remainingTime,
      canConfirm: order.status === 'PAID',
      canCancel: order.status === 'PAID',
    };
  }

  async getMerchantOrders(merchantId: string, query: OrderQueryDto) {
    console.log('=== getMerchantOrders 开始 ===');
    console.log('merchantId:', merchantId);
    console.log('query:', query);
    
    const { status, page = 1, pageSize = 10 } = query;

    console.log('准备查询酒店...');
    const hotelRepo = this.dataSource.getRepository(HotelEntity);
    console.log('hotelRepo:', hotelRepo);
    console.log('hotelRepo.metadata:', hotelRepo.metadata);
    
    const hotels = await hotelRepo.find({
      where: { merchantId },
      select: ['id']
    });

    console.log('查询到的酒店:', hotels);
    const hotelIds = hotels.map(h => h.id);
    console.log('hotelIds:', hotelIds);

    if (hotelIds.length === 0) {
      console.log('商户没有酒店，返回空列表');
      return {
        orders: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    console.log('准备查询订单...');
    const orderRepo = this.getOrderRepo();
    console.log('orderRepo:', orderRepo);
    console.log('orderRepo.metadata:', orderRepo.metadata);
    
    const queryBuilder = orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.hotel', 'hotel')
      .leftJoinAndSelect('order.roomType', 'roomType')
      .where('order.hotelId IN (:...hotelIds)', { hotelIds })
      .orderBy('order.createdTime', 'DESC');

    console.log('queryBuilder:', queryBuilder);

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    console.log('执行查询...');
    const [orders, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    console.log('查询结果 orders:', orders);
    console.log('查询结果 total:', total);

    const result = {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
    
    console.log('=== getMerchantOrders 结束 ===');
    return result;
  }

  async getMerchantOrderById(orderId: string, merchantId: string) {
    const hotelRepo = this.dataSource.getRepository(HotelEntity);
    
    const hotels = await hotelRepo.find({
      where: { merchantId },
      select: ['id']
    });

    const hotelIds = hotels.map(h => h.id);

    const queryBuilder = this.getOrderRepo()
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.hotel', 'hotel')
      .leftJoinAndSelect('order.roomType', 'roomType')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.id = :orderId', { orderId })
      .andWhere('order.hotelId IN (:...hotelIds)', { hotelIds });

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async updateMerchantOrderStatus(orderId: string, merchantId: string, dto: UpdateOrderStatusDto) {
    const order = await this.getMerchantOrderById(orderId, merchantId);

    const { status, rejectReason } = dto;

    if (status === 'CONFIRMED' && order.status !== 'PAID') {
      throw new BadRequestException('只有已支付的订单才能确认');
    }

    if (status === 'CANCELLED' && order.status !== 'PAID') {
      throw new BadRequestException('只有已支付的订单才能取消');
    }

    order.status = status;
    await this.getOrderRepo().save(order);

    if (status === 'CONFIRMED') {
      await this.confirmInventoryHold(orderId);
    }

    if (status === 'CANCELLED') {
      await this.releaseInventoryHold(orderId);
    }

    return order;
  }
}
