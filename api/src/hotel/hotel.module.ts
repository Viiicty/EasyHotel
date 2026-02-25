import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { HotelEntity } from './hotel.entity';
import { HotelController, MerchantHotelController, AdminOnlineManageController, MiniHotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { HotelSubmissionModule } from '../hotel-submission/hotel-submission.module';
import { HotelCoverModule } from '../hotel-cover/hotel-cover.module';

@Module({
  imports: [TypeOrmModule.forFeature([HotelEntity]), PassportModule, MulterModule, HotelSubmissionModule, HotelCoverModule],
  controllers: [HotelController, MerchantHotelController, AdminOnlineManageController, MiniHotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
