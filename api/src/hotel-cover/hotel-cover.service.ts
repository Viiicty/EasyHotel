import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { HotelCoverEntity } from './hotel-cover.entity';

@Injectable()
export class HotelCoverService {
  constructor(
    @InjectRepository(HotelCoverEntity)
    private hotelCoverRepository: Repository<HotelCoverEntity>,
  ) {}

  async create(coverData: Partial<HotelCoverEntity>): Promise<HotelCoverEntity> {
    const { hotel, ...data } = coverData;
    const cover = this.hotelCoverRepository.create(data);
    return this.hotelCoverRepository.save(cover);
  }

  async findAll(): Promise<HotelCoverEntity[]> {
    return this.hotelCoverRepository.find({
      order: {
        createdTime: 'DESC'
      }
    });
  }

  async findByHotelId(hotelId: string): Promise<HotelCoverEntity[]> {
    return this.hotelCoverRepository.find({
      where: { hotelId },
      order: {
        createdTime: 'DESC'
      }
    });
  }

  async findByHotelIds(hotelIds: string[]): Promise<HotelCoverEntity[]> {
    return this.hotelCoverRepository.find({
      where: { hotelId: In(hotelIds) },
      order: {
        createdTime: 'DESC'
      }
    });
  }

  async findOne(id: string): Promise<HotelCoverEntity | undefined> {
    return this.hotelCoverRepository.findOne({ where: { id } });
  }

  async update(id: string, coverData: Partial<HotelCoverEntity>): Promise<HotelCoverEntity | undefined> {
    await this.hotelCoverRepository.update(id, coverData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.hotelCoverRepository.delete(id);
  }

  async removeByHotelId(hotelId: string): Promise<void> {
    await this.hotelCoverRepository.delete({ hotelId });
  }
}
