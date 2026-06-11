import { Repository } from 'typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { Event } from '../entities/event.entity';
import { JoinRequest } from '../entities/join-request.entity';
export declare class CheckInsService {
    private readonly checkInRepo;
    private readonly eventRepo;
    private readonly joinReqRepo;
    constructor(checkInRepo: Repository<CheckIn>, eventRepo: Repository<Event>, joinReqRepo: Repository<JoinRequest>);
    private haversineDistance;
    checkIn(userId: string, eventId: string, latitude: number, longitude: number): Promise<CheckIn>;
    getEventCheckIns(eventId: string): Promise<CheckIn[]>;
    getCheckInStatus(userId: string, eventId: string): Promise<{
        checkedIn: boolean;
        checkIn: CheckIn | null;
    }>;
}
