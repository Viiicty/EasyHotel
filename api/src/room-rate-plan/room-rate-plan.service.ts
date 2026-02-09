import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomRatePlanEntity } from './room-rate-plan.entity';

@Injectable()
export class RoomRatePlanService {
  constructor(
    @InjectRepository(RoomRatePlanEntity)
    private roomRatePlanRepository: Repository<RoomRatePlanEntity>,
  ) {}

  async assertRatePlanOperable(userId: string, ratePlanId: string) {
    const result = await this.roomRatePlanRepository.query(`
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

  async create(ratePlanData: Partial<RoomRatePlanEntity>): Promise<RoomRatePlanEntity> {
    const ratePlan = this.roomRatePlanRepository.create(ratePlanData);
    return this.roomRatePlanRepository.save(ratePlan);
  }

  async findAll(): Promise<RoomRatePlanEntity[]> {
    return this.roomRatePlanRepository.find();
  }

  async findOne(id: string): Promise<RoomRatePlanEntity | undefined> {
    return this.roomRatePlanRepository.findOne({ where: { id } });
  }

  async update(id: string, ratePlanData: Partial<RoomRatePlanEntity>): Promise<RoomRatePlanEntity | undefined> {
    await this.roomRatePlanRepository.update(id, ratePlanData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roomRatePlanRepository.delete(id);
  }

  async findByRoomTypeId(roomTypeId: string): Promise<RoomRatePlanEntity[]> {
    return this.roomRatePlanRepository.find({ where: { roomTypeId } });
  }
}
