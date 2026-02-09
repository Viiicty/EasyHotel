import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource} from 'typeorm';
import { RoomTypeEntity } from './room-type.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomTypeEntity)
    private roomTypeRepository: Repository<RoomTypeEntity>,
    private readonly hotelSubmissionService: HotelSubmissionService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(roomTypeData: Partial<RoomTypeEntity>): Promise<RoomTypeEntity> {
    const roomType = this.roomTypeRepository.create(roomTypeData);
    return this.roomTypeRepository.save(roomType);
  }

  async findAll(): Promise<RoomTypeEntity[]> {
    return this.roomTypeRepository.find();
  }

  async findOne(id: string): Promise<RoomTypeEntity | undefined> {
    return this.roomTypeRepository.findOne({ where: { id } });
  }

  async update(id: string, roomTypeData: Partial<RoomTypeEntity>): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, roomTypeData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roomTypeRepository.delete(id);
  }

  async findByHotelId(hotelId: string): Promise<RoomTypeEntity[]> {
    return this.roomTypeRepository.find({ where: { hotelId } });
  }

  async submitForReview(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'pending', updatedBy: userId });
    return this.findOne(id);
  }

  async approve(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'approved', updatedBy: userId });
    return this.findOne(id);
  }

  async reject(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'draft', updatedBy: userId });
    return this.findOne(id);
  }

  // 审核房型提交
    async audit(id: string, roomTypeData: { status: string; rejectReason?: string }, reviewedBy: string): Promise<RoomTypeEntity | undefined> {
      const queryRunner = this.dataSource.createQueryRunner();
      
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        // 第一步：在 hotel_submission 表中新增一条记录
        await this.hotelSubmissionService.create({
          roomtypeId: id, //记录关联的roomTypeID
          ...roomTypeData,//记录审核状态、驳回原因
          reviewedBy,  //记录审核人
          createdBy: reviewedBy, //记录创建人
          updatedBy: reviewedBy, //记录更新人
        }, queryRunner.manager);
        
        // 第二步：更新 room_type 表中的 status 字段
        await queryRunner.manager.getRepository(RoomTypeEntity)
        .update(id, { 
          status: roomTypeData.status, updatedBy: reviewedBy 
        });
                
        const updatedRoomType = await this.findOne(id);
        
        await queryRunner.commitTransaction();
        
        return updatedRoomType;
      } catch (error) {  //如果出现异常，回滚事务
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

  async getRoomTypesByMerchant(userId: string, hotelId: string) {
    const result = await this.dataSource.query(`
      SELECT 
        rt.id as "roomTypeId",
        rt.room_type_name as "roomTypeName",
        rt.status as "roomTypeStatus",
        h.status as "hotelStatus",
        rp.id as "ratePlanId",
        rp.plan_name as "planName",
        rp.base_price as "basePrice",
        rp.currency as "currency",
        rp.status as "ratePlanStatus"
      FROM room_type rt
      JOIN hotel h ON h.id = rt.hotel_id
      LEFT JOIN room_rate_plan rp ON rp.room_type_id = rt.id
      WHERE rt.hotel_id = $1
        AND h.status = 'APPROVED'
        AND rt.status = 'APPROVED'
        AND h.merchant_id = $2
      ORDER BY rt.id, rp.id
    `, [hotelId, userId]);

    const roomTypesMap = new Map();

    for (const row of result) {
      if (!roomTypesMap.has(row.roomTypeId)) {
        roomTypesMap.set(row.roomTypeId, {
          roomTypeId: row.roomTypeId,
          roomTypeName: row.roomTypeName,
          ratePlans: []
        });
      }

      if (row.ratePlanId) {
        const roomType = roomTypesMap.get(row.roomTypeId);
        roomType.ratePlans.push({
          ratePlanId: row.ratePlanId,
          planName: row.planName,
          basePrice: row.basePrice,
          currency: row.currency
        });
      }
    }

    return Array.from(roomTypesMap.values());
  }

}
