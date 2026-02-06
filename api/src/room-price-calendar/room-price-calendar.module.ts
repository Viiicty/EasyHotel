import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomPriceCalendarEntity } from './room-price-calendar.entity';
import { RoomPriceCalendarController } from './room-price-calendar.controller';
import { RoomPriceCalendarService } from './room-price-calendar.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomPriceCalendarEntity])],
  controllers: [RoomPriceCalendarController],
  providers: [RoomPriceCalendarService],
  exports: [RoomPriceCalendarService],
})
export class RoomPriceCalendarModule {}
