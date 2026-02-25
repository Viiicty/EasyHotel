import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { BookingOrderEntity } from './booking-order.entity';
import { HotelService } from '../hotel/hotel.service';

@Injectable()
export class BookingOrderService {
  constructor(
    @InjectRepository(BookingOrderEntity)
    private bookingOrderRepository: Repository<BookingOrderEntity>,
    private readonly hotelService: HotelService,
  ) {}

  async create(orderData: Partial<BookingOrderEntity>): Promise<BookingOrderEntity> {
    const order = this.bookingOrderRepository.create(orderData);
    return this.bookingOrderRepository.save(order);
  }

  async findAll(): Promise<BookingOrderEntity[]> {
    return this.bookingOrderRepository.find();
  }

  async findOne(id: string): Promise<BookingOrderEntity | undefined> {
    return this.bookingOrderRepository.findOne({ where: { id } });
  }

  async update(id: string, orderData: Partial<BookingOrderEntity>): Promise<BookingOrderEntity | undefined> {
    await this.bookingOrderRepository.update(id, orderData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.bookingOrderRepository.delete(id);
  }

  async findByUserId(userId: string): Promise<BookingOrderEntity[]> {
    return this.bookingOrderRepository.find({ where: { userId } });
  }

  async findByOrderNo(orderNo: string): Promise<BookingOrderEntity | undefined> {
    return this.bookingOrderRepository.findOne({ where: { orderNo } });
  }

  async findByHotelId(hotelId: string): Promise<BookingOrderEntity[]> {
    return this.bookingOrderRepository.find({ where: { hotelId } });
  }

  async findByStatus(status: string): Promise<BookingOrderEntity[]> {
    return this.bookingOrderRepository.find({ where: { status } });
  }

  async countTodayByHotelIds(hotelIds: string[]): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.bookingOrderRepository.count({
      where: {
        hotelId: In(hotelIds),
        createdTime: Between(startOfDay, endOfDay),
      },
    });
  }

  async countTodayByMerchantId(merchantId: string): Promise<{ count: number }> {
    const hotels = await this.hotelService.findByMerchantId(merchantId);
    const hotelIds = hotels.map(hotel => hotel.id);
    
    if (hotelIds.length === 0) {
      return { count: 0 };
    }

    const count = await this.countTodayByHotelIds(hotelIds);
    return { count };
  }

  async sumNightsByMerchantId(merchantId: string): Promise<{ totalNights: number }> {
    const hotels = await this.hotelService.findByMerchantId(merchantId);
    const hotelIds = hotels.map(hotel => hotel.id);
    
    if (hotelIds.length === 0) {
      return { totalNights: 0 };
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const orders = await this.bookingOrderRepository.find({
      where: {
        hotelId: In(hotelIds),
        status: 'CONFIRMED',
        createdTime: Between(startOfDay, endOfDay),
      },
      select: ['nights', 'rooms'],
    });

    const totalNights = orders.reduce((sum, order) => {
      return sum + ((order.nights || 0) * (order.rooms || 0));
    }, 0);

    return { totalNights };
  }

  async sumTodayGMVByMerchantId(merchantId: string): Promise<{ totalGMV: number }> {
    const hotels = await this.hotelService.findByMerchantId(merchantId);
    const hotelIds = hotels.map(hotel => hotel.id);
    
    if (hotelIds.length === 0) {
      return { totalGMV: 0 };
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const orders = await this.bookingOrderRepository.find({
      where: {
        hotelId: In(hotelIds),
        status: 'CONFIRMED',
        createdTime: Between(startOfDay, endOfDay),
      },
      select: ['totalAmount'],
    });

    const totalGMV = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount?.toString() || '0') || 0);
    }, 0);

    return { totalGMV };
  }

  async countLast7DaysByMerchantId(merchantId: string): Promise<{ count: number }> {
    const hotels = await this.hotelService.findByMerchantId(merchantId);
    const hotelIds = hotels.map(hotel => hotel.id);
    
    if (hotelIds.length === 0) {
      return { count: 0 };
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setDate(today.getDate() - 6);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await this.bookingOrderRepository.count({
      where: {
        hotelId: In(hotelIds),
        createdTime: Between(startOfDay, endOfDay),
      },
    });

    return { count };
  }

  async sumLast7DaysNightsByMerchantId(merchantId: string): Promise<{ totalNights: number }> {
    const hotels = await this.hotelService.findByMerchantId(merchantId);
    const hotelIds = hotels.map(hotel => hotel.id);
    
    if (hotelIds.length === 0) {
      return { totalNights: 0 };
    }

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setDate(today.getDate() - 6);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.bookingOrderRepository.find({
      where: {
        hotelId: In(hotelIds),
        status: 'CONFIRMED',
        createdTime: Between(startOfDay, endOfDay),
      },
      select: ['nights', 'rooms'],
    });

    const totalNights = orders.reduce((sum, order) => {
      return sum + ((order.nights || 0) * (order.rooms || 0));
    }, 0);

    return { totalNights };
  }

  async getPendingOrdersByMerchantId(merchantId: string): Promise<BookingOrderEntity[]> {
    const hotels = await this.hotelService.findByMerchantId(merchantId);
    const hotelIds = hotels.map(hotel => hotel.id);
    
    if (hotelIds.length === 0) {
      return [];
    }

    return this.bookingOrderRepository.find({
      where: {
        hotelId: In(hotelIds),
        status: 'PAID',
      },
      relations: ['hotel'],
      order: {
        createdTime: 'DESC',
      },
      take: 6,
    });
  }
}
