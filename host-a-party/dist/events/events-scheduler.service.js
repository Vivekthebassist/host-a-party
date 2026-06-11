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
var EventsSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../entities/event.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../entities/notification.entity");
const join_request_entity_1 = require("../entities/join-request.entity");
const app_gateway_1 = require("../gateway/app.gateway");
let EventsSchedulerService = EventsSchedulerService_1 = class EventsSchedulerService {
    constructor(eventRepo, joinReqRepo, notificationsService, gateway) {
        this.eventRepo = eventRepo;
        this.joinReqRepo = joinReqRepo;
        this.notificationsService = notificationsService;
        this.gateway = gateway;
        this.logger = new common_1.Logger(EventsSchedulerService_1.name);
    }
    async handleEventStatusTransitions() {
        const now = new Date();
        const eventsToGoLive = await this.eventRepo.find({
            where: {
                status: event_entity_1.EventStatus.PUBLISHED,
                startsAt: (0, typeorm_2.LessThanOrEqual)(now),
            },
        });
        for (const event of eventsToGoLive) {
            event.status = event_entity_1.EventStatus.LIVE;
            await this.eventRepo.save(event);
            this.logger.log(`Event "${event.title}" is now LIVE`);
            this.gateway.emitEventUpdate(event.id, {
                type: 'status_change',
                status: event_entity_1.EventStatus.LIVE,
                eventId: event.id,
            });
            const approvedRequests = await this.joinReqRepo.find({
                where: { eventId: event.id, status: join_request_entity_1.JoinRequestStatus.APPROVED },
            });
            const notifyPromises = approvedRequests.map((req) => this.notificationsService.create(req.userId, notification_entity_1.NotificationType.EVENT_GOING_LIVE, 'Party is Live!', `"${event.title}" has started. Party Mode is now active!`, { eventId: event.id }));
            notifyPromises.push(this.notificationsService.create(event.hostId, notification_entity_1.NotificationType.EVENT_GOING_LIVE, 'Your Party is Live!', `"${event.title}" has started. Your guests can now use Party Mode.`, { eventId: event.id }));
            await Promise.all(notifyPromises);
        }
        const eventsToEnd = await this.eventRepo.find({
            where: {
                status: event_entity_1.EventStatus.LIVE,
                endsAt: (0, typeorm_2.LessThanOrEqual)(now),
            },
        });
        for (const event of eventsToEnd) {
            event.status = event_entity_1.EventStatus.ENDED;
            await this.eventRepo.save(event);
            this.logger.log(`Event "${event.title}" has ENDED`);
            this.gateway.emitEventUpdate(event.id, {
                type: 'status_change',
                status: event_entity_1.EventStatus.ENDED,
                eventId: event.id,
            });
        }
    }
    async sendEventReminders() {
        const now = new Date();
        const thirtyMinLater = new Date(now.getTime() + 30 * 60 * 1000);
        const upcomingEvents = await this.eventRepo
            .createQueryBuilder('event')
            .where('event.status = :status', { status: event_entity_1.EventStatus.PUBLISHED })
            .andWhere('event.startsAt > :now', { now })
            .andWhere('event.startsAt <= :soon', { soon: thirtyMinLater })
            .getMany();
        for (const event of upcomingEvents) {
            const approvedRequests = await this.joinReqRepo.find({
                where: { eventId: event.id, status: join_request_entity_1.JoinRequestStatus.APPROVED },
            });
            const notifyPromises = approvedRequests.map((req) => this.notificationsService.create(req.userId, notification_entity_1.NotificationType.EVENT_REMINDER, 'Starting Soon!', `"${event.title}" starts in less than 30 minutes. Get ready!`, { eventId: event.id }));
            await Promise.all(notifyPromises);
        }
    }
};
exports.EventsSchedulerService = EventsSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsSchedulerService.prototype, "handleEventStatusTransitions", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsSchedulerService.prototype, "sendEventReminders", null);
exports.EventsSchedulerService = EventsSchedulerService = EventsSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(join_request_entity_1.JoinRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        app_gateway_1.AppGateway])
], EventsSchedulerService);
//# sourceMappingURL=events-scheduler.service.js.map