import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from './dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async create(hostId: string, dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepo.create({
      ...dto,
      hostId,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
    });
    return this.eventRepo.save(event);
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: { host: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(eventId: string, userId: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findById(eventId);
    if (event.hostId !== userId) {
      throw new ForbiddenException('Only the host can update this event');
    }

    const updateData: Record<string, any> = { ...dto };
    if (dto.startsAt) updateData.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) updateData.endsAt = new Date(dto.endsAt);

    await this.eventRepo.update(eventId, updateData);
    return this.findById(eventId);
  }

  async delete(eventId: string, userId: string): Promise<void> {
    const event = await this.findById(eventId);
    if (event.hostId !== userId) {
      throw new ForbiddenException('Only the host can delete this event');
    }
    await this.eventRepo.remove(event);
  }

  async discover(query: QueryEventsDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 50);

    const qb = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.host', 'host')
      .where('event.status IN (:...statuses)', {
        statuses: [EventStatus.PUBLISHED, EventStatus.LIVE],
      });

    if (query.latitude && query.longitude) {
      const radiusKm = query.radiusKm || 50;
      // Haversine approximation for nearby filtering
      qb.andWhere(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(event.latitude)) * cos(radians(event.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(event.latitude)))) < :radius`,
        { lat: query.latitude, lng: query.longitude, radius: radiusKm },
      );
      qb.addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(event.latitude)) * cos(radians(event.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(event.latitude))))`,
        'distance',
      );
      qb.orderBy('distance', 'ASC');
    } else {
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

  async getMyHostedEvents(userId: string) {
    return this.eventRepo.find({
      where: { hostId: userId },
      order: { startsAt: 'DESC' },
    });
  }

  async setStatus(eventId: string, userId: string, status: EventStatus): Promise<Event> {
    const event = await this.findById(eventId);
    if (event.hostId !== userId) {
      throw new ForbiddenException('Only the host can change event status');
    }
    await this.eventRepo.update(eventId, { status });
    return this.findById(eventId);
  }
}
