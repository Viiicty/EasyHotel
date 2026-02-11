import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(email: string, password: string, name: string, role?: string): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      name,
      role: role || 'merchant',
      status: 'YES',
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAllMerchants(): Promise<UserEntity[]> {
    return this.userRepository.find({ where: { role: 'merchant' } });
  }

  async deleteMerchant(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async updateMerchantStatus(id: string, status: string): Promise<UserEntity | undefined> {
    await this.userRepository.update(id, { status });
    return this.findById(id);
  }

  async updateMerchant(id: string, data: Partial<UserEntity>): Promise<UserEntity | undefined> {
    const updateData: Partial<UserEntity> = { ...data }
    if (!updateData.passwordHash) {
      delete updateData.passwordHash
    }
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }
}