import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class WsAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly userRepo;
    constructor(jwtService: JwtService, userRepo: Repository<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
