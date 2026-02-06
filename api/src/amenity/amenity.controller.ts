import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AmenityService } from './amenity.service';
import { AmenityEntity } from './amenity.entity';

@Controller('amenity')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() amenityData: Partial<AmenityEntity>, @Request() req): Promise<AmenityEntity> {
    return this.amenityService.create({
      ...amenityData,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<AmenityEntity[]> {
    return this.amenityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AmenityEntity> {
    return this.amenityService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() amenityData: Partial<AmenityEntity>, @Request() req): Promise<AmenityEntity> {
    return this.amenityService.update(id, {
      ...amenityData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.amenityService.remove(id);
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string): Promise<AmenityEntity[]> {
    return this.amenityService.findByCategory(category);
  }
}
