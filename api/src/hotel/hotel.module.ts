import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { HotelEntity } from './hotel.entity';
import { HotelController, MerchantHotelController, AdminOnlineManageController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { HotelSubmissionModule } from '../hotel-submission/hotel-submission.module';
import { HomeBannerModule } from '../home-banner/home-banner.module';
import { HomeBannerController } from '../home-banner/home-banner.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HotelEntity]), PassportModule, MulterModule, HotelSubmissionModule, HomeBannerModule],
  controllers: [HotelController, MerchantHotelController, AdminOnlineManageController, HomeBannerController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
