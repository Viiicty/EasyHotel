import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { HotelSubmissionEntity } from './hotel-submission.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

interface PendingItem {
  id: string;
  type: 'hotel' | 'roomtype' | 'submission';
  hotelId?: string;
  roomtypeId?: string;
  hotelName?: string;
  status: string;
  rejectReason?: string;
  createdTime: Date;
  updatedTime: Date;
}

@Injectable()
export class HotelSubmissionService {
  
  constructor(
    @InjectRepository(HotelSubmissionEntity)
    private hotelSubmissionRepository: Repository<HotelSubmissionEntity>,
    @InjectRepository(HotelEntity)
    private hotelRepository: Repository<HotelEntity>,
    @InjectRepository(RoomTypeEntity)
    private roomTypeRepository: Repository<RoomTypeEntity>,
  ) {}

  async create(submissionData: Partial<HotelSubmissionEntity>, manager?: EntityManager): Promise<HotelSubmissionEntity> {
    const repository = manager ? manager.getRepository(HotelSubmissionEntity) : this.hotelSubmissionRepository;
    const submission = repository.create(submissionData);
    return repository.save(submission);
  }

  async findAll(): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionRepository.find({
      order: {
        createdTime: 'DESC'
      }
    });
  }

  async findOne(id: string): Promise<HotelSubmissionEntity | undefined> {
    return this.hotelSubmissionRepository.findOne({ where: { id } });
  }

  async update(id: string, submissionData: Partial<HotelSubmissionEntity>): Promise<HotelSubmissionEntity | undefined> {
    await this.hotelSubmissionRepository.update(id, submissionData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.hotelSubmissionRepository.delete(id);
  }

  async findByHotelId(hotelId: string): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionRepository.findOneBy({ hotelId });
  }

  async findByMerchantId(merchantId: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionRepository.find({ where: { merchantId } });
  }

  async findByRoomTypeId(roomtypeId: string): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionRepository.findOneBy({ roomtypeId });
  }

  async findByStatus(status: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionRepository.find({
      where: { status },
      relations: ['hotel', 'roomtype', 'roomtype.hotel'],
      order: {
        createdTime: 'DESC'
      }
    });
  }

  async findAllPending(): Promise<PendingItem[]> {
    const pendingItems: PendingItem[] = [];
    
    const pendingHotels = await this.hotelRepository.find({
      where: { status: 'PENDING' },
      order: { createdTime: 'DESC' }
    });
    
    for (const hotel of pendingHotels) {
      pendingItems.push({
        id: hotel.id,
        type: 'hotel',
        hotelId: hotel.id,
        hotelName: hotel.nameZh,
        status: hotel.status,
        createdTime: hotel.createdTime,
        updatedTime: hotel.updatedTime
      });
    }
    
    const pendingRoomTypes = await this.roomTypeRepository.find({
      where: { status: 'PENDING' },
      relations: ['hotel'],
      order: { createdTime: 'DESC' }
    });
    
    for (const roomType of pendingRoomTypes) {
      pendingItems.push({
        id: roomType.id,
        type: 'roomtype',
        hotelId: roomType.hotelId || undefined,
        roomtypeId: roomType.id,
        hotelName: roomType.hotel?.nameZh,
        status: roomType.status,
        createdTime: roomType.createdTime,
        updatedTime: roomType.updatedTime
      });
    }
    
    pendingItems.sort((a, b) => b.createdTime.getTime() - a.createdTime.getTime());
    
    return pendingItems;
  }

  async findRecentAudits(limit: number = 3): Promise<PendingItem[]> {
    const recentAudits = await this.hotelSubmissionRepository.find({
      where: { status: In(['APPROVED', 'REJECTED']) },
      relations: ['hotel', 'roomtype', 'roomtype.hotel'],
      order: { updatedTime: 'DESC' },
      take: limit
    });
    
    const items: PendingItem[] = [];
    
    for (const audit of recentAudits) {
      items.push({
        id: audit.id,
        type: audit.hotelId && !audit.roomtypeId ? 'hotel' : 'roomtype',
        hotelId: audit.hotelId || undefined,
        roomtypeId: audit.roomtypeId || undefined,
        hotelName: audit.hotel?.nameZh || audit.roomtype?.hotel?.nameZh,
        status: audit.status,
        rejectReason: audit.rejectReason,
        createdTime: audit.createdTime,
        updatedTime: audit.updatedTime
      });
    }
    
    return items;
  }

  async approve(id: string, reviewedBy: string): Promise<HotelSubmissionEntity | undefined> {
    const submission = await this.findOne(id);
    if (!submission) return undefined;
    
    submission.status = 'APPROVED';
    submission.reviewedBy = reviewedBy;
    return this.hotelSubmissionRepository.save(submission);
  }

  async reject(id: string, rejectReason: string, reviewedBy: string): Promise<HotelSubmissionEntity | undefined> {
    const submission = await this.findOne(id);
    if (!submission) return undefined;
    
    submission.status = 'REJECTED';
    submission.rejectReason = rejectReason;
    submission.reviewedBy = reviewedBy;
    return this.hotelSubmissionRepository.save(submission);
  }

  async findRejectedByMerchantId(merchantId: string): Promise<HotelSubmissionEntity[]> {
    console.log('=== findRejectedByMerchantId service called with merchantId:', merchantId);
    
    const hotels = await this.hotelRepository.find({
      where: { merchantId },
      select: ['id'],
    });
    
    const hotelIds = hotels.map(h => h.id);
    
    if (hotelIds.length === 0) {
      console.log('=== No hotels found for merchant');
      return [];
    }
    
    const roomTypes = await this.roomTypeRepository.find({
      where: { hotelId: In(hotelIds) },
      select: ['id'],
    });
    
    const roomTypeIds = roomTypes.map(rt => rt.id);
    
    const result = await this.hotelSubmissionRepository.find({
      where: [
        {
          hotelId: In(hotelIds),
          status: 'REJECTED',
        },
        {
          roomtypeId: In(roomTypeIds),
          status: 'REJECTED',
        },
      ],
      relations: ['hotel', 'roomtype', 'roomtype.hotel'],
      order: {
        updatedTime: 'DESC',
      },
      take: 6,
    });
    console.log('=== findRejectedByMerchantId service result count:', result.length);
    return result;
  }

  async countPending(): Promise<{ count: number }> {
    const hotelCount = await this.hotelRepository.count({
      where: { status: 'PENDING' }
    });
    
    const roomTypeCount = await this.roomTypeRepository.count({
      where: { status: 'PENDING' }
    });
    
    const totalCount = hotelCount + roomTypeCount;
    return { count: totalCount };
  }

  async countTodayApproved(): Promise<{ count: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.hotelSubmissionRepository
      .createQueryBuilder('submission')
      .where('submission.status = :status', { status: 'APPROVED' })
      .andWhere('submission.updatedTime >= :today', { today })
      .andWhere('submission.updatedTime < :tomorrow', { tomorrow })
      .getCount();
    return { count };
  }

  async countTodayRejected(): Promise<{ count: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.hotelSubmissionRepository
      .createQueryBuilder('submission')
      .where('submission.status = :status', { status: 'REJECTED' })
      .andWhere('submission.updatedTime >= :today', { today })
      .andWhere('submission.updatedTime < :tomorrow', { tomorrow })
      .getCount();
    return { count };
  }

  async countTodayAudited(): Promise<{ count: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.hotelSubmissionRepository
      .createQueryBuilder('submission')
      .where('(submission.status = :approved OR submission.status = :rejected)', { 
        approved: 'APPROVED', 
        rejected: 'REJECTED' 
      })
      .andWhere('submission.updatedTime >= :today', { today })
      .andWhere('submission.updatedTime < :tomorrow', { tomorrow })
      .getCount();
    return { count };
  }
}
