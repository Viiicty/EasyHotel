import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HotelEntity } from './hotel.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { HomeBannerEntity } from 'src/home-banner/home-banner.entity';


@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(HotelEntity)
    private hotelRepository: Repository<HotelEntity>,
    private readonly hotelSubmissionService: HotelSubmissionService,
    @InjectDataSource()
    private dataSource: DataSource,
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
      .andWhere('hotel.status = :status', { status: 'APPROVED' })
      .select([
        'hotel.id as "hotelId"',
        'hotel.nameZh as "nameZh"',
        'hotel.status as "status"'
      ])
      .getRawMany();
  }

  async updateAvailableStatus(id: string, available: string): Promise<HotelEntity | undefined> {
    await this.hotelRepository.update(id, { available });
    return this.findOne(id);
  }

  async getOnlineManageList(filters?: { status?: string; city?: string; keyword?: string; available?: string }) {
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

    const hotelIds = hotels.map(h => h.id);
    const roomTypeCounts = await this.dataSource.query(`
      SELECT hotel_id, COUNT(*) as room_type_count
      FROM room_type
      WHERE hotel_id = ANY($1) AND status = 'APPROVED'
      GROUP BY hotel_id
    `, [hotelIds]);

    const roomTypeCountMap = new Map();
    roomTypeCounts.forEach(row => {
      roomTypeCountMap.set(row.hotel_id, parseInt(row.room_type_count));
    });

    return hotels.map(hotel => ({
      id: hotel.id,
      hotelName: hotel.nameZh,
      hotelNameEn: hotel.nameEn,
      merchant: hotel.merchant?.name || '',
      city: hotel.cityCode,
      starLevel: hotel.starLevel,
      status: hotel.available === 'UP' ? 'ONLINE' : (hotel.available === 'DOWN' ? 'OFFLINE' : 'UNKNOWN'),
      available: hotel.available,
      roomTypeCount: roomTypeCountMap.get(hotel.id) || 0,
      createdAt: hotel.createdTime,
      updatedAt: hotel.updatedTime
    }));
  }

  async getHotelWithRoomTypes(id: string) {
    const hotel = await this.hotelRepository.findOne({ where: { id } });
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    const roomTypes = await this.dataSource.query(`
      SELECT id, name_zh, name_en, status, created_time, updated_time
      FROM room_type
      WHERE hotel_id = $1 AND status = 'APPROVED'
    `, [id]);

    return {
      hotel: {
        id: hotel.id,
        nameZh: hotel.nameZh,
        nameEn: hotel.nameEn,
        address: hotel.address,
        cityCode: hotel.cityCode,
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
        updatedAt: hotel.updatedTime
      },
      roomTypes
    };
  }
}
