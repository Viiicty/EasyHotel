import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { RoomTypePriceDailyEntity } from './room-type-price-daily.entity';
import { RoomTypeEntity } from '../room-type/room-type.entity';

@Injectable()
export class RoomTypePriceDailyService {
  constructor(
    @InjectRepository(RoomTypePriceDailyEntity)
    private priceRepository: Repository<RoomTypePriceDailyEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findByHotelAndDateRange(hotelId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const prices = await this.priceRepository.find({
      where: {
        hotelId,
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });

    const roomTypes = await this.dataSource.getRepository(RoomTypeEntity)
      .createQueryBuilder('rt')
      .where('rt.hotelId = :hotelId', { hotelId })
      .getMany();

    const roomTypeMap = new Map(roomTypes.map(rt => [rt.id, rt]));
    const priceMap = new Map<string, any>();

    const dates = this.getDatesInRange(startDate, endDate);
    dates.forEach(date => {
      roomTypes.forEach(roomType => {
        const key = `${roomType.id}_${date.toISOString().split('T')[0]}`;
        const existingPrice = prices.find(p => {
          const priceDate = p.date instanceof Date ? p.date : new Date(p.date);
          return p.roomTypeId === roomType.id && 
            priceDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
        });

        priceMap.set(key, {
          hotelId,
          roomTypeId: roomType.id,
          date: date,
          price: existingPrice ? Number(existingPrice.price) : null,
          isDefault: !existingPrice
        });
      });
    });

    return Array.from(priceMap.values());
  }

  async findByRoomTypeAndDateRange(roomTypeId: string, startDate: Date, endDate: Date): Promise<RoomTypePriceDailyEntity[]> {
    return this.priceRepository.find({
      where: {
        roomTypeId,
        date: Between(startDate, endDate),
      },
      order: {
        date: 'ASC',
      },
    });
  }

  async findOne(hotelId: string, roomTypeId: string, date: Date): Promise<RoomTypePriceDailyEntity> {
    const price = await this.priceRepository.findOne({
      where: {
        hotelId,
        roomTypeId,
        date,
      },
    });

    if (!price) {
      throw new NotFoundException(`价格不存在：酒店ID=${hotelId}, 房型ID=${roomTypeId}, 日期=${date}`);
    }

    return price;
  }

  async create(priceData: Partial<RoomTypePriceDailyEntity>, userId: string): Promise<RoomTypePriceDailyEntity> {
    const existingPrice = await this.priceRepository.findOne({
      where: {
        hotelId: priceData.hotelId,
        roomTypeId: priceData.roomTypeId,
        date: priceData.date,
      },
    });

    if (existingPrice) {
      throw new ConflictException(`价格已存在：酒店ID=${priceData.hotelId}, 房型ID=${priceData.roomTypeId}, 日期=${priceData.date}`);
    }

    const price = this.priceRepository.create({
      ...priceData,
      createdBy: userId
    });
    return this.priceRepository.save(price);
  }

  async update(hotelId: string, roomTypeId: string, date: Date, priceData: Partial<RoomTypePriceDailyEntity>, userId: string): Promise<RoomTypePriceDailyEntity> {
    const price = await this.findOne(hotelId, roomTypeId, date);
    
    Object.assign(price, priceData, { updatedBy: userId });
    return this.priceRepository.save(price);
  }

  async batchUpdate(hotelId: string, roomTypeId: string, startDate: Date, endDate: Date, price: number, userId: string): Promise<RoomTypePriceDailyEntity[]> {
    const dates = this.getDatesInRange(startDate, endDate);
    const updatedPrices: RoomTypePriceDailyEntity[] = [];

    for (const date of dates) {
      try {
        const existingPrice = await this.priceRepository.findOne({
          where: {
            hotelId,
            roomTypeId,
            date,
          },
        });

        if (existingPrice) {
          existingPrice.price = price;
          existingPrice.updatedBy = userId;
          await this.priceRepository.save(existingPrice);
          updatedPrices.push(existingPrice);
        } else {
          const newPrice = this.priceRepository.create({
            hotelId,
            roomTypeId,
            date,
            price,
            createdBy: userId
          });
          const savedPrice = await this.priceRepository.save(newPrice);
          updatedPrices.push(savedPrice);
        }
      } catch (error) {
        console.error(`更新价格失败：${date}`, error);
      }
    }

    return updatedPrices;
  }

  async delete(hotelId: string, roomTypeId: string, date: Date): Promise<void> {
    const price = await this.findOne(hotelId, roomTypeId, date);
    await this.priceRepository.remove(price);
  }

  async batchDelete(hotelId: string, roomTypeId: string, startDate: Date, endDate: Date): Promise<void> {
    const dates = this.getDatesInRange(startDate, endDate);
    
    for (const date of dates) {
      try {
        const price = await this.priceRepository.findOne({
          where: {
            hotelId,
            roomTypeId,
            date,
          },
        });

        if (price) {
          await this.priceRepository.remove(price);
        }
      } catch (error) {
        console.error(`删除价格失败：${date}`, error);
      }
    }
  }

  private getDatesInRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }
}
