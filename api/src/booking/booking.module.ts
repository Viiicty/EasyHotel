import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { BookingController, MiniBookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingOrderEntity } from '../booking-order/booking-order.entity';
import { InventoryHoldEntity } from '../inventory/inventory-hold.entity';
import { RoomTypeInventoryDailyEntity } from '../inventory/room-type-inventory-daily.entity';
import { RoomTypePriceDailyEntity } from '../room-type-price-daily/room-type-price-daily.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingOrderEntity,
      InventoryHoldEntity,
      RoomTypeInventoryDailyEntity,
      RoomTypePriceDailyEntity,
      RoomTypeEntity,
      HotelEntity,
    ]),
    PassportModule,
    QueueModule,
  ],
  controllers: [BookingController, MiniBookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
