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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../entities/event.entity");
let EventsService = class EventsService {
    constructor(eventRepo) {
        this.eventRepo = eventRepo;
    }
    async create(hostId, dto) {
        const event = this.eventRepo.create({
            ...dto,
            hostId,
            startsAt: new Date(dto.startsAt),
            endsAt: new Date(dto.endsAt),
        });
        return this.eventRepo.save(event);
    }
    async findById(id) {
        const event = await this.eventRepo.findOne({
            where: { id },
            relations: { host: true },
        });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async update(eventId, userId, dto) {
        const event = await this.findById(eventId);
        if (event.hostId !== userId) {
            throw new common_1.ForbiddenException('Only the host can update this event');
        }
        const updateData = { ...dto };
        if (dto.startsAt)
            updateData.startsAt = new Date(dto.startsAt);
        if (dto.endsAt)
            updateData.endsAt = new Date(dto.endsAt);
        await this.eventRepo.update(eventId, updateData);
        return this.findById(eventId);
    }
    async delete(eventId, userId) {
        const event = await this.findById(eventId);
        if (event.hostId !== userId) {
            throw new common_1.ForbiddenException('Only the host can delete this event');
        }
        await this.eventRepo.remove(event);
    }
    async discover(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 50);
        const qb = this.eventRepo
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.host', 'host')
            .where('event.status IN (:...statuses)', {
            statuses: [event_entity_1.EventStatus.PUBLISHED, event_entity_1.EventStatus.LIVE],
        });
        if (query.latitude && query.longitude) {
            const radiusKm = query.radiusKm || 50;
            qb.andWhere(`(6371 * acos(cos(radians(:lat)) * cos(radians(event.latitude)) * cos(radians(event.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(event.latitude)))) < :radius`, { lat: query.latitude, lng: query.longitude, radius: radiusKm });
            qb.addSelect(`(6371 * acos(cos(radians(:lat)) * cos(radians(event.latitude)) * cos(radians(event.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(event.latitude))))`, 'distance');
            qb.orderBy('distance', 'ASC');
        }
        else {
            qb.orderBy('event.startsAt', 'ASC');
        }
        if (query.search) {
            qb.andWhere('(event.title ILIKE :search OR event.venue ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        qb.skip((page - 1) * limit).take(limit);
        const [events, total] = await qb.getManyAndCount();
        return {
            events,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getMyHostedEvents(userId) {
        return this.eventRepo.find({
            where: { hostId: userId },
            order: { startsAt: 'DESC' },
        });
    }
    async setStatus(eventId, userId, status) {
        const event = await this.findById(eventId);
        if (event.hostId !== userId) {
            throw new common_1.ForbiddenException('Only the host can change event status');
        }
        await this.eventRepo.update(eventId, { status });
        return this.findById(eventId);
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map