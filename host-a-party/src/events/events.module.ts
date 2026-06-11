import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { JoinRequest } from '../entities/join-request.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsSchedulerService } from './events-scheduler.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, JoinRequest]), NotificationsModule],
  controllers: [EventsController],
  providers: [EventsService, EventsSchedulerService],
  exports: [EventsService],
})
export class EventsModule {}
