import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { v4 as uuidv4 } from 'uuid';
import * as express from 'express';
import * as multer from 'multer';
import { Public } from '../common/public.decorator';

const uploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./banner`);
    },
    filename: (req, file, cb) => {
      console.log("file.uid:",file)
      const fileType = file.mimetype.split('/')[1];
      const { v4: uuidv4 } = require('uuid');
      const fileName = `${uuidv4()}.${fileType}`;
      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    return this.uploadService.getFileInfo(file);
  }

  @Get('image/:filename')
  @Public()
  async downloadImage(@Param('filename') filename: string, @Res() res: Response) {
    console.log("filename",filename)
    const filePath = await this.uploadService.getFile(filename);
    if (!filePath) {
      throw new NotFoundException('File not found');
    }
    return res.sendFile(filename, { root: './banner' });
  }

  @Delete('image/:filename')
  async deleteImage(@Param('filename') filename: string) {
    return this.uploadService.deleteFile(filename);
  }
}
