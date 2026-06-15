"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.otpStore = new Map();
    }
    async sendOtp(phone) {
        const otp = '123456';
        const expiresAt = Date.now() + 5 * 60 * 1000;
        this.otpStore.set(phone, { otp, expiresAt });
        this.logger.log(`[DEV] OTP for ${phone}: ${otp}`);
        return { message: 'OTP sent successfully' };
    }
    async verifyOtp(phone, otp) {
        const stored = this.otpStore.get(phone);
        if (!stored) {
            throw new common_1.BadRequestException('No OTP found. Please request a new one.');
        }
        if (Date.now() > stored.expiresAt) {
            this.otpStore.delete(phone);
            throw new common_1.BadRequestException('OTP expired. Please request a new one.');
        }
        if (stored.otp !== otp) {
            throw new common_1.BadRequestException('Invalid OTP');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map