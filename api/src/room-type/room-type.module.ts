import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { RoomTypeEntity } from './room-type.entity';
import { HotelEntity } from '../hotel/hotel.entity';
import { RoomTypeController, MerchantRoomTypeController, MiniRoomTypeController } from './room-type.controller';
import { RoomTypeService } from './room-type.service';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { HotelSubmissionEntity } from '../hotel-submission/hotel-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomTypeEntity, HotelSubmissionEntity, HotelEntity]), PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [RoomTypeController, MerchantRoomTypeController, MiniRoomTypeController],
  providers: [RoomTypeService, HotelSubmissionService],
  exports: [RoomTypeService],
})
export class RoomTypeModule {}
