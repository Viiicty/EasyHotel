import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeBannerEntity } from './home-banner.entity';
import * as fs from 'fs';
import * as path from 'path';
import { HotelService } from '../hotel/hotel.service';

@Injectable()
export class HomeBannerService {
  constructor(
    @InjectRepository(HomeBannerEntity)
    private homeBannerRepository: Repository<HomeBannerEntity>,
    private hotelService: HotelService,
  ) {}

  private getImageAsBase64(filename: string): string | null {
    try {
      const filePath = path.join('./banner', filename);
      if (fs.existsSync(filePath)) {
        const imageBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).slice(1);
        return `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
      }
      return null;
    } catch (error) {
      console.error('Error reading image:', error);
      return null;
    }
  }

  async create(bannerData: Partial<HomeBannerEntity>): Promise<HomeBannerEntity> {
    const { hotelId, ...data } = bannerData;
    
    let cityCode = data.cityCode;
    
    if (hotelId && !cityCode) {
      const hotel = await this.hotelService.findOne(hotelId);
      if (hotel) {
        cityCode = hotel.cityCode;
      }
    }
    
    const banner = this.homeBannerRepository.create({
      ...data,
      hotelId,
      cityCode
    });
    return this.homeBannerRepository.save(banner);
  }

  async findAll(): Promise<HomeBannerEntity[]> {
    return this.homeBannerRepository.find({
      relations: ['hotel'],
      order: { sortNo: 'ASC' }
    });
  }

  async findOne(id: string): Promise<HomeBannerEntity | undefined> {
    return this.homeBannerRepository.findOne({ 
      where: { id },
      relations: ['hotel']
    });
  }

  async update(id: string, bannerData: Partial<HomeBannerEntity>): Promise<HomeBannerEntity | undefined> {
    await this.homeBannerRepository.update(id, bannerData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.homeBannerRepository.delete(id);
  }

  async findByCityCode(cityCode: string): Promise<HomeBannerEntity[]> {
    const banners = await this.homeBannerRepository.find({
      where: { cityCode, status: 'UP' },
      relations: ['hotel'],
      order: { sortNo: 'ASC' }
    });
    return banners.map(banner => ({
      ...banner,
      coverImage: this.getImageAsBase64(banner.coverImage) || banner.coverImage,
      hotel: banner.hotel ? { ...banner.hotel, coverImage: undefined } : undefined
    }));
  }

  async findActiveBanners(): Promise<HomeBannerEntity[]> {
    const banners = await this.homeBannerRepository.find({
      where: { status: 'UP' },
      relations: ['hotel'],
      order: { sortNo: 'ASC' }
    });
    return banners.map(banner => ({
      ...banner,
      coverImage: banner.coverImage ? `http://localhost:8888/upload/banner/${banner.coverImage}` : null,
      hotel: banner.hotel ? { ...banner.hotel, coverImage: undefined } : undefined
    }));
  }

  async findByHotelId(hotelId: string): Promise<HomeBannerEntity[]> {
    const banners = await this.homeBannerRepository
      .createQueryBuilder('banner')
      .leftJoin('banner.hotel', 'hotel')
      .where('hotel.id = :hotelId', { hotelId })
      .orderBy('banner.sortNo', 'ASC')
      .getMany();
    return banners.map(banner => ({
      ...banner,
      coverImage: this.getImageAsBase64(banner.coverImage) || banner.coverImage,
      hotel: banner.hotel ? { ...banner.hotel, coverImage: undefined } : undefined
    }));
  }
}
