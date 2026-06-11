import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Swipe, SwipeDirection } from '../entities/swipe.entity';
import { Match } from '../entities/match.entity';
import { Event, EventStatus } from '../entities/event.entity';
import { JoinRequest, JoinRequestStatus } from '../entities/join-request.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepo: Repository<Swipe>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(JoinRequest)
    private readonly joinReqRepo: Repository<JoinRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: AppGateway,
  ) {}

  async swipe(swiperId: string, eventId: string, targetUserId: string, direction: SwipeDirection) {
    if (swiperId === targetUserId) {
      throw new BadRequestException('You cannot swipe on yourself');
    }

    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== EventStatus.LIVE) {
      throw new BadRequestException('Party Mode is only available for live events');
    }
    if (!event.partyModeEnabled) {
      throw new BadRequestException('Party Mode is not enabled for this event');
    }

    const existing = await this.swipeRepo.findOne({
      where: { swiperId, swipedId: targetUserId, eventId },
    });
    if (existing) {
      throw new BadRequestException('You already swiped on this person for this event');
    }

    const swipe = this.swipeRepo.create({
      swiperId,
      swipedId: targetUserId,
      eventId,
      direction,
    });
    await this.swipeRepo.save(swipe);

    // Notify target on super like
    if (direction === SwipeDirection.SUPER_LIKE) {
      const swiper = await this.userRepo.findOne({ where: { id: swiperId }, select: { id: true, fullName: true } });
      await this.notificationsService.create(
        targetUserId,
        NotificationType.SUPER_LIKE_RECEIVED,
        'You got a Super Like!',
        `${swiper?.fullName || 'Someone'} super liked you at "${event.title}"`,
        { eventId, swiperId },
      );
    }

    let match: Match | null = null;

    if (direction === SwipeDirection.RIGHT || direction === SwipeDirection.SUPER_LIKE) {
      const reciprocal = await this.swipeRepo.findOne({
        where: {
          swiperId: targetUserId,
          swipedId: swiperId,
          eventId,
          direction: In([SwipeDirection.RIGHT, SwipeDirection.SUPER_LIKE]),
        },
      });

      if (reciprocal) {
        const [userOneId, userTwoId] =
          swiperId < targetUserId ? [swiperId, targetUserId] : [targetUserId, swiperId];

        match = this.matchRepo.create({
          userOneId,
          userTwoId,
          eventId,
          isSuperLike: direction === SwipeDirection.SUPER_LIKE || reciprocal.direction === SwipeDirection.SUPER_LIKE,
        });
        match = await this.matchRepo.save(match);

        this.gateway.emitMatch(swiperId, targetUserId, match);

        // Notify both users about the match
        const [swiperUser, targetUser] = await Promise.all([
          this.userRepo.findOne({ where: { id: swiperId }, select: { id: true, fullName: true } }),
          this.userRepo.findOne({ where: { id: targetUserId }, select: { id: true, fullName: true } }),
        ]);

        await Promise.all([
          this.notificationsService.create(
            swiperId,
            NotificationType.NEW_MATCH,
            "It's a Connection!",
            `You matched with ${targetUser?.fullName || 'someone'} at "${event.title}"`,
            { matchId: match.id, eventId, otherUserId: targetUserId },
          ),
          this.notificationsService.create(
            targetUserId,
            NotificationType.NEW_MATCH,
            "It's a Connection!",
            `You matched with ${swiperUser?.fullName || 'someone'} at "${event.title}"`,
            { matchId: match.id, eventId, otherUserId: swiperId },
          ),
        ]);
      }
    }

    return {
      swipe,
      isMatch: !!match,
      match,
    };
  }

  async getSwipeCandidates(userId: string, eventId: string) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.status !== EventStatus.LIVE) {
      throw new BadRequestException('Party Mode is only available for live events');
    }

    const alreadySwiped = await this.swipeRepo.find({
      where: { swiperId: userId, eventId },
      select: { swipedId: true },
    });
    const swipedIds = alreadySwiped.map((s) => s.swipedId);
    swipedIds.push(userId);

    const approvedRequests = await this.joinReqRepo.find({
      where: { eventId, status: JoinRequestStatus.APPROVED },
      select: { userId: true },
    });
    const attendeeIds = approvedRequests.map((r) => r.userId);
    attendeeIds.push(event.hostId);

    const candidateIds = attendeeIds.filter((id) => !swipedIds.includes(id));

    if (candidateIds.length === 0) return [];

    return this.userRepo.find({
      where: {
        id: In(candidateIds),
        showProfileInPartyMode: true,
      },
      select: { id: true, fullName: true, username: true, bio: true, avatarUrl: true, isVerified: true, city: true },
    });
  }

  async getEventMatches(userId: string, eventId: string) {
    return this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.userOne', 'userOne')
      .leftJoinAndSelect('match.userTwo', 'userTwo')
      .leftJoinAndSelect('match.event', 'event')
      .where('match.eventId = :eventId', { eventId })
      .andWhere('(match.userOneId = :userId OR match.userTwoId = :userId)', { userId })
      .orderBy('match.createdAt', 'DESC')
      .getMany();
  }

  async getAllMatches(userId: string) {
    return this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.userOne', 'userOne')
      .leftJoinAndSelect('match.userTwo', 'userTwo')
      .leftJoinAndSelect('match.event', 'event')
      .where('(match.userOneId = :userId OR match.userTwoId = :userId)', { userId })
      .orderBy('match.createdAt', 'DESC')
      .getMany();
  }
}
