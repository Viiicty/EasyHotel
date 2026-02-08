import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { HotelEntity } from './hotel.entity';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { HotelSubmissionEntity } from 'src/hotel-submission/hotel-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HotelEntity,HotelSubmissionEntity]), PassportModule, MulterModule],
  controllers: [HotelController],
  providers: [HotelService, HotelSubmissionService],
  exports: [HotelService],
})
export class HotelModule {}
