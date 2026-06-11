import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(dto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
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
