import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    private readonly logger;
    private otpStore;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    sendOtp(phone: string): Promise<{
        message: string;
    }>;
    verifyOtp(phone: string, otp: string): Promise<{
        accessToken: string;
        isNewUser: boolean;
        isProfileComplete: boolean;
        user: {
            id: string;
            phone: string;
            fullName: string;
            username: string;
            avatarUrl: string;
        };
    }>;
}
