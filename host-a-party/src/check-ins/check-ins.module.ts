import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { Event } from '../entities/event.entity';
import { JoinRequest } from '../entities/join-request.entity';
import { CheckInsService } from './check-ins.service';
import { CheckInsController } from './check-ins.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, Event, JoinRequest])],
  controllers: [CheckInsController],
  providers: [CheckInsService],
  exports: [CheckInsService],
})
export class CheckInsModule {}
