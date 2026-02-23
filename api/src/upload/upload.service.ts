import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = './banner';
  private readonly pictureDir = './picture';
  private readonly roomPictureDir = './roompicture';

  constructor() {
    this.ensureUploadDirExists();
    this.ensurePictureDirExists();
    this.ensureRoomPictureDirExists();
  }

  private ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private ensurePictureDirExists() {
    if (!fs.existsSync(this.pictureDir)) {
      fs.mkdirSync(this.pictureDir, { recursive: true });
    }
  }

  private ensureRoomPictureDirExists() {
    if (!fs.existsSync(this.roomPictureDir)) {
      fs.mkdirSync(this.roomPictureDir, { recursive: true });
    }
  }

  getFileInfo(file: any) {
    console.log('=== UploadService.getFileInfo START ===');
    console.log('File:', file);
    const result = {
      url: `${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
    console.log('File info result:', result);
    console.log('=== UploadService.getFileInfo END ===');
    return result;
  }

  async deleteFile(filename: string) {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true, message: 'File deleted successfully' };
    }
    return { success: false, message: 'File not found' };
  }

  async deletePictureFile(filename: string) {
    const filePath = path.join(this.pictureDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true, message: 'Picture file deleted successfully' };
    }
    return { success: false, message: 'Picture file not found' };
  }

  async deleteRoomPictureFile(filename: string) {
    const filePath = path.join(this.roomPictureDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true, message: 'Room picture file deleted successfully' };
    }
    return { success: false, message: 'Room picture file not found' };
  }

  async getFile(filename: string) {
    const filePath = path.join(this.uploadDir, filename);
    console.log(filePath)
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  async getPictureFile(filename: string) {
    const filePath = path.join(this.pictureDir, filename);
    console.log('Picture file path:', filePath)
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  async getRoomPictureFile(filename: string) {
    const filePath = path.join(this.roomPictureDir, filename);
    console.log('Room picture file path:', filePath)
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }
}