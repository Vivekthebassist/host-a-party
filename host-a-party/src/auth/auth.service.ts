import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory OTP store for dev. Replace with Redis + SMS provider in production.
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(phone: string): Promise<{ message: string }> {
    // DEV ONLY: hardcoded OTP for testing. Replace with random OTP + SMS provider in production.
    const otp = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.otpStore.set(phone, { otp, expiresAt });

    // TODO: Send OTP via SMS provider (Twilio / MSG91)
    this.logger.log(`[DEV] OTP for ${phone}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phone: string, otp: string) {
    const stored = this.otpStore.get(phone);

    if (!stored) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(phone);
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    if (stored.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    this.otpStore.delete(phone);

    let user = await this.userRepo.findOne({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = this.userRepo.create({
        phone,
        fullName: '',
        username: `user_${Date.now()}`,
      });
      user = await this.userRepo.save(user);
    }

    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
    });

    return {
      accessToken: token,
      isNewUser,
      isProfileComplete: user.isProfileComplete,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
