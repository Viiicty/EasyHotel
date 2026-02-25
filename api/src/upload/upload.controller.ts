import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Res, NotFoundException, Body, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { Public } from '../common/public.decorator';
import { RoomtypePictureService } from '../roomtype-picture/roomtype-picture.service';
import { HotelCoverService } from '../hotel-cover/hotel-cover.service';

import { v4 as uuidv4 } from 'uuid';

const uploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./banner`);
    },
    filename: (req, file, cb) => {
      const fileType = file.mimetype.split('/')[1];
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

const pictureUploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./picture`);
    },
    filename: (req, file, cb) => {
      const fileType = file.mimetype.split('/')[1];
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

const roomPictureUploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./roompicture`);
    },
    filename: (req, file, cb) => {
      const fileType = file.mimetype.split('/')[1];
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

const hotelCoverUploadOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, `./hotelcover`);
    },
    filename: (req, file, cb) => {
      const fileType = file.mimetype.split('/')[1];
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
  constructor(
    private readonly uploadService: UploadService,
    private readonly roomtypePictureService: RoomtypePictureService,
    private readonly hotelCoverService: HotelCoverService
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    return this.uploadService.getFileInfo(file);
  }

  @Post('banner')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async uploadBanner(@UploadedFile() file: any) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    return this.uploadService.getFileInfo(file);
  }

  @Post('picture')
  @UseInterceptors(FileInterceptor('file', pictureUploadOptions))
  async uploadPicture(@UploadedFile() file: any) {
    if (!file) {
      throw new NotFoundException('No file uploaded');
    }
    return this.uploadService.getFileInfo(file);
  }

  @Post('roompicture')
  @UseInterceptors(FileInterceptor('file', roomPictureUploadOptions))
  async uploadRoomPicture(@UploadedFile() file: any, @Body() body: any, @Request() req: any) {
    console.log('=== uploadRoomPicture START ===');
    console.log('File:', file);
    console.log('Body:', body);
    console.log('User:', req.user);
    
    if (!file) {
      console.error('No file uploaded');
      throw new NotFoundException('No file uploaded');
    }

    const fileInfo = this.uploadService.getFileInfo(file);
    console.log('File info:', fileInfo);

    const { hotelId, roomTypeId, sortNo } = body;
    console.log('hotelId:', hotelId, 'roomTypeId:', roomTypeId, 'sortNo:', sortNo);

    console.log('=== uploadRoomPicture END ===');

    return fileInfo;
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

  @Get('banner/:filename')
  @Public()
  async downloadBanner(@Param('filename') filename: string, @Res() res: Response) {
    console.log("Banner filename:", filename)
    const filePath = await this.uploadService.getFile(filename);
    if (!filePath) {
      throw new NotFoundException('Banner file not found');
    }
    return res.sendFile(filename, { root: './banner' });
  }

  @Get('picture/:filename')
  @Public()
  async downloadPicture(@Param('filename') filename: string, @Res() res: Response) {
    console.log("Picture filename:", filename)
    const filePath = await this.uploadService.getPictureFile(filename);
    if (!filePath) {
      throw new NotFoundException('Picture file not found');
    }
    return res.sendFile(filename, { root: './picture' });
  }

  @Get('roompicture/:filename')
  @Public()
  async downloadRoomPicture(@Param('filename') filename: string, @Res() res: Response) {
    console.log("Room picture filename:", filename)
    const filePath = await this.uploadService.getRoomPictureFile(filename);
    if (!filePath) {
      throw new NotFoundException('Room picture file not found');
    }
    return res.sendFile(filename, { root: './roompicture' });
  }

  @Delete('image/:filename')
  async deleteImage(@Param('filename') filename: string) {
    return this.uploadService.deleteFile(filename);
  }

  @Delete('banner/:filename')
  async deleteBanner(@Param('filename') filename: string) {
    return this.uploadService.deleteFile(filename);
  }

  @Delete('picture/:filename')
  async deletePicture(@Param('filename') filename: string) {
    return this.uploadService.deletePictureFile(filename);
  }

  @Delete('roompicture/:filename')
  async deleteRoomPicture(@Param('filename') filename: string) {
    return this.uploadService.deleteRoomPictureFile(filename);
  }

  @Post('hotelcover')
  @UseInterceptors(FileInterceptor('file', hotelCoverUploadOptions))
  async uploadHotelCover(@UploadedFile() file: any, @Body() body: any, @Request() req: any) {
    console.log('=== uploadHotelCover START ===');
    console.log('File:', file);
    console.log('Body:', body);
    console.log('User:', req.user);
    
    if (!file) {
      console.error('No file uploaded');
      throw new NotFoundException('No file uploaded');
    }

    const fileInfo = this.uploadService.getFileInfo(file);
    console.log('File info:', fileInfo);

    const { hotelId } = body;
    console.log('hotelId:', hotelId);

    if (!hotelId) {
      console.error('hotelId is required');
      throw new Error('hotelId is required');
    }

    try {
      await this.hotelCoverService.create({
        hotelId,
        url: fileInfo.filename,
        createdBy: req.user.id,
        updatedBy: req.user.id
      });
      console.log('=== uploadHotelCover END ===');
      return fileInfo;
    } catch (error) {
      console.error('Error creating hotel cover:', error);
      throw error;
    }
  }

  @Get('hotelcover/:filename')
  @Public()
  async downloadHotelCover(@Param('filename') filename: string, @Res() res: Response) {
    console.log("Hotel cover filename:", filename)
    const filePath = await this.uploadService.getHotelCoverFile(filename);
    if (!filePath) {
      throw new NotFoundException('Hotel cover file not found');
    }
    return res.sendFile(filename, { root: './hotelcover' });
  }

  @Delete('hotelcover/:filename')
  async deleteHotelCover(@Param('filename') filename: string) {
    return this.uploadService.deleteHotelCoverFile(filename);
  }
}
