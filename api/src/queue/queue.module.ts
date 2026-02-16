import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderExpiryProcessor } from './order-expiry.processor';
import { OrderExpiryQueue } from './order-expiry.queue';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'order-expiry',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 10,
      },
    }),
    OrderModule,
  ],
  providers: [OrderExpiryProcessor, OrderExpiryQueue],
  exports: [OrderExpiryQueue],
})
export class QueueModule {}
