import { Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from './dto';
export declare class EventsService {
    private readonly eventRepo;
    constructor(eventRepo: Repository<Event>);
    create(hostId: string, dto: CreateEventDto): Promise<Event>;
    findById(id: string): Promise<Event>;
    update(eventId: string, userId: string, dto: UpdateEventDto): Promise<Event>;
    delete(eventId: string, userId: string): Promise<void>;
    discover(query: QueryEventsDto): Promise<{
        events: Event[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyHostedEvents(userId: string): Promise<Event[]>;
    setStatus(eventId: string, userId: string, status: EventStatus): Promise<Event>;
}
