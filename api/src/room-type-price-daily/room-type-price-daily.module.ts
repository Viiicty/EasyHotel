import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomTypePriceDailyController } from './room-type-price-daily.controller';
import { RoomTypePriceDailyService } from './room-type-price-daily.service';
import { RoomTypePriceDailyEntity } from './room-type-price-daily.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomTypePriceDailyEntity])],
  controllers: [RoomTypePriceDailyController],
  providers: [RoomTypePriceDailyService],
  exports: [RoomTypePriceDailyService],
})
export class RoomTypePriceDailyModule {}
