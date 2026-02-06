import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelImageEntity } from './hotel-image.entity';
import { HotelImageController } from './hotel-image.controller';
import { HotelImageService } from './hotel-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([HotelImageEntity])],
  controllers: [HotelImageController],
  providers: [HotelImageService],
  exports: [HotelImageService],
})
export class HotelImageModule {}
