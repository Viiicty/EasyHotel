import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmenityEntity } from './amenity.entity';

@Injectable()
export class AmenityService {
  constructor(
    @InjectRepository(AmenityEntity)
    private amenityRepository: Repository<AmenityEntity>,
  ) {}

  async create(amenityData: Partial<AmenityEntity>): Promise<AmenityEntity> {
    const amenity = this.amenityRepository.create(amenityData);
    return this.amenityRepository.save(amenity);
  }

  async findAll(): Promise<AmenityEntity[]> {
    return this.amenityRepository.find();
  }

  async findOne(id: string): Promise<AmenityEntity | undefined> {
    return this.amenityRepository.findOne({ where: { id } });
  }

  async update(id: string, amenityData: Partial<AmenityEntity>): Promise<AmenityEntity | undefined> {
    await this.amenityRepository.update(id, amenityData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.amenityRepository.delete(id);
  }

  async findByCategory(category: string): Promise<AmenityEntity[]> {
    return this.amenityRepository.find({ where: { category } });
  }
}
