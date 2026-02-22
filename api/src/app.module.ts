import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { HotelModule } from './hotel/hotel.module';
import { HotelImageModule } from './hotel-image/hotel-image.module';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RoomTypeModule } from './room-type/room-type.module';
import { HotelSubmissionModule } from './hotel-submission/hotel-submission.module';
import { RoomTypePriceDailyModule } from './room-type-price-daily/room-type-price-daily.module';
import { InventoryModule } from './inventory/inventory.module';
import { UploadModule } from './upload/upload.module';
import { BookingModule } from './booking/booking.module';
import { OrderModule } from './order/order.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    HotelModule,
    HotelImageModule,
    RoomTypeModule,
    HotelSubmissionModule,
    RoomTypePriceDailyModule,
    InventoryModule,
    UploadModule,
    BookingModule,
    OrderModule,
    QueueModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
