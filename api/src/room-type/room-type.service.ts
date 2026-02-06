import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomTypeEntity } from './room-type.entity';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomTypeEntity)
    private roomTypeRepository: Repository<RoomTypeEntity>,
  ) {}

  async create(roomTypeData: Partial<RoomTypeEntity>): Promise<RoomTypeEntity> {
    const roomType = this.roomTypeRepository.create(roomTypeData);
    return this.roomTypeRepository.save(roomType);
  }

  async findAll(): Promise<RoomTypeEntity[]> {
    return this.roomTypeRepository.find();
  }

  async findOne(id: string): Promise<RoomTypeEntity | undefined> {
    return this.roomTypeRepository.findOne({ where: { id } });
  }

  async update(id: string, roomTypeData: Partial<RoomTypeEntity>): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, roomTypeData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roomTypeRepository.delete(id);
  }

  async findByHotelId(hotelId: string): Promise<RoomTypeEntity[]> {
    return this.roomTypeRepository.find({ where: { hotelId } });
  }

  async submitForReview(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'pending', updatedBy: userId });
    return this.findOne(id);
  }

  async approve(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'approved', updatedBy: userId });
    return this.findOne(id);
  }

  async reject(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'draft', updatedBy: userId });
    return this.findOne(id);
  }
}
