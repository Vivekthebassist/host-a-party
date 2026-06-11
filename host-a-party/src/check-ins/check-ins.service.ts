import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { Event, EventStatus } from '../entities/event.entity';
import { JoinRequest, JoinRequestStatus } from '../entities/join-request.entity';

const MAX_CHECKIN_DISTANCE_KM = 0.5; // 500 meters

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private readonly checkInRepo: Repository<CheckIn>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(JoinRequest)
    private readonly joinReqRepo: Repository<JoinRequest>,
  ) {}

  private haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async checkIn(userId: string, eventId: string, latitude: number, longitude: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    if (event.status !== EventStatus.LIVE && event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Check-in is not available for this event');
    }

    // Verify user is approved or is the host
    if (event.hostId !== userId) {
      const joinReq = await this.joinReqRepo.findOne({
        where: { userId, eventId, status: JoinRequestStatus.APPROVED },
      });
      if (!joinReq) {
        throw new BadRequestException('You must be approved to check in to this event');
      }
    }

    const existing = await this.checkInRepo.findOne({ where: { userId, eventId } });
    if (existing) {
      throw new ConflictException('You have already checked in to this event');
    }

    const distance = this.haversineDistance(
      latitude, longitude,
      Number(event.latitude), Number(event.longitude),
    );

    if (distance > MAX_CHECKIN_DISTANCE_KM) {
      throw new BadRequestException(
        `You are too far from the venue (${distance.toFixed(2)} km). Must be within ${MAX_CHECKIN_DISTANCE_KM * 1000}m.`,
      );
    }

    const checkIn = this.checkInRepo.create({ userId, eventId, latitude, longitude });
    return this.checkInRepo.save(checkIn);
  }

  async getEventCheckIns(eventId: string) {
    return this.checkInRepo.find({
      where: { eventId },
      relations: { user: true },
      order: { checkedInAt: 'DESC' },
    });
  }

  async getCheckInStatus(userId: string, eventId: string) {
    const checkIn = await this.checkInRepo.findOne({ where: { userId, eventId } });
    return { checkedIn: !!checkIn, checkIn };
  }
}
