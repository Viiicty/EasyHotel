import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateOrderDto, OrderQueryDto, UpdateOrderStatusDto } from './dto/order.dto';

@Controller('mini/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getUserOrders(@Request() req: any, @Query() query: OrderQueryDto) {
    return this.orderService.getUserOrders(req.user.id, query);
  }

  @Get('pending')
  async getPendingOrder(@Request() req: any) {
    return this.orderService.getPendingOrder(req.user.id);
  }

  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string, @Request() req: any) {
    return this.orderService.getOrderById(orderId, req.user.id);
  }

  @Get(':orderId/status')
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.orderService.checkOrderStatus(orderId);
  }

  @Post(':orderId/confirm')
  async confirmOrder(@Param('orderId') orderId: string, @Request() req: any) {
    return this.orderService.updateOrderStatus(orderId, req.user.id, {
      status: 'CONFIRMED',
    });
  }

  @Post(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string, @Request() req: any) {
    return this.orderService.updateOrderStatus(orderId, req.user.id, {
      status: 'CANCELLED',
    });
  }

  @Post(':orderId/pay')
  async payOrder(@Param('orderId') orderId: string, @Request() req: any) {
    return this.orderService.payOrder(orderId, req.user.id);
  }

  @Delete(':orderId')
  async deleteOrder(@Param('orderId') orderId: string, @Request() req: any) {
    return this.orderService.deleteOrder(orderId, req.user.id);
  }
}
