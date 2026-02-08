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
      autoLoadEntities: true,// 自动加载实体
      synchronize: true,// 自动同步数据库结构（这个字段控制实体代码生成到数据库）
    }),
    UserModule,
    HotelModule,
    RoomTypeModule,
    HotelSubmissionModule,
    RoomPriceCalendarModule,
    RoomRatePlanModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
