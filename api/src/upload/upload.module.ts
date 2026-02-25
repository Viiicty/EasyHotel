import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { RoomtypePictureModule } from '../roomtype-picture/roomtype-picture.module';
import { HotelCoverModule } from '../hotel-cover/hotel-cover.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './api/banner',
    }),
    forwardRef(() => RoomtypePictureModule),
    forwardRef(() => HotelCoverModule),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
