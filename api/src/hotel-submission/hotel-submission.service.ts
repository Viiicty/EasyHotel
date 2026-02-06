import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelSubmissionEntity } from './hotel-submission.entity';

@Injectable()
export class HotelSubmissionService {
  constructor(
    @InjectRepository(HotelSubmissionEntity)
    private hotelSubmissionRepository: Repository<HotelSubmissionEntity>,
  ) {}

  async create(submissionData: Partial<HotelSubmissionEntity>): Promise<HotelSubmissionEntity> {
    const submission = this.hotelSubmissionRepository.create(submissionData);
    return this.hotelSubmissionRepository.save(submission);
  }

  async findAll(): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionRepository.find();
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

  async findByHotelId(hotelId: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionRepository.find({ where: { hotelId } });
  }

  async findByMerchantId(merchantId: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionRepository.find({ where: { merchantId } });
  }

  async findByStatus(status: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionRepository.find({ where: { status } });
  }

  async approve(id: string, reviewedBy: string): Promise<HotelSubmissionEntity | undefined> {
    const submission = await this.findOne(id);
    if (!submission) return undefined;
    
    submission.status = 'APPROVED';
    submission.reviewedBy = reviewedBy;
    submission.reviewedAt = new Date();
    return this.hotelSubmissionRepository.save(submission);
  }

  async reject(id: string, rejectReason: string, reviewedBy: string): Promise<HotelSubmissionEntity | undefined> {
    const submission = await this.findOne(id);
    if (!submission) return undefined;
    
    submission.status = 'REJECTED';
    submission.rejectReason = rejectReason;
    submission.reviewedBy = reviewedBy;
    submission.reviewedAt = new Date();
    return this.hotelSubmissionRepository.save(submission);
  }
}
