import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomRatePlanEntity } from './room-rate-plan.entity';
import { RoomRatePlanController } from './room-rate-plan.controller';
import { RoomRatePlanService } from './room-rate-plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoomRatePlanEntity])],
  controllers: [RoomRatePlanController],
  providers: [RoomRatePlanService],
  exports: [RoomRatePlanService],
})
export class RoomRatePlanModule {}
