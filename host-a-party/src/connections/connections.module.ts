import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Swipe } from '../entities/swipe.entity';
import { Match } from '../entities/match.entity';
import { Event } from '../entities/event.entity';
import { JoinRequest } from '../entities/join-request.entity';
import { User } from '../entities/user.entity';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Swipe, Match, Event, JoinRequest, User]), NotificationsModule],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
