import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MerchantOrderController } from './merchant-order.controller';
import { BookingOrderEntity } from '../booking-order/booking-order.entity';
import { InventoryHoldEntity } from '../inventory/inventory-hold.entity';
import { RoomTypeInventoryDailyEntity } from '../inventory/room-type-inventory-daily.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingOrderEntity,
      InventoryHoldEntity,
      RoomTypeInventoryDailyEntity,
      HotelEntity,
      RoomTypeEntity,
      UserEntity,
    ]),
  ],
  controllers: [OrderController, MerchantOrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
