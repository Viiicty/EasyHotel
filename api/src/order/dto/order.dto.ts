export class CreateOrderDto {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  guestName: string;
  guestPhone: string;
  idCard: string;
}

export class UpdateOrderStatusDto {
  status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | 'COMPLETED';
  rejectReason?: string;
}

export class OrderQueryDto {
  status?: 'PENDING' | 'PAID' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED' | 'COMPLETED';
  page?: number;
  pageSize?: number;
  keyword?: string;
}
