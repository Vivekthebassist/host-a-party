import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { JoinRequest, JoinRequestStatus } from '../entities/join-request.entity';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class EventsSchedulerService {
  private readonly logger = new Logger(EventsSchedulerService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(JoinRequest)
    private readonly joinReqRepo: Repository<JoinRequest>,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: AppGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleEventStatusTransitions() {
    const now = new Date();

    // Published -> Live (startsAt has passed)
    const eventsToGoLive = await this.eventRepo.find({
      where: {
        status: EventStatus.PUBLISHED,
        startsAt: LessThanOrEqual(now),
      },
    });

    for (const event of eventsToGoLive) {
      event.status = EventStatus.LIVE;
      await this.eventRepo.save(event);

      this.logger.log(`Event "${event.title}" is now LIVE`);

      this.gateway.emitEventUpdate(event.id, {
        type: 'status_change',
        status: EventStatus.LIVE,
        eventId: event.id,
      });

      // Notify all approved attendees
      const approvedRequests = await this.joinReqRepo.find({
        where: { eventId: event.id, status: JoinRequestStatus.APPROVED },
      });

      const notifyPromises = approvedRequests.map((req) =>
        this.notificationsService.create(
          req.userId,
          NotificationType.EVENT_GOING_LIVE,
          'Party is Live!',
          `"${event.title}" has started. Party Mode is now active!`,
          { eventId: event.id },
        ),
      );

      // Also notify the host
      notifyPromises.push(
        this.notificationsService.create(
          event.hostId,
          NotificationType.EVENT_GOING_LIVE,
          'Your Party is Live!',
          `"${event.title}" has started. Your guests can now use Party Mode.`,
          { eventId: event.id },
        ),
      );

      await Promise.all(notifyPromises);
    }

    // Live -> Ended (endsAt has passed)
    const eventsToEnd = await this.eventRepo.find({
      where: {
        status: EventStatus.LIVE,
        endsAt: LessThanOrEqual(now),
      },
    });

    for (const event of eventsToEnd) {
      event.status = EventStatus.ENDED;
      await this.eventRepo.save(event);

      this.logger.log(`Event "${event.title}" has ENDED`);

      this.gateway.emitEventUpdate(event.id, {
        type: 'status_change',
        status: EventStatus.ENDED,
        eventId: event.id,
      });
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendEventReminders() {
    const now = new Date();
    const thirtyMinLater = new Date(now.getTime() + 30 * 60 * 1000);

    // Find events starting within the next 30 minutes
    const upcomingEvents = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('event.startsAt > :now', { now })
      .andWhere('event.startsAt <= :soon', { soon: thirtyMinLater })
      .getMany();

    for (const event of upcomingEvents) {
      const approvedRequests = await this.joinReqRepo.find({
        where: { eventId: event.id, status: JoinRequestStatus.APPROVED },
      });

      const notifyPromises = approvedRequests.map((req) =>
        this.notificationsService.create(
          req.userId,
          NotificationType.EVENT_REMINDER,
          'Starting Soon!',
          `"${event.title}" starts in less than 30 minutes. Get ready!`,
          { eventId: event.id },
        ),
      );

      await Promise.all(notifyPromises);
    }
  }
}
