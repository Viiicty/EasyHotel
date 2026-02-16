import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueStalled } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { OrderService } from '../order/order.service';

@Processor('order-expiry')
export class OrderExpiryProcessor {
  private readonly logger = new Logger(OrderExpiryProcessor.name);

  constructor(private readonly orderService: OrderService) {}

  @Process('cancel-expired-order')
  async handleExpiredOrder(job: Job) {
    const { orderId } = job.data;
    
    this.logger.log('=== 开始处理过期订单 ===');
    this.logger.log(`订单ID: ${orderId}`);
    this.logger.log(`任务ID: ${job.id}`);
    this.logger.log(`重试次数: ${job.attemptsMade}`);
    
    try {
      const order = await this.orderService.getOrderById(orderId);
      
      if (!order) {
        this.logger.warn(`订单不存在，可能已被取消`);
        return;
      }
      
      this.logger.log(`订单状态: ${order.status}`);
      this.logger.log(`订单创建时间: ${order.createdTime}`);
      
      if (order.status !== 'PENDING') {
        this.logger.log(`订单状态已变更，跳过取消`);
        return;
      }
      
      await this.orderService.cancelExpiredOrder(orderId);
      
      this.logger.log(`=== 过期订单处理完成 ===`);
    } catch (error) {
      this.logger.error('=== 过期订单处理失败 ===');
      this.logger.error(`错误信息: ${error.message}`);
      this.logger.error(`错误堆栈: ${error.stack}`);
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`任务开始: ${job.id}, 订单ID: ${job.data.orderId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`任务完成: ${job.id}, 订单ID: ${job.data.orderId}, 耗时: ${job.processedOn}ms`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`任务失败: ${job.id}, 订单ID: ${job.data.orderId}, 错误: ${error.message}`);
  }

  @OnQueueStalled()
  onStalled(job: Job) {
    this.logger.warn(`任务停滞: ${job.id}, 订单ID: ${job.data.orderId}`);
  }
}
