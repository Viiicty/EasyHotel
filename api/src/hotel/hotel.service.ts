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

  async getMiniHotelsByCityCode(cityCode: string, date?: string): Promise<any[]> {
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

    const { RoomTypeEntity } = await import('../room-type/room-type.entity');
    const roomTypeRepository = this.dataSource.getRepository(RoomTypeEntity);

    const roomTypes = await roomTypeRepository
      .createQueryBuilder('rt')
      .select(['rt.hotelId', 'rt.id', 'rt.name', 'rt.status', 'rt.defaultPrice'])
      .where('rt.hotelId IN (:...hotelIds)', { hotelIds })
      .andWhere('rt.status = :status', { status: 'APPROVED' })
      .getMany();

    console.log('Room types from TypeORM:', roomTypes);

    let dailyPrices: any[] = []
    if (date) {
      const { RoomTypePriceDailyEntity } = await import('../room-type-price-daily/room-type-price-daily.entity');
      const priceRepository = this.dataSource.getRepository(RoomTypePriceDailyEntity);

      dailyPrices = await priceRepository
        .createQueryBuilder('p')
        .select(['p.roomTypeId', 'p.price'])
        .where('p.date = :date', { date })
        .andWhere('p.roomTypeId IN (:...roomTypeIds)', { roomTypeIds: roomTypes.map(rt => rt.id) })
        .getMany();

      console.log('Daily prices:', dailyPrices);
    }

    const priceMap = new Map();
    dailyPrices.forEach(p => {
      priceMap.set(p.roomTypeId, p.price);
    });

    const roomTypeMap = new Map();
    roomTypes.forEach(rt => {
      if (!roomTypeMap.has(rt.hotelId)) {
        roomTypeMap.set(rt.hotelId, []);
      }
      roomTypeMap.get(rt.hotelId)!.push(rt);
    });

    return hotels.map(hotel => {
      const hotelRoomTypes = roomTypeMap.get(hotel.id) || []
      const approvedRoomTypes = hotelRoomTypes.filter(rt => rt.status === 'APPROVED')
      console.log('酒店:', hotel.nameZh, '房型数量:', hotelRoomTypes.length, '已审核房型数量:', approvedRoomTypes.length)

      const prices = approvedRoomTypes.map(rt => {
        const dailyPrice = priceMap.get(rt.id)
        if (dailyPrice && dailyPrice > 0) {
          return parseFloat(dailyPrice)
        }
        return parseFloat(rt.defaultPrice || 0)
      }).filter(p => p > 0)

      console.log('房型价格:', prices)
      const minPrice = prices.length > 0 ? Math.min(...prices) : undefined
      console.log('最低价格:', minPrice)

      return {
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
        coverImage: bannerMap.get(hotel.id) || defaultCoverImage,
        minPrice
      }
    })
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
    checkIn?: string
    checkOut?: string
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

    const { RoomTypeEntity } = await import('../room-type/room-type.entity');
    const roomTypeRepository = this.dataSource.getRepository(RoomTypeEntity);

    const roomTypes = await roomTypeRepository
      .createQueryBuilder('rt')
      .select(['rt.hotelId', 'rt.id', 'rt.name', 'rt.status', 'rt.defaultPrice'])
      .where('rt.hotelId IN (:...hotelIds)', { hotelIds })
      .andWhere('rt.status = :status', { status: 'APPROVED' })
      .getMany();

    console.log('Room types from TypeORM:', roomTypes);

    let dailyPrices: any[] = []
    let nights = 1

    if (params.checkIn && params.checkOut) {
      const checkInDate = new Date(params.checkIn)
      const checkOutDate = new Date(params.checkOut)
      nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      console.log('入住天数:', nights)

      const { RoomTypePriceDailyEntity } = await import('../room-type-price-daily/room-type-price-daily.entity');
      const priceRepository = this.dataSource.getRepository(RoomTypePriceDailyEntity);

      dailyPrices = await priceRepository
        .createQueryBuilder('p')
        .select(['p.roomTypeId', 'p.date', 'p.price'])
        .where('p.date >= :checkIn', { checkIn: params.checkIn })
        .andWhere('p.date < :checkOut', { checkOut: params.checkOut })
        .andWhere('p.roomTypeId IN (:...roomTypeIds)', { roomTypeIds: roomTypes.map(rt => rt.id) })
        .getMany();

      console.log('Daily prices:', dailyPrices);
    }

    const priceMap = new Map();
    dailyPrices.forEach(p => {
      if (!priceMap.has(p.roomTypeId)) {
        priceMap.set(p.roomTypeId, []);
      }
      priceMap.get(p.roomTypeId)!.push({ date: p.date, price: p.price });
    });

    const roomTypeMap = new Map();
    roomTypes.forEach(rt => {
      if (!roomTypeMap.has(rt.hotelId)) {
        roomTypeMap.set(rt.hotelId, []);
      }
      roomTypeMap.get(rt.hotelId)!.push(rt);
    });

    return hotels.map(hotel => {
      const hotelRoomTypes = roomTypeMap.get(hotel.id) || []
      const approvedRoomTypes = hotelRoomTypes.filter(rt => rt.status === 'APPROVED')
      console.log('酒店:', hotel.nameZh, '房型数量:', hotelRoomTypes.length, '已审核房型数量:', approvedRoomTypes.length)

      const prices = approvedRoomTypes.map(rt => {
        const dailyPriceList = priceMap.get(rt.id) || []
        if (dailyPriceList.length > 0) {
          const minDailyPrice = Math.min(...dailyPriceList.map(p => parseFloat(p.price)))
          console.log(`房型 ${rt.name} 每日最低价格:`, minDailyPrice)
          if (nights === 1) {
            return minDailyPrice
          } else {
            return minDailyPrice / nights
          }
        }
        return parseFloat(rt.defaultPrice || 0)
      }).filter(p => p > 0)

      console.log('房型价格:', prices)
      const minPrice = prices.length > 0 ? Math.min(...prices) : undefined
      console.log('最低价格:', minPrice)

      return {
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
        coverImage: bannerMap.get(hotel.id) || defaultCoverImage,
        minPrice
      }
    })
  }

  async getRandomRecommendHotels(limit: number = 4, date?: string): Promise<any[]> {
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

    const { RoomTypeEntity } = await import('../room-type/room-type.entity');
    const roomTypeRepository = this.dataSource.getRepository(RoomTypeEntity);

    const roomTypes = await roomTypeRepository
      .createQueryBuilder('rt')
      .select(['rt.hotelId', 'rt.id', 'rt.name', 'rt.status', 'rt.defaultPrice'])
      .where('rt.hotelId IN (:...hotelIds)', { hotelIds })
      .andWhere('rt.status = :status', { status: 'APPROVED' })
      .getMany();

    console.log('Room types from TypeORM:', roomTypes);

    const roomTypeMap = new Map();
    roomTypes.forEach(rt => {
      if (!roomTypeMap.has(rt.hotelId)) {
        roomTypeMap.set(rt.hotelId, []);
      }
      roomTypeMap.get(rt.hotelId)!.push(rt);
    });

    let dailyPrices: any[] = []
    if (date) {
      const { RoomTypePriceDailyEntity } = await import('../room-type-price-daily/room-type-price-daily.entity');
      const priceRepository = this.dataSource.getRepository(RoomTypePriceDailyEntity);

      dailyPrices = await priceRepository
        .createQueryBuilder('p')
        .select(['p.roomTypeId', 'p.price'])
        .where('p.date = :date', { date })
        .andWhere('p.roomTypeId IN (:...roomTypeIds)', { roomTypeIds: roomTypes.map(rt => rt.id) })
        .getMany();

      console.log('Daily prices:', dailyPrices);
    }

    const priceMap = new Map();
    dailyPrices.forEach(p => {
      priceMap.set(p.roomTypeId, p.price);
    });

    return hotels.map(hotel => {
      const hotelRoomTypes = roomTypeMap.get(hotel.id) || []
      const approvedRoomTypes = hotelRoomTypes.filter(rt => rt.status === 'APPROVED')
      console.log('酒店:', hotel.nameZh, '房型数量:', hotelRoomTypes.length, '已审核房型数量:', approvedRoomTypes.length)

      const prices = approvedRoomTypes.map(rt => {
        const dailyPrice = priceMap.get(rt.id)
        if (dailyPrice && dailyPrice > 0) {
          return parseFloat(dailyPrice)
        }
        return parseFloat(rt.defaultPrice || 0)
      }).filter(p => p > 0)

      console.log('房型价格:', prices)
      const minPrice = prices.length > 0 ? Math.min(...prices) : undefined
      console.log('最低价格:', minPrice)

      return {
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
        coverImage: bannerMap.get(hotel.id) || defaultCoverImage,
        minPrice
      }
    })
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
