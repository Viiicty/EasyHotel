import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { HotelSubmissionEntity } from './hotel-submission.entity';
import { HotelSubmissionController } from './hotel-submission.controller';
import { HotelSubmissionService } from './hotel-submission.service';

@Module({
  imports: [TypeOrmModule.forFeature([HotelSubmissionEntity]), PassportModule],
  controllers: [HotelSubmissionController],
  providers: [HotelSubmissionService],
  exports: [HotelSubmissionService],
})
export class HotelSubmissionModule {}
