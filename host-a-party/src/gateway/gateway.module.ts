import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AppGateway } from './app.gateway';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
