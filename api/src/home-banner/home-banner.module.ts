import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeBannerEntity } from './home-banner.entity';
import { HomeBannerController } from './home-banner.controller';
import { HomeBannerService } from './home-banner.service';
import { HotelModule } from '../hotel/hotel.module';

@Module({
  imports: [TypeOrmModule.forFeature([HomeBannerEntity]), HotelModule],
  controllers: [HomeBannerController],
  providers: [HomeBannerService],
  exports: [HomeBannerService],
})
export class HomeBannerModule {}
