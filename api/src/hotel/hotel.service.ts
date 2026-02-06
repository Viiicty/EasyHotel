import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelEntity } from './hotel.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelEntity)
    private hotelRepository: Repository<HotelEntity>,
  ) {}

  async create(hotelData: Partial<HotelEntity>): Promise<HotelEntity> {
    const hotel = this.hotelRepository.create(hotelData);
    return this.hotelRepository.save(hotel);
  }

  async findAll(): Promise<HotelEntity[]> {
    return this.hotelRepository.find();
  }

  async findOne(id: string): Promise<HotelEntity | undefined> {
    return this.hotelRepository.findOne({ where: { id } });
  }

  async update(id: string, hotelData: Partial<HotelEntity>): Promise<HotelEntity | undefined> {
    await this.hotelRepository.update(id, hotelData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.hotelRepository.delete(id);
  }

  async findByMerchantId(merchantId: string): Promise<HotelEntity[]> {
    return this.hotelRepository.find({ where: { merchantId } });
  }

  async findByCityCode(cityCode: string): Promise<HotelEntity[]> {
    return this.hotelRepository.find({ where: { cityCode } });
  }
}
