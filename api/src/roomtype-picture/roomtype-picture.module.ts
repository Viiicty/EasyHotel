import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomtypePictureEntity } from './roomtype-picture.entity';
import { RoomtypePictureController } from './roomtype-picture.controller';
import { RoomtypePictureService } from './roomtype-picture.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoomtypePictureEntity]), forwardRef(() => UploadModule)],
  controllers: [RoomtypePictureController],
  providers: [RoomtypePictureService],
  exports: [RoomtypePictureService],
})
export class RoomtypePictureModule {}
