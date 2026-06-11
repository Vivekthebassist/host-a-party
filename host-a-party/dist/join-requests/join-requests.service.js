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
exports.JoinRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const join_request_entity_1 = require("../entities/join-request.entity");
const event_entity_1 = require("../entities/event.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../entities/notification.entity");
let JoinRequestsService = class JoinRequestsService {
    constructor(joinReqRepo, eventRepo, notificationsService) {
        this.joinReqRepo = joinReqRepo;
        this.eventRepo = eventRepo;
        this.notificationsService = notificationsService;
    }
    async create(userId, eventId, dto) {
        const event = await this.eventRepo.findOne({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.hostId === userId) {
            throw new common_1.BadRequestException('You cannot request to join your own event');
        }
        const existing = await this.joinReqRepo.findOne({ where: { userId, eventId } });
        if (existing) {
            throw new common_1.ConflictException('You already have a request for this event');
        }
        const approvedCount = await this.joinReqRepo.count({
            where: { eventId, status: join_request_entity_1.JoinRequestStatus.APPROVED },
        });
        if (approvedCount >= event.maxGuests) {
            throw new common_1.BadRequestException('This event is full');
        }
        const joinReq = this.joinReqRepo.create({
            userId,
            eventId,
            message: dto.message,
        });
        const saved = await this.joinReqRepo.save(joinReq);
        await this.notificationsService.create(event.hostId, notification_entity_1.NotificationType.JOIN_REQUEST_RECEIVED, 'New Join Request', `Someone wants to join "${event.title}"`, { joinRequestId: saved.id, eventId, userId });
        return saved;
    }
    async respond(requestId, hostId, status) {
        const joinReq = await this.joinReqRepo.findOne({
            where: { id: requestId },
            relations: { event: true },
        });
        if (!joinReq)
            throw new common_1.NotFoundException('Join request not found');
        if (joinReq.event.hostId !== hostId) {
            throw new common_1.ForbiddenException('Only the host can respond to join requests');
        }
        if (joinReq.status !== join_request_entity_1.JoinRequestStatus.PENDING) {
            throw new common_1.BadRequestException('This request has already been responded to');
        }
        if (status === join_request_entity_1.JoinRequestStatus.APPROVED) {
            const approvedCount = await this.joinReqRepo.count({
                where: { eventId: joinReq.eventId, status: join_request_entity_1.JoinRequestStatus.APPROVED },
            });
            if (approvedCount >= joinReq.event.maxGuests) {
                throw new common_1.BadRequestException('Event is full. Cannot approve more requests.');
            }
        }
        joinReq.status = status;
        joinReq.respondedBy = hostId;
        joinReq.respondedAt = new Date();
        const saved = await this.joinReqRepo.save(joinReq);
        const notifType = status === join_request_entity_1.JoinRequestStatus.APPROVED
            ? notification_entity_1.NotificationType.JOIN_REQUEST_APPROVED
            : notification_entity_1.NotificationType.JOIN_REQUEST_REJECTED;
        const notifTitle = status === join_request_entity_1.JoinRequestStatus.APPROVED ? 'Request Approved!' : 'Request Declined';
        const notifBody = status === join_request_entity_1.JoinRequestStatus.APPROVED
            ? `You're in! Your request to join "${joinReq.event.title}" was approved.`
            : `Your request to join "${joinReq.event.title}" was declined.`;
        await this.notificationsService.create(joinReq.userId, notifType, notifTitle, notifBody, {
            joinRequestId: saved.id,
            eventId: joinReq.eventId,
        });
        return saved;
    }
    async getEventRequests(eventId, hostId) {
        const event = await this.eventRepo.findOne({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.hostId !== hostId) {
            throw new common_1.ForbiddenException('Only the host can view requests');
        }
        const requests = await this.joinReqRepo.find({
            where: { eventId },
            relations: { user: true },
            order: { createdAt: 'DESC' },
        });
        const summary = {
            pending: requests.filter((r) => r.status === join_request_entity_1.JoinRequestStatus.PENDING).length,
            approved: requests.filter((r) => r.status === join_request_entity_1.JoinRequestStatus.APPROVED).length,
            rejected: requests.filter((r) => r.status === join_request_entity_1.JoinRequestStatus.REJECTED).length,
        };
        return { summary, requests };
    }
    async getMyRequests(userId) {
        return this.joinReqRepo.find({
            where: { userId },
            relations: { event: { host: true } },
            order: { createdAt: 'DESC' },
        });
    }
    async cancel(requestId, userId) {
        const joinReq = await this.joinReqRepo.findOne({ where: { id: requestId } });
        if (!joinReq)
            throw new common_1.NotFoundException('Join request not found');
        if (joinReq.userId !== userId)
            throw new common_1.ForbiddenException();
        if (joinReq.status !== join_request_entity_1.JoinRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Can only cancel pending requests');
        }
        joinReq.status = join_request_entity_1.JoinRequestStatus.CANCELLED;
        await this.joinReqRepo.save(joinReq);
    }
};
exports.JoinRequestsService = JoinRequestsService;
exports.JoinRequestsService = JoinRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(join_request_entity_1.JoinRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], JoinRequestsService);
//# sourceMappingURL=join-requests.service.js.map