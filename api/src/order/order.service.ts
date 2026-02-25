import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';
import { BookingOrderEntity } from '../booking-order/booking-order.entity';
import { InventoryHoldEntity } from '../inventory/inventory-hold.entity';
import { RoomTypeInventoryDailyEntity } from '../inventory/room-type-inventory-daily.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { CreateOrderDto, OrderQueryDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

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

  async updateOrderStatus(orderId: string, userId: string, dto: UpdateOrderStatusDto) {
    this.logger.log(`=== updateOrderStatus 开始 ===`);
    this.logger.log(`订单ID: ${orderId}`);
    this.logger.log(`用户ID: ${userId}`);
    this.logger.log(`请求状态: ${dto.status}`);

    const order = await this.getOrderById(orderId, userId);

    this.logger.log(`当前订单状态: ${order.status}`);

    const { status, rejectReason } = dto;

    if (status === 'CANCELLED' && order.status !== 'PAID' && order.status !== 'PENDING') {
      this.logger.error(`取消订单失败: 当前状态 ${order.status} 不允许取消`);
      throw new BadRequestException('只有待支付或已支付的订单才能取消');
    }

    if (status === 'CONFIRMED' && order.status !== 'PAID') {
      this.logger.error(`确认订单失败: 当前状态 ${order.status} 不允许确认`);
      throw new BadRequestException('只有已支付的订单才能确认');
    }

    order.status = status;
    await this.getOrderRepo().save(order);

    this.logger.log(`订单状态已更新为: ${status}`);

    if (status === 'CONFIRMED') {
      await this.confirmInventoryHold(orderId);
    }

    if (status === 'CANCELLED' || status === 'REFUNDED') {
      this.logger.log(`开始释放库存...`);
      await this.releaseInventoryHold(orderId);
      this.logger.log(`库存已释放`);
    }

    this.logger.log(`=== updateOrderStatus 结束 ===`);
    return order;
  }

  async deleteOrder(orderId: string, userId: string) {
    this.logger.log(`=== deleteOrder 开始 ===`);
    this.logger.log(`订单ID: ${orderId}`);
    this.logger.log(`用户ID: ${userId}`);

    const order = await this.getOrderById(orderId, userId);

    this.logger.log(`当前订单状态: ${order.status}`);

    if (order.status !== 'CANCELLED') {
      this.logger.error(`删除订单失败: 当前状态 ${order.status} 不允许删除`);
      throw new BadRequestException('只有已取消的订单才能删除');
    }

    await this.getOrderRepo().remove(order);

    this.logger.log(`订单已删除`);
    this.logger.log(`=== deleteOrder 结束 ===`);
  }

  async payOrder(orderId: string, userId: string) {
    this.logger.log(`=== payOrder 开始 ===`);
    this.logger.log(`订单ID: ${orderId}`);
    this.logger.log(`用户ID: ${userId}`);

    const order = await this.getOrderById(orderId, userId);

    this.logger.log(`当前订单状态: ${order.status}`);

    if (order.status !== 'PENDING') {
      this.logger.error(`支付失败: 当前状态 ${order.status} 不允许支付`);
      throw new BadRequestException('只有待支付的订单才能支付');
    }

    order.status = 'PAID';
    await this.getOrderRepo().save(order);

    this.logger.log(`订单状态已更新为: PAID`);
    
    this.logger.log(`=== 模拟打印订单 ===`);
    this.logger.log(`订单号: ${order.orderNo}`);
    this.logger.log(`酒店名称: ${order.hotel?.nameZh || ''}`);
    this.logger.log(`房型名称: ${order.roomType?.name || ''}`);
    this.logger.log(`入住日期: ${order.checkinDate}`);
    this.logger.log(`退房日期: ${order.checkoutDate}`);
    this.logger.log(`晚数: ${order.nights}`);
    this.logger.log(`房间数量: ${order.rooms}`);
    this.logger.log(`住客姓名: ${order.guestName}`);
    this.logger.log(`联系手机: ${order.guestPhone}`);
    this.logger.log(`身份证号: ${order.idCard}`);
    this.logger.log(`订单总价: ¥${order.totalAmount}`);
    this.logger.log(`支付时间: ${new Date().toISOString()}`);
    this.logger.log(`=== 打印完成 ===`);
    
    this.logger.log(`=== payOrder 结束 ===`);

    return {
      success: true,
      orderNo: order.orderNo || '',
    };
  }

  private async confirmInventoryHold(orderId: string) {
    const hold = await this.getHoldRepo().findOne({
      where: { orderId },
    });

    if (!hold) {
      return;
    }

    const order = await this.getOrderRepo().findOne({
      where: { id: orderId },
    });

    if (!order) {
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
        inventory.holdQty = Math.max(0, (inventory.holdQty || 0) - order.rooms);
        inventory.usedQty = (inventory.usedQty || 0) + order.rooms;
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

    const order = await this.getOrderRepo().findOne({
      where: { id: orderId },
    });

    if (!order) {
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
        inventory.holdQty = Math.max(0, (inventory.holdQty || 0) - order.rooms);
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

  async getPendingOrder(userId: string) {
    this.logger.log(`=== getPendingOrder 开始 ===`);
    this.logger.log(`用户ID: ${userId}`);

    try {
      const order = await this.getOrderRepo()
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.hotel', 'hotel')
        .leftJoinAndSelect('order.roomType', 'roomType')
        .where('order.userId = :userId', { userId })
        .andWhere('order.status = :status', { status: 'PENDING' })
        .orderBy('order.createdTime', 'DESC')
        .getOne();

      if (!order) {
        this.logger.log(`没有待支付订单`);
        this.logger.log(`=== getPendingOrder 结束 ===`);
        return null;
      }

      const hold = await this.getHoldRepo().findOne({
        where: { orderId: order.id },
      });

      let remainingTime = 0;
      let expireAt = null;

      if (hold?.expireAt) {
        const expireTime = new Date(hold.expireAt).getTime();
        const now = Date.now();
        remainingTime = Math.max(0, Math.floor((expireTime - now) / 1000));
        expireAt = hold.expireAt;
      }

      this.logger.log(`找到待支付订单: ${order.orderNo}`);
      this.logger.log(`剩余时间: ${remainingTime}秒`);
      this.logger.log(`=== getPendingOrder 结束 ===`);

      return {
        orderId: order.id,
        orderNo: order.orderNo,
        hotelName: order.hotel?.nameZh || '',
        roomTypeName: order.roomType?.name || '',
        totalAmount: order.totalAmount,
        remainingTime,
        expireAt,
      };
    } catch (error) {
      this.logger.error(`getPendingOrder 错误:`, error);
      this.logger.error(`错误堆栈:`, error.stack);
      this.logger.log(`=== getPendingOrder 结束（错误） ===`);
      throw error;
    }
  }

  async getMerchantOrders(merchantId: string, query: OrderQueryDto) {
    console.log('=== getMerchantOrders 开始 ===');
    console.log('merchantId:', merchantId);
    console.log('query:', query);
    
    const { status, page = 1, pageSize = 10, keyword } = query;

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

    if (keyword) {
      queryBuilder.andWhere(
        '(order.orderNo LIKE :keyword OR hotel.nameZh LIKE :keyword OR order.guestName LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
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

  async cancelExpiredOrder(orderId: string) {
    this.logger.log(`=== cancelExpiredOrder 开始 ===`);
    this.logger.log(`订单ID: ${orderId}`);
    
    const order = await this.getOrderRepo().findOne({
      where: { id: orderId },
    });

    if (!order) {
      this.logger.warn(`订单不存在: ${orderId}`);
      return;
    }

    this.logger.log(`订单信息: rooms=${order.rooms}, nights=${order.nights}, roomTypeId=${order.roomTypeId}`);

    if (order.status !== 'PENDING') {
      this.logger.log(`订单状态已变更: ${order.status}, 跳过取消`);
      return;
    }

    const hold = await this.getHoldRepo().findOne({
      where: { orderId },
    });

    this.logger.log(`库存锁定记录: ${hold ? JSON.stringify({ id: hold.id, qty: hold.qty, roomTypeId: hold.roomTypeId, checkIn: hold.checkIn, checkOut: hold.checkOut }) : '未找到'}`);

    if (hold) {
      const queryRunner = this.dataSource.createQueryRunner();
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const dates = this.getDatesInRange(hold.checkIn, hold.checkOut);
        this.logger.log(`需要更新的日期范围: ${dates.map(d => d.toISOString().split('T')[0]).join(', ')}`);

        const inventoryRecords = await queryRunner.manager.find(
          RoomTypeInventoryDailyEntity,
          {
            where: {
              roomTypeId: hold.roomTypeId,
              date: In(dates),
            },
          },
        );

        this.logger.log(`找到的库存记录数量: ${inventoryRecords.length}`);

        for (const inventory of inventoryRecords) {
          const dateStr = inventory.date instanceof Date ? inventory.date.toISOString().split('T')[0] : String(inventory.date);
          const oldHoldQty = inventory.holdQty || 0;
          const oldUsedQty = inventory.usedQty || 0;
          const oldTotalQty = inventory.totalQty || 0;
          const oldAvailableQty = oldTotalQty - oldUsedQty - oldHoldQty;
          
          const newHoldQty = Math.max(0, oldHoldQty - order.rooms);
          const newAvailableQty = oldTotalQty - oldUsedQty - newHoldQty;
          
          this.logger.log(`=== 更新库存 [${dateStr}] ===`);
          this.logger.log(`更新前: totalQty=${oldTotalQty}, usedQty=${oldUsedQty}, holdQty=${oldHoldQty}, availableQty=${oldAvailableQty}`);
          this.logger.log(`更新后: totalQty=${oldTotalQty}, usedQty=${oldUsedQty}, holdQty=${newHoldQty}, availableQty=${newAvailableQty}`);
          this.logger.log(`变化: holdQty ${oldHoldQty} -> ${newHoldQty} (减少 ${order.rooms}), availableQty ${oldAvailableQty} -> ${newAvailableQty} (增加 ${order.rooms})`);
          
          inventory.holdQty = newHoldQty;
          await queryRunner.manager.save(inventory);
        }

        hold.status = 'EXPIRED';
        await queryRunner.manager.save(hold);

        await queryRunner.commitTransaction();
        this.logger.log(`事务已提交`);
      } catch (error) {
        this.logger.error(`事务失败，正在回滚: ${error.message}`);
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    order.status = 'CANCELLED';
    order.updatedBy = 'SYSTEM';
    await this.getOrderRepo().save(order);
    
    this.logger.log(`订单 ${orderId} 已取消并释放库存`);
    this.logger.log(`=== cancelExpiredOrder 结束 ===`);
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate < end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}
