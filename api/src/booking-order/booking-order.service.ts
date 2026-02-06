import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingOrderEntity } from './booking-order.entity';

@Injectable()
export class BookingOrderService {
  constructor(
    @InjectRepository(BookingOrderEntity)
    private bookingOrderRepository: Repository<BookingOrderEntity>,
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
}
