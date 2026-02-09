import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { HotelModule } from './hotel/hotel.module';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RoomTypeModule } from './room-type/room-type.module';
import { HotelSubmissionModule } from './hotel-submission/hotel-submission.module';
import { RoomPriceCalendarModule } from './room-price-calendar/room-price-calendar.module';
import { RoomRatePlanModule } from './room-rate-plan/room-rate-plan.module';
import { InventoryModule } from './inventory/inventory.module';
import { UploadModule } from './upload/upload.module';

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
    RoomTypeModule,
    HotelSubmissionModule,
    RoomPriceCalendarModule,
    RoomRatePlanModule,
    InventoryModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
