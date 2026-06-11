import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinRequest, JoinRequestStatus } from '../entities/join-request.entity';
import { Event } from '../entities/event.entity';
import { CreateJoinRequestDto } from './dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class JoinRequestsService {
  constructor(
    @InjectRepository(JoinRequest)
    private readonly joinReqRepo: Repository<JoinRequest>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, eventId: string, dto: CreateJoinRequestDto): Promise<JoinRequest> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    if (event.hostId === userId) {
      throw new BadRequestException('You cannot request to join your own event');
    }

    const existing = await this.joinReqRepo.findOne({ where: { userId, eventId } });
    if (existing) {
      throw new ConflictException('You already have a request for this event');
    }

    const approvedCount = await this.joinReqRepo.count({
      where: { eventId, status: JoinRequestStatus.APPROVED },
    });
    if (approvedCount >= event.maxGuests) {
      throw new BadRequestException('This event is full');
    }

    const joinReq = this.joinReqRepo.create({
      userId,
      eventId,
      message: dto.message,
    });
    const saved = await this.joinReqRepo.save(joinReq);

    await this.notificationsService.create(
      event.hostId,
      NotificationType.JOIN_REQUEST_RECEIVED,
      'New Join Request',
      `Someone wants to join "${event.title}"`,
      { joinRequestId: saved.id, eventId, userId },
    );

    return saved;
  }

  async respond(
    requestId: string,
    hostId: string,
    status: JoinRequestStatus,
  ): Promise<JoinRequest> {
    const joinReq = await this.joinReqRepo.findOne({
      where: { id: requestId },
      relations: { event: true },
    });
    if (!joinReq) throw new NotFoundException('Join request not found');

    if (joinReq.event.hostId !== hostId) {
      throw new ForbiddenException('Only the host can respond to join requests');
    }

    if (joinReq.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been responded to');
    }

    if (status === JoinRequestStatus.APPROVED) {
      const approvedCount = await this.joinReqRepo.count({
        where: { eventId: joinReq.eventId, status: JoinRequestStatus.APPROVED },
      });
      if (approvedCount >= joinReq.event.maxGuests) {
        throw new BadRequestException('Event is full. Cannot approve more requests.');
      }
    }

    joinReq.status = status;
    joinReq.respondedBy = hostId;
    joinReq.respondedAt = new Date();
    const saved = await this.joinReqRepo.save(joinReq);

    const notifType =
      status === JoinRequestStatus.APPROVED
        ? NotificationType.JOIN_REQUEST_APPROVED
        : NotificationType.JOIN_REQUEST_REJECTED;
    const notifTitle =
      status === JoinRequestStatus.APPROVED ? 'Request Approved!' : 'Request Declined';
    const notifBody =
      status === JoinRequestStatus.APPROVED
        ? `You're in! Your request to join "${joinReq.event.title}" was approved.`
        : `Your request to join "${joinReq.event.title}" was declined.`;

    await this.notificationsService.create(joinReq.userId, notifType, notifTitle, notifBody, {
      joinRequestId: saved.id,
      eventId: joinReq.eventId,
    });

    return saved;
  }

  async getEventRequests(eventId: string, hostId: string) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.hostId !== hostId) {
      throw new ForbiddenException('Only the host can view requests');
    }

    const requests = await this.joinReqRepo.find({
      where: { eventId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    const summary = {
      pending: requests.filter((r) => r.status === JoinRequestStatus.PENDING).length,
      approved: requests.filter((r) => r.status === JoinRequestStatus.APPROVED).length,
      rejected: requests.filter((r) => r.status === JoinRequestStatus.REJECTED).length,
    };

    return { summary, requests };
  }

  async getMyRequests(userId: string) {
    return this.joinReqRepo.find({
      where: { userId },
      relations: { event: { host: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(requestId: string, userId: string): Promise<void> {
    const joinReq = await this.joinReqRepo.findOne({ where: { id: requestId } });
    if (!joinReq) throw new NotFoundException('Join request not found');
    if (joinReq.userId !== userId) throw new ForbiddenException();
    if (joinReq.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending requests');
    }

    joinReq.status = JoinRequestStatus.CANCELLED;
    await this.joinReqRepo.save(joinReq);
  }
}
