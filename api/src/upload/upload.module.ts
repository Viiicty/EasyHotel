import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { RoomtypePictureModule } from '../roomtype-picture/roomtype-picture.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './api/banner',
    }),
    forwardRef(() => RoomtypePictureModule),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
