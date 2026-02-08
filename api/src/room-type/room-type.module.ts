import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { RoomTypeEntity } from './room-type.entity';
import { RoomTypeController } from './room-type.controller';
import { RoomTypeService } from './room-type.service';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { HotelSubmissionEntity } from '../hotel-submission/hotel-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomTypeEntity,HotelSubmissionEntity]), PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [RoomTypeController],
  providers: [RoomTypeService, HotelSubmissionService],
  exports: [RoomTypeService],
})
export class RoomTypeModule {}
