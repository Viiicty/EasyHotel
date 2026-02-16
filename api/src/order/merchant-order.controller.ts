import { Controller, Get, Post, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { OrderQueryDto, UpdateOrderStatusDto } from './dto/order.dto';

@Controller('merchant/orders')
@UseGuards(JwtAuthGuard)
export class MerchantOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getMerchantOrders(@Request() req: any, @Query() query: OrderQueryDto) {
    console.log('=== MerchantOrderController.getMerchantOrders 开始 ===');
    console.log('req.user:', req.user);
    console.log('req.user.id:', req.user?.id);
    console.log('query:', query);
    
    try {
      const result = await this.orderService.getMerchantOrders(req.user.id, query);
      console.log('=== MerchantOrderController.getMerchantOrders 结束 ===');
      return result;
    } catch (error) {
      console.error('=== MerchantOrderController.getMerchantOrders 错误 ===');
      console.error('error:', error);
      console.error('error.message:', error.message);
      console.error('error.stack:', error.stack);
      throw error;
    }
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string, @Request() req: any) {
    return this.orderService.getMerchantOrderById(orderId, req.user.id);
  }

  @Post(':orderId/confirm')
  async confirmOrder(@Param('orderId') orderId: string, @Request() req: any) {
    return this.orderService.updateMerchantOrderStatus(orderId, req.user.id, {
      status: 'CONFIRMED',
    });
  }

  @Post(':orderId/reject')
  async rejectOrder(
    @Param('orderId') orderId: string,
    @Body() body: { rejectReason: string },
    @Request() req: any,
  ) {
    return this.orderService.updateMerchantOrderStatus(orderId, req.user.id, {
      status: 'CANCELLED',
      rejectReason: body.rejectReason,
    });
  }
}
