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
    return this.roomTypeRepository.find({
      order: {
        createdTime: 'DESC'
      }
    });
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
    await this.roomTypeRepository.update(id, { status: 'PENDING', updatedBy: userId });
    return this.findOne(id);
  }

  async approve(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'APPROVED', updatedBy: userId });
    return this.findOne(id);
  }

  async reject(id: string, userId: string): Promise<RoomTypeEntity | undefined> {
    await this.roomTypeRepository.update(id, { status: 'DRAFT', updatedBy: userId });
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
    const roomTypes = await this.roomTypeRepository
      .createQueryBuilder('rt')
      .leftJoinAndSelect('rt.hotel', 'h')
      .where('rt.hotelId = :hotelId', { hotelId })
      .andWhere('h.status = :hotelStatus', { hotelStatus: 'APPROVED' })
      .andWhere('rt.status = :status', { status: 'APPROVED' })
      .andWhere('h.merchantId = :userId', { userId })
      .orderBy('rt.id', 'ASC')
      .getMany();

    return roomTypes.map(rt => ({
      id: rt.id,
      name: rt.name,
      bedType: rt.bedType,
      breakfast: rt.breakfast,
      areaSqm: rt.areaSqm,
      maxGuests: rt.maxGuests,
      status: rt.status,
      hotelStatus: rt.hotel?.status,
      defaultPrice: rt.defaultPrice || 0,
      defaultInventory: rt.defaultInventory || 0
    }));
  }

  async updateDefaultPrice(userId: string, roomTypeId: string, defaultPrice: number) {
    const roomType = await this.roomTypeRepository.findOne({
      where: { id: roomTypeId },
      relations: ['hotel']
    });

    if (!roomType) {
      throw new Error('房型不存在');
    }

    if (roomType.hotel?.merchantId !== userId) {
      throw new Error('无权操作该房型');
    }

    roomType.defaultPrice = defaultPrice;
    return this.roomTypeRepository.save(roomType);
  }

  async updateDefaultInventory(userId: string, roomTypeId: string, defaultInventory: number) {
    const roomType = await this.roomTypeRepository.findOne({
      where: { id: roomTypeId },
      relations: ['hotel']
    });

    if (!roomType) {
      throw new Error('房型不存在');
    }

    if (roomType.hotel?.merchantId !== userId) {
      throw new Error('无权操作该房型');
    }

    roomType.defaultInventory = defaultInventory;
    return this.roomTypeRepository.save(roomType);
  }

  /************************小程序*****************************/

  async getMiniRoomTypesByHotel(hotelId: string): Promise<any[]> {
    const roomTypes = await this.roomTypeRepository
      .createQueryBuilder('roomType')
      .select([
        'roomType.id',
        'roomType.name',
        'roomType.bedType',
        'roomType.breakfast',
        'roomType.areaSqm',
        'roomType.maxGuests',
        'roomType.status',
        'roomType.defaultPrice'
      ])
      .where('roomType.hotelId = :hotelId', { hotelId })
      .andWhere('roomType.status = :status', { status: 'APPROVED' })
      .orderBy('roomType.defaultPrice', 'ASC')
      .getMany();

    return roomTypes.map(roomType => ({
      id: roomType.id,
      name: roomType.name,
      bedType: roomType.bedType,
      breakfast: roomType.breakfast,
      areaSqm: roomType.areaSqm,
      maxGuests: roomType.maxGuests,
      status: roomType.status,
      defaultPrice: roomType.defaultPrice || 0
    }));
  }

}
