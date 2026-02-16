import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OrderExpiryQueue {
  constructor(
    @InjectQueue('order-expiry')
    private orderExpiryQueue: Queue,
  ) {}

  async addExpiryJob(orderId: string, delayMs: number) {
    await this.orderExpiryQueue.add(
      'cancel-expired-order',
      { orderId },
      {
        delay: delayMs,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600,
          count: 100,
        },
        removeOnFail: {
          age: 3600,
          count: 100,
        },
      },
    );
  }

  async removeJob(orderId: string) {
    const jobs = await this.orderExpiryQueue.getJobs(['waiting', 'delayed'], 0, 100);
    for (const job of jobs) {
      if (job.data.orderId === orderId) {
        await job.remove();
        break;
      }
    }
  }
}
