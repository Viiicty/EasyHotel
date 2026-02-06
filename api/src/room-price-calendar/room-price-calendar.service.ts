import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomPriceCalendarEntity } from './room-price-calendar.entity';

@Injectable()
export class RoomPriceCalendarService {
  constructor(
    @InjectRepository(RoomPriceCalendarEntity)
    private roomPriceCalendarRepository: Repository<RoomPriceCalendarEntity>,
  ) {}

  async create(calendarData: Partial<RoomPriceCalendarEntity>): Promise<RoomPriceCalendarEntity> {
    const calendar = this.roomPriceCalendarRepository.create(calendarData);
    return this.roomPriceCalendarRepository.save(calendar);
  }

  async findAll(): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarRepository.find();
  }

  async findOne(id: string): Promise<RoomPriceCalendarEntity | undefined> {
    return this.roomPriceCalendarRepository.findOne({ where: { id } });
  }

  async update(id: string, calendarData: Partial<RoomPriceCalendarEntity>): Promise<RoomPriceCalendarEntity | undefined> {
    await this.roomPriceCalendarRepository.update(id, calendarData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roomPriceCalendarRepository.delete(id);
  }

  async findByRatePlanId(ratePlanId: string): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarRepository.find({ 
      where: { ratePlanId },
      order: { date: 'ASC' }
    });
  }

  async findByRatePlanIdAndDateRange(ratePlanId: string, startDate: Date, endDate: Date): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarRepository.createQueryBuilder('calendar')
      .where('calendar.ratePlanId = :ratePlanId', { ratePlanId })
      .andWhere('calendar.date >= :startDate', { startDate })
      .andWhere('calendar.date <= :endDate', { endDate })
      .orderBy('calendar.date', 'ASC')
      .getMany();
  }
}
