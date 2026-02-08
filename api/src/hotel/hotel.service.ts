import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HotelEntity } from './hotel.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';

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
  async audit(id: string, hotelData: { status: string; rejectReason?: string }, reviewedBy: string): Promise<HotelEntity | undefined> {
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
}
