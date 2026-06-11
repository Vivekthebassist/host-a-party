import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SetupProfileDto, UpdateProfileDto, UpdateLocationDto, UpdatePreferencesDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getMyProfile(userId: string) {
    const user = await this.findById(userId);
    // Return raw object so ClassSerializerInterceptor @Exclude is bypassed for own profile
    return { ...user };
  }

  async setupProfile(userId: string, dto: SetupProfileDto) {
    const existing = await this.userRepo.findOne({ where: { username: dto.username } });
    if (existing && existing.id !== userId) {
      throw new ConflictException('Username already taken');
    }

    await this.userRepo.update(userId, {
      ...dto,
      isProfileComplete: true,
    });

    return this.getMyProfile(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.userRepo.findOne({ where: { username: dto.username } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    await this.userRepo.update(userId, dto);
    return this.getMyProfile(userId);
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    await this.userRepo.update(userId, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      city: dto.city,
    });
    return this.getMyProfile(userId);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    await this.userRepo.update(userId, dto);
    return this.getMyProfile(userId);
  }

  async getPublicProfile(userId: string) {
    // Returns a User entity -- @Exclude fields are stripped by ClassSerializerInterceptor
    return this.findById(userId);
  }
}
