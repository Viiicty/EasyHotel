import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HotelService } from './hotel.service';
import { HotelEntity } from './hotel.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as express from 'express';
import * as multer from 'multer';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[1];
    const fileName = `${uuidv4()}.${fileType}`;
    cb(null, `./api/banner/${fileName}`);
  },
  filename: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[1];
    const fileName = `${uuidv4()}.${fileType}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService,

  ) {}

  @Post()
  async create(@Body() hotelData: Partial<HotelEntity>, @Request() req): Promise<HotelEntity> {
   console.log("req.user");
    console.log(hotelData);
    return this.hotelService.create({
      ...hotelData,
      merchantId: req.user.id,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(@Request() req): Promise<HotelEntity[]> {
    return this.hotelService.findAll();
  }

  @Get('merchant/:merchantId')
  async findByMerchantId(@Param('merchantId') merchantId: string): Promise<HotelEntity[]> {
    return this.hotelService.findByMerchantId(merchantId);
  }

  @Get('city/:cityCode')
  async findByCityCode(@Param('cityCode') cityCode: string): Promise<HotelEntity[]> {
    return this.hotelService.findByCityCode(cityCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HotelEntity> {
    return this.hotelService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() hotelData: Partial<HotelEntity>, @Request() req): Promise<HotelEntity> {
    return this.hotelService.update(id, {
      ...hotelData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelService.remove(id);
  }

  @Put('audit/:id')
  async audit(@Param('id') id: string, @Body() auditData: { status: string; rejectReason?: string }, @Request() req): Promise<HotelEntity> {
    return this.hotelService.audit(id, auditData,req.user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage,
    fileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
  }))
  async uploadFile(@Request() req: any) {
    const file = req.file;
    const fileUrl = `/banner/${file.filename}`;
    return {
      url: fileUrl,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }
}
