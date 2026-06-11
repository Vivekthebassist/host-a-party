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
exports.CheckInsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const check_in_entity_1 = require("../entities/check-in.entity");
const event_entity_1 = require("../entities/event.entity");
const join_request_entity_1 = require("../entities/join-request.entity");
const MAX_CHECKIN_DISTANCE_KM = 0.5;
let CheckInsService = class CheckInsService {
    constructor(checkInRepo, eventRepo, joinReqRepo) {
        this.checkInRepo = checkInRepo;
        this.eventRepo = eventRepo;
        this.joinReqRepo = joinReqRepo;
    }
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    async checkIn(userId, eventId, latitude, longitude) {
        const event = await this.eventRepo.findOne({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        if (event.status !== event_entity_1.EventStatus.LIVE && event.status !== event_entity_1.EventStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Check-in is not available for this event');
        }
        if (event.hostId !== userId) {
            const joinReq = await this.joinReqRepo.findOne({
                where: { userId, eventId, status: join_request_entity_1.JoinRequestStatus.APPROVED },
            });
            if (!joinReq) {
                throw new common_1.BadRequestException('You must be approved to check in to this event');
            }
        }
        const existing = await this.checkInRepo.findOne({ where: { userId, eventId } });
        if (existing) {
            throw new common_1.ConflictException('You have already checked in to this event');
        }
        const distance = this.haversineDistance(latitude, longitude, Number(event.latitude), Number(event.longitude));
        if (distance > MAX_CHECKIN_DISTANCE_KM) {
            throw new common_1.BadRequestException(`You are too far from the venue (${distance.toFixed(2)} km). Must be within ${MAX_CHECKIN_DISTANCE_KM * 1000}m.`);
        }
        const checkIn = this.checkInRepo.create({ userId, eventId, latitude, longitude });
        return this.checkInRepo.save(checkIn);
    }
    async getEventCheckIns(eventId) {
        return this.checkInRepo.find({
            where: { eventId },
            relations: { user: true },
            order: { checkedInAt: 'DESC' },
        });
    }
    async getCheckInStatus(userId, eventId) {
        const checkIn = await this.checkInRepo.findOne({ where: { userId, eventId } });
        return { checkedIn: !!checkIn, checkIn };
    }
};
exports.CheckInsService = CheckInsService;
exports.CheckInsService = CheckInsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(check_in_entity_1.CheckIn)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(2, (0, typeorm_1.InjectRepository)(join_request_entity_1.JoinRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CheckInsService);
//# sourceMappingURL=check-ins.service.js.map