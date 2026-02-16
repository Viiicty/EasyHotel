import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomTypeInventoryDailyEntity } from './room-type-inventory-daily.entity';
import { InventoryHoldEntity } from './inventory-hold.entity';
import { InventoryController, MerchantInventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomTypeInventoryDailyEntity,
      InventoryHoldEntity,
    ]),
  ],
  controllers: [InventoryController, MerchantInventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
