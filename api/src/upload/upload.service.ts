import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = './banner';
  private readonly pictureDir = './picture';

  constructor() {
    this.ensureUploadDirExists();
    this.ensurePictureDirExists();
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

  getFileInfo(file: any) {
    return {
      url: `${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
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
}
