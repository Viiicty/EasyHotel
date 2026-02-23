import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomtypePictureEntity } from './roomtype-picture.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class RoomtypePictureService {
  constructor(
    @InjectRepository(RoomtypePictureEntity)
    private roomtypePictureRepository: Repository<RoomtypePictureEntity>,
    @Inject(forwardRef(() => UploadService))
    private uploadService: UploadService,
  ) {}

  async create(pictureData: Partial<RoomtypePictureEntity>): Promise<RoomtypePictureEntity> {
    console.log('=== RoomtypePictureService.create START ===');
    console.log('pictureData:', pictureData);
    
    try {
      const picture = this.roomtypePictureRepository.create(pictureData);
      console.log('Created picture entity:', picture);
      
      const savedPicture = await this.roomtypePictureRepository.save(picture);
      console.log('Saved picture:', savedPicture);
      console.log('=== RoomtypePictureService.create END ===');
      return savedPicture;
    } catch (error) {
      console.error('Error in create service:', error);
      throw error;
    }
  }

  async findAll(): Promise<RoomtypePictureEntity[]> {
    return this.roomtypePictureRepository.find();
  }

  async findOne(id: string): Promise<RoomtypePictureEntity | undefined> {
    return this.roomtypePictureRepository.findOne({ where: { id } });
  }

  async update(id: string, pictureData: Partial<RoomtypePictureEntity>): Promise<RoomtypePictureEntity | undefined> {
    await this.roomtypePictureRepository.update(id, pictureData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    console.log('=== RoomtypePictureService.remove START ===');
    console.log('Deleting picture ID:', id);
    
    const picture = await this.findOne(id);
    if (picture && picture.url) {
      console.log('Deleting file:', picture.url);
      await this.uploadService.deleteRoomPictureFile(picture.url);
    }
    
    await this.roomtypePictureRepository.delete(id);
    console.log('=== RoomtypePictureService.remove END ===');
  }

  async findByRoomTypeId(roomTypeId: string): Promise<RoomtypePictureEntity[]> {
    return this.roomtypePictureRepository.find({
      where: { roomTypeId },
      order: { sortNo: 'ASC' }
    });
  }

  async findByHotelId(hotelId: string): Promise<RoomtypePictureEntity[]> {
    return this.roomtypePictureRepository.find({
      where: { hotelId },
      order: { sortNo: 'ASC' }
    });
  }

  async deleteByRoomTypeId(roomTypeId: string): Promise<void> {
    console.log('=== RoomtypePictureService.deleteByRoomTypeId START ===');
    console.log('Deleting all pictures for room type:', roomTypeId);
    
    const pictures = await this.findByRoomTypeId(roomTypeId);
    console.log('Found pictures to delete:', pictures.length);
    
    for (const picture of pictures) {
      if (picture.url) {
        console.log('Deleting file:', picture.url);
        await this.uploadService.deleteRoomPictureFile(picture.url);
      }
    }
    
    await this.roomtypePictureRepository.delete({ roomTypeId });
    console.log('=== RoomtypePictureService.deleteByRoomTypeId END ===');
  }

  async batchCreate(pictures: Partial<RoomtypePictureEntity>[]): Promise<RoomtypePictureEntity[]> {
    console.log('=== RoomtypePictureService.batchCreate START ===');
    console.log('Creating pictures:', pictures);
    
    try {
      const createdPictures = this.roomtypePictureRepository.create(pictures);
      console.log('Created pictures entities:', createdPictures);
      
      const savedPictures = await this.roomtypePictureRepository.save(createdPictures);
      console.log('Saved pictures:', savedPictures);
      console.log('=== RoomtypePictureService.batchCreate END ===');
      return savedPictures;
    } catch (error) {
      console.error('Error in batchCreate service:', error);
      throw error;
    }
  }

  async updateSortOrder(pictures: Array<{ id: string; sortNo: number }>): Promise<void> {
    await Promise.all(
      pictures.map(({ id, sortNo }) =>
        this.roomtypePictureRepository.update(id, { sortNo })
      )
    );
  }
}
