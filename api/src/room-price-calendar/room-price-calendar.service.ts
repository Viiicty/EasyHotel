import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomPriceCalendarEntity } from './room-price-calendar.entity';

@Injectable()
export class RoomPriceCalendarService {
  constructor(
    @InjectRepository(RoomPriceCalendarEntity)
    private roomPriceCalendarRepository: Repository<RoomPriceCalendarEntity>,
  ) {}

  async assertRatePlanOperable(userId: string, ratePlanId: string) {
    const result = await this.roomPriceCalendarRepository.query(`
      SELECT 
        h.id as hotel_id,
        h.status as hotel_status,
        rt.status as room_type_status,
        rp.status as rate_plan_status,
        h.merchant_id
      FROM room_rate_plan rp
      JOIN room_type rt ON rt.id = rp.room_type_id
      JOIN hotel h ON h.id = rt.hotel_id
      WHERE rp.id = $1
    `, [ratePlanId]);

    if (!result || result.length === 0) {
      throw new ForbiddenException('售卖方案不存在');
    }

    const data = result[0];
    if (data.hotel_status !== 'APPROVED') {
      throw new ForbiddenException('酒店未审核通过，无法操作');
    }

    if (data.room_type_status !== 'APPROVED') {
      throw new ForbiddenException('房型未审核通过，无法操作');
    }

    if (data.rate_plan_status !== 'ACTIVE') {
      throw new ForbiddenException('售卖方案未激活，无法操作');
    }

    if (data.merchant_id !== userId) {
      throw new ForbiddenException('无权操作此售卖方案');
    }
  }

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

  async findByRatePlanId(userId: string, ratePlanId: string): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarRepository.createQueryBuilder('calendar')
      .innerJoin('calendar.ratePlan', 'rp')
      .innerJoin('rp.roomType', 'rt')
      .innerJoin('rt.hotel', 'h')
      .where('calendar.ratePlanId = :ratePlanId', { ratePlanId })
      .andWhere('h.status = :hotelStatus', { hotelStatus: 'APPROVED' })
      .andWhere('rt.status = :roomTypeStatus', { roomTypeStatus: 'APPROVED' })
      .andWhere('rp.status = :ratePlanStatus', { ratePlanStatus: 'ACTIVE' })
      .andWhere('h.merchantId = :userId', { userId })
      .orderBy('calendar.date', 'ASC')
      .getMany();
  }

  async findByRatePlanIdAndDateRange(userId: string, ratePlanId: string, startDate: Date, endDate: Date): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarRepository.createQueryBuilder('calendar')
      .innerJoin('calendar.ratePlan', 'rp')
      .innerJoin('rp.roomType', 'rt')
      .innerJoin('rt.hotel', 'h')
      .where('calendar.ratePlanId = :ratePlanId', { ratePlanId })
      .andWhere('calendar.date >= :startDate', { startDate })
      .andWhere('calendar.date <= :endDate', { endDate })
      .andWhere('h.status = :hotelStatus', { hotelStatus: 'APPROVED' })
      .andWhere('rt.status = :roomTypeStatus', { roomTypeStatus: 'APPROVED' })
      .andWhere('rp.status = :ratePlanStatus', { ratePlanStatus: 'ACTIVE' })
      .andWhere('h.merchantId = :userId', { userId })
      .orderBy('calendar.date', 'ASC')
      .getMany();
  }

  async getDailyPrices(userId: string, ratePlanIds: string[], from: Date, to: Date): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarRepository.createQueryBuilder('calendar')
      .innerJoin('calendar.ratePlan', 'rp')
      .innerJoin('rp.roomType', 'rt')
      .innerJoin('rt.hotel', 'h')
      .where('calendar.ratePlanId IN (:...ratePlanIds)', { ratePlanIds })
      .andWhere('calendar.date >= :from', { from })
      .andWhere('calendar.date <= :to', { to })
      .andWhere('h.status = :hotelStatus', { hotelStatus: 'APPROVED' })
      .andWhere('rt.status = :roomTypeStatus', { roomTypeStatus: 'APPROVED' })
      .andWhere('rp.status = :ratePlanStatus', { ratePlanStatus: 'ACTIVE' })
      .andWhere('h.merchantId = :userId', { userId })
      .orderBy('calendar.ratePlanId', 'ASC')
      .addOrderBy('calendar.date', 'ASC')
      .getMany();
  }

  async updateDailyPrice(userId: string, ratePlanId: string, date: Date, price: number): Promise<RoomPriceCalendarEntity> {
    await this.assertRatePlanOperable(userId, ratePlanId);

    const result = await this.roomPriceCalendarRepository.createQueryBuilder('calendar')
      .insert()
      .into(RoomPriceCalendarEntity)
      .values({
        ratePlanId,
        date,
        price,
      })
      .orUpdate(['price', 'updatedTime'], ['ratePlanId', 'date'])
      .returning('*')
      .execute();

    return result.raw[0];
  }
}
