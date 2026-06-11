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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swipe_entity_1 = require("../entities/swipe.entity");
const match_entity_1 = require("../entities/match.entity");
const event_entity_1 = require("../entities/event.entity");
const join_request_entity_1 = require("../entities/join-request.entity");
const user_entity_1 = require("../entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../entities/notification.entity");
const app_gateway_1 = require("../gateway/app.gateway");
let ConnectionsService = class ConnectionsService {
    constructor(swipeRepo, matchRepo, eventRepo, joinReqRepo, userRepo, notificationsService, gateway) {
        this.swipeRepo = swipeRepo;
        this.matchRepo = matchRepo;
        this.eventRepo = eventRepo;
        this.joinReqRepo = joinReqRepo;
        this.userRepo = userRepo;
        this.notificationsService = notificationsService;
        this.gateway = gateway;
    }
    async swipe(swiperId, eventId, targetUserId, direction) {
        if (swiperId === targetUserId) {
            throw new common_1.BadRequestException('You cannot swipe on yourself');
        }
        const event = await this.eventRepo.findOne({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.status !== event_entity_1.EventStatus.LIVE) {
            throw new common_1.BadRequestException('Party Mode is only available for live events');
        }
        if (!event.partyModeEnabled) {
            throw new common_1.BadRequestException('Party Mode is not enabled for this event');
        }
        const existing = await this.swipeRepo.findOne({
            where: { swiperId, swipedId: targetUserId, eventId },
        });
        if (existing) {
            throw new common_1.BadRequestException('You already swiped on this person for this event');
        }
        const swipe = this.swipeRepo.create({
            swiperId,
            swipedId: targetUserId,
            eventId,
            direction,
        });
        await this.swipeRepo.save(swipe);
        if (direction === swipe_entity_1.SwipeDirection.SUPER_LIKE) {
            const swiper = await this.userRepo.findOne({ where: { id: swiperId }, select: { id: true, fullName: true } });
            await this.notificationsService.create(targetUserId, notification_entity_1.NotificationType.SUPER_LIKE_RECEIVED, 'You got a Super Like!', `${swiper?.fullName || 'Someone'} super liked you at "${event.title}"`, { eventId, swiperId });
        }
        let match = null;
        if (direction === swipe_entity_1.SwipeDirection.RIGHT || direction === swipe_entity_1.SwipeDirection.SUPER_LIKE) {
            const reciprocal = await this.swipeRepo.findOne({
                where: {
                    swiperId: targetUserId,
                    swipedId: swiperId,
                    eventId,
                    direction: (0, typeorm_2.In)([swipe_entity_1.SwipeDirection.RIGHT, swipe_entity_1.SwipeDirection.SUPER_LIKE]),
                },
            });
            if (reciprocal) {
                const [userOneId, userTwoId] = swiperId < targetUserId ? [swiperId, targetUserId] : [targetUserId, swiperId];
                match = this.matchRepo.create({
                    userOneId,
                    userTwoId,
                    eventId,
                    isSuperLike: direction === swipe_entity_1.SwipeDirection.SUPER_LIKE || reciprocal.direction === swipe_entity_1.SwipeDirection.SUPER_LIKE,
                });
                match = await this.matchRepo.save(match);
                this.gateway.emitMatch(swiperId, targetUserId, match);
                const [swiperUser, targetUser] = await Promise.all([
                    this.userRepo.findOne({ where: { id: swiperId }, select: { id: true, fullName: true } }),
                    this.userRepo.findOne({ where: { id: targetUserId }, select: { id: true, fullName: true } }),
                ]);
                await Promise.all([
                    this.notificationsService.create(swiperId, notification_entity_1.NotificationType.NEW_MATCH, "It's a Connection!", `You matched with ${targetUser?.fullName || 'someone'} at "${event.title}"`, { matchId: match.id, eventId, otherUserId: targetUserId }),
                    this.notificationsService.create(targetUserId, notification_entity_1.NotificationType.NEW_MATCH, "It's a Connection!", `You matched with ${swiperUser?.fullName || 'someone'} at "${event.title}"`, { matchId: match.id, eventId, otherUserId: swiperId }),
                ]);
            }
        }
        return {
            swipe,
            isMatch: !!match,
            match,
        };
    }
    async getSwipeCandidates(userId, eventId) {
        const event = await this.eventRepo.findOne({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.status !== event_entity_1.EventStatus.LIVE) {
            throw new common_1.BadRequestException('Party Mode is only available for live events');
        }
        const alreadySwiped = await this.swipeRepo.find({
            where: { swiperId: userId, eventId },
            select: { swipedId: true },
        });
        const swipedIds = alreadySwiped.map((s) => s.swipedId);
        swipedIds.push(userId);
        const approvedRequests = await this.joinReqRepo.find({
            where: { eventId, status: join_request_entity_1.JoinRequestStatus.APPROVED },
            select: { userId: true },
        });
        const attendeeIds = approvedRequests.map((r) => r.userId);
        attendeeIds.push(event.hostId);
        const candidateIds = attendeeIds.filter((id) => !swipedIds.includes(id));
        if (candidateIds.length === 0)
            return [];
        return this.userRepo.find({
            where: {
                id: (0, typeorm_2.In)(candidateIds),
                showProfileInPartyMode: true,
            },
            select: { id: true, fullName: true, username: true, bio: true, avatarUrl: true, isVerified: true, city: true },
        });
    }
    async getEventMatches(userId, eventId) {
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
    async getAllMatches(userId) {
        return this.matchRepo
            .createQueryBuilder('match')
            .leftJoinAndSelect('match.userOne', 'userOne')
            .leftJoinAndSelect('match.userTwo', 'userTwo')
            .leftJoinAndSelect('match.event', 'event')
            .where('(match.userOneId = :userId OR match.userTwoId = :userId)', { userId })
            .orderBy('match.createdAt', 'DESC')
            .getMany();
    }
};
exports.ConnectionsService = ConnectionsService;
exports.ConnectionsService = ConnectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(swipe_entity_1.Swipe)),
    __param(1, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __param(2, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(3, (0, typeorm_1.InjectRepository)(join_request_entity_1.JoinRequest)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        app_gateway_1.AppGateway])
], ConnectionsService);
//# sourceMappingURL=connections.service.js.map