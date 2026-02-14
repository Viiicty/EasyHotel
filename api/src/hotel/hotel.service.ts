import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HotelEntity } from './hotel.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { HomeBannerEntity } from '../home-banner/home-banner.entity';


@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelEntity)
    private hotelRepository: Repository<HotelEntity>,
    @InjectRepository(HomeBannerEntity)
    private homeBannerRepository: Repository<HomeBannerEntity>,
    private readonly hotelSubmissionService: HotelSubmissionService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(hotelData: Partial<HotelEntity>): Promise<HotelEntity> {
    console.log('Creating hotel with data:', JSON.stringify(hotelData, null, 2));
    console.log('Tags field:', hotelData.tags);
    console.log('Tags type:', typeof hotelData.tags);
    console.log('Tags isArray:', Array.isArray(hotelData.tags));
    
    const hotel = this.hotelRepository.create(hotelData);
    const savedHotel = await this.hotelRepository.save(hotel);
    
    console.log('Saved hotel:', JSON.stringify(savedHotel, null, 2));
    
    return savedHotel;
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

  // 审核酒店提交
  async audit(id: string, hotelData: { status: string; rejectReason?: string ;cityCode?: string,coverImage?: string}, reviewedBy: string): Promise<HotelEntity | undefined> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      // 第一步：在 hotel_submission 表中新增一条记录
      await this.hotelSubmissionService.create({
        hotelId: id, //记录关联的酒店ID
        ...hotelData,//记录审核状态、驳回原因
        reviewedBy,  //记录审核人
        createdBy: reviewedBy, //记录创建人
        updatedBy: reviewedBy, //记录更新人
      }, queryRunner.manager);
      
      // 第二步：更新 hotel 表中的 status 字段
      await queryRunner.manager.getRepository(HotelEntity)
      .update(id, { 
        status: hotelData.status, updatedBy: reviewedBy 
      });
      
      const hotel = await queryRunner.manager.getRepository(HotelEntity)
      .findOne({ where: { id } });
              
      //第三步：将hotel表中的hotel_id、cityCode、coverImage写入homebanner表中
      await queryRunner.manager.getRepository(HomeBannerEntity)
      .insert({
        hotel: { id },
        cityCode: hotel?.cityCode,
        coverImage: hotel?.coverImage,
        createdBy: reviewedBy, //记录创建人
        status: "PENDING",
      });
      
      const updatedHotel = await this.findOne(id);
      
      await queryRunner.commitTransaction();
      
      return updatedHotel;
    } catch (error) {  //如果出现异常，回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  async getApprovedHotelsByMerchant(userId: string) {
    return this.hotelRepository
      .createQueryBuilder('hotel')
      .where('hotel.merchantId = :userId', { userId })
      .getMany();
  }

  async updateAvailableStatus(id: string, available: string): Promise<HotelEntity | undefined> {
    await this.hotelRepository.update(id, { available });
    return this.findOne(id);
  }

  async getOnlineManageList(filters?: { available?: string; city?: string; keyword?: string }) {
    const query = this.hotelRepository
      .createQueryBuilder('hotel')
      .leftJoin('hotel.merchant', 'merchant')
      .select([
        'hotel.id',
        'hotel.nameZh',
        'hotel.nameEn',
        'hotel.cityCode',
        'hotel.starLevel',
        'hotel.status',
        'hotel.available',
        'hotel.createdTime',
        'hotel.updatedTime',
        
        'merchant.id',
        'merchant.name'
      ])
      .where('hotel.status = :status', { status: 'APPROVED' });

    if (filters?.keyword) {
      query.andWhere('(hotel.nameZh LIKE :keyword OR hotel.nameEn LIKE :keyword OR merchant.name LIKE :keyword)', 
        { keyword: `%${filters.keyword}%` });
    }

    if (filters?.city) {
      query.andWhere('hotel.cityCode = :city', { city: filters.city });
    }

    if (filters?.available) {
      query.andWhere('hotel.available = :available', { available: filters.available });
    }

    const hotels = await query.getMany();

    return hotels.map(hotel => ({
      id: hotel.id,
      hotelName: hotel.nameZh,
      hotelNameEn: hotel.nameEn,
      merchant: hotel.merchant?.name || '',
      city: hotel.cityCode,
      starLevel: hotel.starLevel,
      available: hotel.available,
      createdAt: hotel.createdTime,
      updatedAt: hotel.updatedTime
    }));
  }

/************************小程序*****************************/

  async getMiniHotelsByCityCode(cityCode: string): Promise<any[]> {
    const hotels = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select([
        'hotel.id',
        'hotel.nameZh',
        'hotel.nameEn',
        'hotel.cityCode',
        'hotel.starLevel',
        'hotel.status',
        'hotel.available',
        'hotel.address',
        'hotel.facilities',
        'hotel.tags',
        'hotel.checkInTime',
        'hotel.checkOutTime',
        'hotel.cancelPolicy',
        'hotel.changePolicy',
        'hotel.extraBedPolicy',
        'hotel.createdTime',
        'hotel.updatedTime'
      ])
      .where('hotel.cityCode = :cityCode', { cityCode })
      .andWhere('hotel.status = :status', { status: 'APPROVED' })
      .andWhere('hotel.available = :available', { available: 'UP' })
      .getMany();

    return hotels.map(hotel => ({
      id: hotel.id,
      hotelName: hotel.nameZh,
      hotelNameEn: hotel.nameEn,
      city: hotel.cityCode,
      starLevel: hotel.starLevel,
      status: hotel.status,
      available: hotel.available,
      address: hotel.address,
      facilities: hotel.facilities,
      tags: hotel.tags,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      cancelPolicy: hotel.cancelPolicy,
      changePolicy: hotel.changePolicy,
      extraBedPolicy: hotel.extraBedPolicy,
      createdAt: hotel.createdTime,
      updatedAt: hotel.updatedTime
    }));
  }

  async getMiniHotelDetail(id: string): Promise<any> {
    const hotel = await this.hotelRepository
      .createQueryBuilder('hotel')
      .where('hotel.id = :id', { id })
      .getOne();

    if (!hotel) {
      return null;
    }

    const banner = await this.dataSource.query(
      'SELECT * FROM home_banner WHERE hotel_id = $1 ORDER BY "sortNo" ASC LIMIT 1',
      [id]
    );

    console.log('Hotel ID:', id);
    console.log('Found banner:', banner);

    let coverImage = null;
    if (banner && banner.length > 0 && banner[0].coverImage) {
      coverImage = `http://192.168.3.22:8888/upload/image/${banner[0].coverImage}`;
    } else {
      coverImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';
    }

    return {
      id: hotel.id,
      hotelName: hotel.nameZh,
      hotelNameEn: hotel.nameEn,
      address: hotel.address,
      city: hotel.cityCode,
      starLevel: hotel.starLevel,
      status: hotel.status,
      available: hotel.available,
      facilities: hotel.facilities,
      tags: hotel.tags,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      cancelPolicy: hotel.cancelPolicy,
      changePolicy: hotel.changePolicy,
      extraBedPolicy: hotel.extraBedPolicy,
      createdAt: hotel.createdTime,
      updatedAt: hotel.updatedTime,
      coverImage: coverImage
    };
  }

  async searchMiniHotels(params: {
    cityCode?: string
    nameZh?: string
    nameEn?: string
    starLevel?: number
    tags?: string[]
    page?: number
    pageSize?: number
  }): Promise<any[]> {
    const query = this.hotelRepository
      .createQueryBuilder('hotel')
      .select([
        'hotel.id',
        'hotel.nameZh',
        'hotel.nameEn',
        'hotel.cityCode',
        'hotel.starLevel',
        'hotel.status',
        'hotel.available',
        'hotel.address',
        'hotel.facilities',
        'hotel.tags',
        'hotel.checkInTime',
        'hotel.checkOutTime',
        'hotel.cancelPolicy',
        'hotel.changePolicy',
        'hotel.extraBedPolicy',
        'hotel.createdTime',
        'hotel.updatedTime'
      ])
      .where('hotel.status = :status', { status: 'APPROVED' })
      .andWhere('hotel.available = :available', { available: 'UP' });

    if (params.cityCode) {
      query.andWhere('hotel.cityCode = :cityCode', { cityCode: params.cityCode });
    }

    if (params.nameZh) {
      query.andWhere('hotel.nameZh LIKE :nameZh', { nameZh: `%${params.nameZh}%` });
    }

    if (params.nameEn) {
      query.andWhere('hotel.nameEn LIKE :nameEn', { nameEn: `%${params.nameEn}%` });
    }

    if (params.starLevel) {
      query.andWhere('hotel.starLevel <= :starLevel', { starLevel: params.starLevel });
    }

    if (params.tags && params.tags.length > 0) {
      const tagConditions = params.tags.map((tag, index) => `hotel.tags::jsonb @> :tag${index}`).join(' AND ');
      const tagParams: any = {};
      params.tags.forEach((tag, index) => {
        tagParams[`tag${index}`] = `"${tag}"`;
      });
      query.andWhere(`(${tagConditions})`, tagParams);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    query.skip(skip).take(pageSize);

    const hotels = await query.getMany();

    const hotelIds = hotels.map(hotel => hotel.id);
    const banners = await this.dataSource.query(
      'SELECT * FROM home_banner WHERE hotel_id = ANY($1) ORDER BY "sortNo" ASC',
      [hotelIds]
    );

    const bannerMap = new Map();
    banners.forEach(banner => {
      bannerMap.set(banner.hotel_id, `http://192.168.3.22:8888/upload/image/${banner.coverImage}`);
    });

    const defaultCoverImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';

    return hotels.map(hotel => ({
      id: hotel.id,
      hotelName: hotel.nameZh,
      hotelNameEn: hotel.nameEn,
      city: hotel.cityCode,
      starLevel: hotel.starLevel,
      status: hotel.status,
      available: hotel.available,
      address: hotel.address,
      facilities: hotel.facilities,
      tags: hotel.tags,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      cancelPolicy: hotel.cancelPolicy,
      changePolicy: hotel.changePolicy,
      extraBedPolicy: hotel.extraBedPolicy,
      createdAt: hotel.createdTime,
      updatedAt: hotel.updatedTime,
      coverImage: bannerMap.get(hotel.id) || defaultCoverImage
    }));
  }

  async getRandomRecommendHotels(limit: number = 4): Promise<any[]> {
    const hotels = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select([
        'hotel.id',
        'hotel.nameZh',
        'hotel.nameEn',
        'hotel.cityCode',
        'hotel.starLevel',
        'hotel.status',
        'hotel.available',
        'hotel.address',
        'hotel.facilities',
        'hotel.tags',
        'hotel.checkInTime',
        'hotel.checkOutTime',
        'hotel.cancelPolicy',
        'hotel.changePolicy',
        'hotel.extraBedPolicy',
        'hotel.createdTime',
        'hotel.updatedTime'
      ])
      .where('hotel.status = :status', { status: 'APPROVED' })
      .andWhere('hotel.available = :available', { available: 'UP' })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    const hotelIds = hotels.map(hotel => hotel.id);
    const banners = await this.dataSource.query(
      'SELECT * FROM home_banner WHERE hotel_id = ANY($1) ORDER BY "sortNo" ASC',
      [hotelIds]
    );

    console.log('Hotel IDs:', hotelIds);
    console.log('Found banners:', banners);

    const bannerMap = new Map();
    banners.forEach(banner => {
      bannerMap.set(banner.hotel_id, `http://192.168.3.22:8888/upload/image/${banner.coverImage}`);
    });

    const defaultCoverImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';

    return hotels.map(hotel => ({
      id: hotel.id,
      hotelName: hotel.nameZh,
      hotelNameEn: hotel.nameEn,
      city: hotel.cityCode,
      starLevel: hotel.starLevel,
      status: hotel.status,
      available: hotel.available,
      address: hotel.address,
      facilities: hotel.facilities,
      tags: hotel.tags,
      checkInTime: hotel.checkInTime,
      checkOutTime: hotel.checkOutTime,
      cancelPolicy: hotel.cancelPolicy,
      changePolicy: hotel.changePolicy,
      extraBedPolicy: hotel.extraBedPolicy,
      createdAt: hotel.createdTime,
      updatedAt: hotel.updatedTime,
      coverImage: bannerMap.get(hotel.id) || defaultCoverImage
    }));
  }

  async getAllTags(): Promise<string[]> {
    const hotels = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select(['hotel.tags'])
      .where('hotel.status = :status', { status: 'APPROVED' })
      .andWhere('hotel.available = :available', { available: 'UP' })
      .andWhere('hotel.tags IS NOT NULL')
      .getMany();

    const allTags = new Set<string>();
    hotels.forEach(hotel => {
      if (hotel.tags && Array.isArray(hotel.tags)) {
        hotel.tags.forEach(tag => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }
}
