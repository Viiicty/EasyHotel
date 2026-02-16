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

  async findByPhone(phone: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({ where: { phone } });
  }

  /*********************小程序 *********************/

  async createMiniUser(phone: string, password: string, name: string, email?: string): Promise<UserEntity> {
    console.log('=== 注册用户 ===')
    console.log('phone:', phone)
    console.log('email:', email)
    console.log('name:', name)

    const existingUser = await this.userRepository.findOne({ where: { phone } });
    console.log('existingUser:', existingUser)
    
    if (existingUser) {
      throw new ConflictException('Phone already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email: email || phone,
      passwordHash: hashedPassword,
      name,
      role: 'user',
      status: 'YES',
      phone,
    });

    console.log('创建用户数据:', user)

    const savedUser = await this.userRepository.save(user);
    console.log('保存后的用户:', savedUser)
    
    return savedUser;
  }

  async findMiniUserByPhone(phone: string): Promise<UserEntity | undefined> {
    console.log('=== 查询小程序用户 ===')
    console.log('查询手机号:', phone)
    
    const user = await this.userRepository.findOne({ 
      where: { 
        phone: phone,
        role: 'user' 
      } 
    });
    console.log('查询结果 (role=user):', user)
    
    return user;
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