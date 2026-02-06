import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomRatePlanEntity } from './room-rate-plan.entity';

@Injectable()
export class RoomRatePlanService {
  constructor(
    @InjectRepository(RoomRatePlanEntity)
    private roomRatePlanRepository: Repository<RoomRatePlanEntity>,
  ) {}

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
