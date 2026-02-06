import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeBannerEntity } from './home-banner.entity';
import { HomeBannerController } from './home-banner.controller';
import { HomeBannerService } from './home-banner.service';

@Module({
  imports: [TypeOrmModule.forFeature([HomeBannerEntity])],
  controllers: [HomeBannerController],
  providers: [HomeBannerService],
  exports: [HomeBannerService],
})
export class HomeBannerModule {}
