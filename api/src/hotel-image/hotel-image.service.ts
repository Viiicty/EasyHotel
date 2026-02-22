import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelImageEntity } from './hotel-image.entity';

@Injectable()
export class HotelImageService {
  constructor(
    @InjectRepository(HotelImageEntity)
    private hotelImageRepository: Repository<HotelImageEntity>,
  ) {}

  async create(imageData: Partial<HotelImageEntity>): Promise<HotelImageEntity> {
    const image = this.hotelImageRepository.create(imageData);
    return this.hotelImageRepository.save(image);
  }

  async findAll(): Promise<HotelImageEntity[]> {
    return this.hotelImageRepository.find();
  }

  async findOne(id: string): Promise<HotelImageEntity | undefined> {
    return this.hotelImageRepository.findOne({ where: { id } });
  }

  async update(id: string, imageData: Partial<HotelImageEntity>): Promise<HotelImageEntity | undefined> {
    await this.hotelImageRepository.update(id, imageData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.hotelImageRepository.delete(id);
  }

  async findByHotelId(hotelId: string): Promise<HotelImageEntity[]> {
    return this.hotelImageRepository.find({ 
      where: { hotelId },
      order: { sortNo: 'ASC' }
    });
  }

  async deleteByHotelId(hotelId: string): Promise<void> {
    await this.hotelImageRepository.delete({ hotelId });
  }

  async batchCreate(images: Partial<HotelImageEntity>[]): Promise<HotelImageEntity[]> {
    const createdImages = this.hotelImageRepository.create(images);
    return this.hotelImageRepository.save(createdImages);
  }

  async updateSortOrder(images: Array<{ id: string; sortNo: number }>): Promise<void> {
    await Promise.all(
      images.map(({ id, sortNo }) =>
        this.hotelImageRepository.update(id, { sortNo })
      )
    );
  }
}
