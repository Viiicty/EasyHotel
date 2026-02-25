import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelCoverController } from './hotel-cover.controller';
import { HotelCoverService } from './hotel-cover.service';
import { HotelCoverEntity } from './hotel-cover.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HotelCoverEntity])],
  controllers: [HotelCoverController],
  providers: [HotelCoverService],
  exports: [HotelCoverService],
})
export class HotelCoverModule {}
