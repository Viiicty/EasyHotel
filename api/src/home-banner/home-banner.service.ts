import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeBannerEntity } from './home-banner.entity';

@Injectable()
export class HomeBannerService {
  constructor(
    @InjectRepository(HomeBannerEntity)
    private homeBannerRepository: Repository<HomeBannerEntity>,
  ) {}

  async create(bannerData: Partial<HomeBannerEntity>): Promise<HomeBannerEntity> {
    const banner = this.homeBannerRepository.create(bannerData);
    return this.homeBannerRepository.save(banner);
  }

  async findAll(): Promise<HomeBannerEntity[]> {
    return this.homeBannerRepository.find({
      order: { sortNo: 'ASC' }
    });
  }

  async findOne(id: string): Promise<HomeBannerEntity | undefined> {
    return this.homeBannerRepository.findOne({ where: { id } });
  }

  async update(id: string, bannerData: Partial<HomeBannerEntity>): Promise<HomeBannerEntity | undefined> {
    await this.homeBannerRepository.update(id, bannerData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.homeBannerRepository.delete(id);
  }

  async findByCityCode(cityCode: string): Promise<HomeBannerEntity[]> {
    return this.homeBannerRepository.find({ 
      where: { cityCode },
      order: { sortNo: 'ASC' }
    });
  }

  async findActiveBanners(cityCode?: string): Promise<HomeBannerEntity[]> {
    const now = new Date();
    const query = this.homeBannerRepository.createQueryBuilder('banner')
      .where('banner.status = :status', { status: '1' })
      .andWhere('banner.startAt <= :now', { now })
      .andWhere('banner.endAt >= :now', { now });

    if (cityCode) {
      query.andWhere('(banner.cityCode = :cityCode OR banner.cityCode IS NULL)', { cityCode });
    }

    return query.orderBy('banner.sortNo', 'ASC').getMany();
  }

  async findByHotelId(hotelId: string): Promise<HomeBannerEntity[]> {
    return this.homeBannerRepository.find({ where: { hotelId } });
  }
}
