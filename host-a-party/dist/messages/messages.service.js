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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../entities/message.entity");
const match_entity_1 = require("../entities/match.entity");
const user_entity_1 = require("../entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../entities/notification.entity");
const app_gateway_1 = require("../gateway/app.gateway");
let MessagesService = class MessagesService {
    constructor(messageRepo, matchRepo, userRepo, notificationsService, gateway) {
        this.messageRepo = messageRepo;
        this.matchRepo = matchRepo;
        this.userRepo = userRepo;
        this.notificationsService = notificationsService;
        this.gateway = gateway;
    }
    async verifyMatchAccess(matchId, userId) {
        const match = await this.matchRepo.findOne({ where: { id: matchId } });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        if (match.userOneId !== userId && match.userTwoId !== userId) {
            throw new common_1.ForbiddenException('You are not part of this match');
        }
        return match;
    }
    async send(matchId, senderId, dto) {
        const match = await this.verifyMatchAccess(matchId, senderId);
        const message = this.messageRepo.create({
            matchId,
            senderId,
            eventId: match.eventId,
            content: dto.content,
            type: dto.type || 'text',
        });
        const saved = await this.messageRepo.save(message);
        this.gateway.emitNewMessage(matchId, saved);
        const receiverId = match.userOneId === senderId ? match.userTwoId : match.userOneId;
        const sender = await this.userRepo.findOne({ where: { id: senderId }, select: { id: true, fullName: true } });
        this.notificationsService.create(receiverId, notification_entity_1.NotificationType.NEW_MESSAGE, `${sender?.fullName || 'Someone'}`, dto.content.length > 100 ? dto.content.substring(0, 97) + '...' : dto.content, { matchId, messageId: saved.id, senderId }).catch(() => { });
        return saved;
    }
    async getChatHistory(matchId, userId, page = 1, limit = 50) {
        await this.verifyMatchAccess(matchId, userId);
        const [messages, total] = await this.messageRepo.findAndCount({
            where: { matchId },
            relations: { sender: true },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            messages: messages.reverse(),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async markAsRead(matchId, userId) {
        await this.verifyMatchAccess(matchId, userId);
        await this.messageRepo
            .createQueryBuilder()
            .update(message_entity_1.Message)
            .set({ isRead: true })
            .where('matchId = :matchId AND senderId != :userId AND isRead = false', {
            matchId,
            userId,
        })
            .execute();
    }
    async getChatList(userId) {
        const matches = await this.matchRepo
            .createQueryBuilder('match')
            .leftJoinAndSelect('match.userOne', 'userOne')
            .leftJoinAndSelect('match.userTwo', 'userTwo')
            .leftJoinAndSelect('match.event', 'event')
            .where('(match.userOneId = :userId OR match.userTwoId = :userId)', { userId })
            .orderBy('match.createdAt', 'DESC')
            .getMany();
        const chatList = await Promise.all(matches.map(async (match) => {
            const lastMessage = await this.messageRepo.findOne({
                where: { matchId: match.id },
                order: { createdAt: 'DESC' },
            });
            const unreadCount = await this.messageRepo.count({
                where: {
                    matchId: match.id,
                    isRead: false,
                    senderId: match.userOneId === userId ? match.userTwoId : match.userOneId,
                },
            });
            const otherUser = match.userOneId === userId ? match.userTwo : match.userOne;
            return {
                matchId: match.id,
                eventId: match.eventId,
                eventTitle: match.event.title,
                otherUser: {
                    id: otherUser.id,
                    fullName: otherUser.fullName,
                    username: otherUser.username,
                    avatarUrl: otherUser.avatarUrl,
                },
                lastMessage: lastMessage
                    ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId }
                    : null,
                unreadCount,
                isSuperLike: match.isSuperLike,
                matchedAt: match.createdAt,
            };
        }));
        return chatList.sort((a, b) => {
            const aTime = a.lastMessage?.createdAt || a.matchedAt;
            const bTime = b.lastMessage?.createdAt || b.matchedAt;
            return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(match_entity_1.Match)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        app_gateway_1.AppGateway])
], MessagesService);
//# sourceMappingURL=messages.service.js.map