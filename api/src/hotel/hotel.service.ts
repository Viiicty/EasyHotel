import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HotelEntity } from './hotel.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { HotelCoverService } from '../hotel-cover/hotel-cover.service';


@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelEntity)
    private hotelRepository: Repository<HotelEntity>,
    private readonly hotelSubmissionService: HotelSubmissionService,
    private readonly hotelCoverService: HotelCoverService,
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
    return this.hotelRepository.find({
      order: {
        createdTime: 'DESC'
      }
    });
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

  async findByMerchant(merchantId: string): Promise<HotelEntity[]> {
    return this.hotelRepository.find({ 
      where: { merchantId, status: 'APPROVED' },
      order: { createdTime: 'DESC' }
    });
  }

  async findByCityCode(cityCode: string): Promise<HotelEntity[]> {
    return this.hotelRepository.find({ where: { cityCode } });
  }

  async getApprovedHotelsByMerchant(userId: string) {
    return this.hotelRepository
      .createQueryBuilder('hotel')
      .where('hotel.merchantId = :userId', { userId })
      .andWhere('hotel.status = :status', { status: 'APPROVED' })
      .getMany();
  }

  async getAllApprovedHotels() {
    console.log('=== getAllApprovedHotels START ===');
    const query = this.hotelRepository
      .createQueryBuilder('hotel')
      .where('hotel.status = :status', { status: 'APPROVED' });
    
    console.log('Query SQL:', query.getSql());
    
    const result = await query.getMany();
    
    console.log('Found hotels:', result.length);
    console.log('=== getAllApprovedHotels END ===');
    
    return result;
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
    
    const hotelCovers = await this.hotelCoverService.findByHotelIds(hotelIds);
    
    const coverMap = new Map();
    hotelCovers.forEach(cover => {
      if (!coverMap.has(cover.hotelId)) {
        coverMap.set(cover.hotelId, `http://localhost:8888/upload/hotelcover/${cover.url}`);
      }
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
        coverImage: coverMap.get(hotel.id) || defaultCoverImage,
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

    const hotelCovers = await this.hotelCoverService.findByHotelId(id);
    
    console.log('Hotel ID:', id);
    console.log('Found hotel covers:', hotelCovers);

    let coverImage = null;
    if (hotelCovers && hotelCovers.length > 0) {
      coverImage = `http://localhost:8888/upload/hotelcover/${hotelCovers[0].url}`;
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
    minPrice?: number
    maxPrice?: number
  }): Promise<any[]> {
    console.log('=== searchMiniHotels 开始 ===');
    console.log('请求参数:', JSON.stringify(params, null, 2));

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
      console.log('添加城市筛选:', params.cityCode);
    }

    if (params.nameZh) {
      query.andWhere('hotel.nameZh LIKE :nameZh', { nameZh: `%${params.nameZh}%` });
      console.log('添加名称筛选:', params.nameZh);
    }

    if (params.nameEn) {
      query.andWhere('hotel.nameEn LIKE :nameEn', { nameEn: `%${params.nameEn}%` });
    }

    if (params.starLevel) {
      query.andWhere('hotel.starLevel <= :starLevel', { starLevel: params.starLevel });
      console.log('添加星级筛选:', params.starLevel);
    }

    if (params.tags && params.tags.length > 0) {
      const tagConditions = params.tags.map((tag, index) => `hotel.tags::jsonb @> :tag${index}`).join(' AND ');
      const tagParams: any = {};
      params.tags.forEach((tag, index) => {
        tagParams[`tag${index}`] = `"${tag}"`;
      });
      query.andWhere(`(${tagConditions})`, tagParams);
      console.log('添加标签筛选:', params.tags);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    console.log('分页参数 - page:', page, 'pageSize:', pageSize, 'skip:', skip);

    query.skip(skip).take(pageSize);

    console.log('执行基础查询...');
    let hotels = await query.getMany();
    console.log('基础查询结果数量:', hotels.length);

    const { RoomTypeInventoryDailyEntity } = await import('../inventory/room-type-inventory-daily.entity');
    const inventoryRepository = this.dataSource.getRepository(RoomTypeInventoryDailyEntity);

    const { RoomTypePriceDailyEntity } = await import('../room-type-price-daily/room-type-price-daily.entity');
    const priceRepository = this.dataSource.getRepository(RoomTypePriceDailyEntity);

    const { RoomTypeEntity } = await import('../room-type/room-type.entity');
    const roomTypeRepository = this.dataSource.getRepository(RoomTypeEntity);

    if (params.checkIn && params.checkOut) {
      console.log('开始库存筛选...');
      try {
        const checkInDate = new Date(params.checkIn);
        const checkOutDate = new Date(params.checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        const dateList: string[] = [];
        const currentDate = new Date(checkInDate);
        while (currentDate < checkOutDate) {
          dateList.push(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log('日期列表:', dateList);

        if (dateList.length > 0) {
          const roomTypes = await roomTypeRepository
            .createQueryBuilder('rt')
            .select(['rt.id', 'rt.hotelId'])
            .where('rt.status = :status', { status: 'APPROVED' })
            .getMany();

          console.log('找到房型数量:', roomTypes.length);

          const roomTypeIds = roomTypes.map(rt => rt.id);
          const hotelIdFromRoomTypeMap = new Map();
          roomTypes.forEach(rt => hotelIdFromRoomTypeMap.set(rt.id, rt.hotelId));

          if (roomTypeIds.length > 0) {
            const inventoryQuery = inventoryRepository
              .createQueryBuilder('inv')
              .select(['inv.roomTypeId', 'inv.date', 'inv.totalQty', 'inv.usedQty', 'inv.holdQty'])
              .where('inv.date IN (:...dates)', { dates: dateList })
              .andWhere('inv.roomTypeId IN (:...roomTypeIds)', { roomTypeIds });

            const inventories = await inventoryQuery.getMany();
            console.log('找到库存记录数量:', inventories.length);

            const roomTypeInventoryMap = new Map();
            inventories.forEach(inv => {
              if (!roomTypeInventoryMap.has(inv.roomTypeId)) {
                roomTypeInventoryMap.set(inv.roomTypeId, new Map());
              }
              roomTypeInventoryMap.get(inv.roomTypeId)!.set(inv.date, inv);
            });

            const validRoomTypeIds: string[] = [];
            roomTypeIds.forEach(roomTypeId => {
              const inventoryMap = roomTypeInventoryMap.get(roomTypeId);
              if (!inventoryMap) return;

              let hasInventoryEveryDay = true;
              for (const date of dateList) {
                const inv = inventoryMap.get(date);
                if (!inv) {
                  hasInventoryEveryDay = false;
                  break;
                }
                const remaining = (inv.totalQty || 0) - (inv.usedQty || 0) - (inv.holdQty || 0);
                if (remaining <= 0) {
                  hasInventoryEveryDay = false;
                  break;
                }
              }

              if (hasInventoryEveryDay) {
                validRoomTypeIds.push(roomTypeId);
              }
            });

            console.log('有效房型数量:', validRoomTypeIds.length);

            const validHotelIds = new Set(validRoomTypeIds.map(rtId => hotelIdFromRoomTypeMap.get(rtId)));
            console.log('有效酒店ID数量:', validHotelIds.size);
            
            // 只筛选基础查询结果中的酒店，确保满足所有搜索条件的交集
            hotels = hotels.filter(h => validHotelIds.has(h.id));
            console.log('库存筛选后剩余酒店数量:', hotels.length);
          }
        }
      } catch (error) {
        console.error('库存筛选出错:', error);
      }
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      console.log('开始价格筛选...');
      try {
        let priceCheckStart = params.checkIn;
        let priceCheckEnd = params.checkOut;
        
        if (!priceCheckStart || !priceCheckEnd) {
          const today = new Date();
          priceCheckStart = today.toISOString().split('T')[0];
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          priceCheckEnd = tomorrow.toISOString().split('T')[0];
        }

        console.log('价格检查日期范围:', priceCheckStart, '-', priceCheckEnd);

        const priceQuery = priceRepository
          .createQueryBuilder('p')
          .select(['p.roomTypeId', 'p.date', 'p.price'])
          .where('p.date >= :checkIn', { checkIn: priceCheckStart })
          .andWhere('p.date < :checkOut', { checkOut: priceCheckEnd });

        const allPrices = await priceQuery.getMany();
        console.log('找到价格记录数量:', allPrices.length);

        const roomTypePriceMap = new Map();
        allPrices.forEach(p => {
          if (!roomTypePriceMap.has(p.roomTypeId)) {
            roomTypePriceMap.set(p.roomTypeId, []);
          }
          roomTypePriceMap.get(p.roomTypeId)!.push(p.price);
        });

        const roomTypes = await roomTypeRepository
          .createQueryBuilder('rt')
          .select(['rt.id', 'rt.hotelId', 'rt.defaultPrice'])
          .where('rt.status = :status', { status: 'APPROVED' })
          .getMany();

        console.log('找到房型数量:', roomTypes.length);

        const validRoomTypeIds: string[] = [];
        roomTypes.forEach(rt => {
          const priceList = roomTypePriceMap.get(rt.id) || [];
          const prices = priceList.length > 0 ? priceList : [rt.defaultPrice || 0];
          const validPrices = prices.filter(p => p > 0);
          if (validPrices.length > 0) {
            const minRoomTypePrice = Math.min(...validPrices);
            
            if (minRoomTypePrice > 0) {
              let inRange = true;
              if (params.minPrice !== undefined && minRoomTypePrice < params.minPrice) {
                inRange = false;
              }
              if (params.maxPrice !== undefined && minRoomTypePrice > params.maxPrice) {
                inRange = false;
              }
              if (inRange) {
                validRoomTypeIds.push(rt.id);
              }
            }
          }
        });

        console.log('价格筛选后有效房型数量:', validRoomTypeIds.length);
        console.log('价格范围:', params.minPrice, '-', params.maxPrice);

        const validHotelIds = new Set(validRoomTypeIds.map(rtId => roomTypes.find(rt => rt.id === rtId)?.hotelId));
        console.log('价格筛选后有效酒店ID数量:', validHotelIds.size);
        hotels = hotels.filter(h => validHotelIds.has(h.id));
        console.log('价格筛选后剩余酒店数量:', hotels.length);
      } catch (error) {
        console.error('价格筛选出错:', error);
      }
    }

    console.log('=== searchMiniHotels 结束，最终返回酒店数量:', hotels.length, '===');


    const hotelIds = hotels.map(hotel => hotel.id);
    let banners: any[] = [];
    let roomTypes: any[] = [];
    let dailyPrices: any[] = [];
    let nights = 1;

    const defaultCoverImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';
    const coverMap = new Map();

    if (hotelIds.length > 0) {
      const hotelCovers = await this.hotelCoverService.findByHotelIds(hotelIds);
      
      hotelCovers.forEach(cover => {
        if (!coverMap.has(cover.hotelId)) {
          coverMap.set(cover.hotelId, `http://localhost:8888/upload/hotelcover/${cover.url}`);
        }
      });

      roomTypes = await roomTypeRepository
        .createQueryBuilder('rt')
        .select(['rt.hotelId', 'rt.id', 'rt.name', 'rt.status', 'rt.defaultPrice'])
        .where('rt.hotelId IN (:...hotelIds)', { hotelIds })
        .andWhere('rt.status = :status', { status: 'APPROVED' })
        .getMany();

      console.log('Room types from TypeORM:', roomTypes);

      if (params.checkIn && params.checkOut) {
        const checkInDate = new Date(params.checkIn)
        const checkOutDate = new Date(params.checkOut)
        nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
        console.log('入住天数:', nights)

        const { RoomTypePriceDailyEntity } = await import('../room-type-price-daily/room-type-price-daily.entity');

        const priceQuery = priceRepository
          .createQueryBuilder('p')
          .select(['p.roomTypeId', 'p.date', 'p.price'])
          .andWhere('p.roomTypeId IN (:...roomTypeIds)', { roomTypeIds: roomTypes.map(rt => rt.id) })

        if (nights === 0) {
          priceQuery.andWhere('p.date = :checkIn', { checkIn: params.checkIn })
        } else {
          priceQuery.andWhere('p.date >= :checkIn', { checkIn: params.checkIn })
          priceQuery.andWhere('p.date < :checkOut', { checkOut: params.checkOut })
        }

        dailyPrices = await priceQuery.getMany()

        console.log('Daily prices:', dailyPrices);
      }
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
          const totalPrice = dailyPriceList.reduce((sum, p) => sum + parseFloat(p.price), 0)
          console.log(`房型 ${rt.name} 入住${nights}天总价:`, totalPrice)
          return totalPrice
        }
        return parseFloat(rt.defaultPrice || 0) * nights
      }).filter(p => p > 0)

      console.log('房型价格:', prices)
      const minTotalPrice = prices.length > 0 ? Math.min(...prices) : undefined
      
      let minPrice: number | undefined
      if (minTotalPrice !== undefined) {
        const divisor = nights === 0 ? 1 : nights
        minPrice = Math.round(minTotalPrice / divisor)
      }
      console.log('最低总价:', minTotalPrice, '最低均价:', minPrice, '入住天数:', nights)

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
        coverImage: coverMap.get(hotel.id) || defaultCoverImage,
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
    
    const hotelCovers = await this.hotelCoverService.findByHotelIds(hotelIds);
    
    console.log('Hotel IDs:', hotelIds);
    console.log('Found hotel covers:', hotelCovers);

    const coverMap = new Map();
    hotelCovers.forEach(cover => {
      if (!coverMap.has(cover.hotelId)) {
        coverMap.set(cover.hotelId, `http://localhost:8888/upload/hotelcover/${cover.url}`);
      }
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
        coverImage: coverMap.get(hotel.id) || defaultCoverImage,
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
