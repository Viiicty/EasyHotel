import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomRatePlanEntity } from '../room-rate-plan/room-rate-plan.entity';
import { RoomRatePlanDailyEntity } from '../room-rate-plan/room-rate-plan-daily.entity';
import { RoomTypeInventoryDailyEntity } from './room-type-inventory-daily.entity';
import { InventoryHoldEntity } from './inventory-hold.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomRatePlanEntity,
      RoomRatePlanDailyEntity,
      RoomTypeInventoryDailyEntity,
      InventoryHoldEntity,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
