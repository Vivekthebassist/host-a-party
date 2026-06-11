import { EventsService } from './events.service';
import { User } from '../entities/user.entity';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from './dto';
import { EventStatus } from '../entities/event.entity';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(user: User, dto: CreateEventDto): Promise<import("../entities").Event>;
    discover(query: QueryEventsDto): Promise<{
        events: import("../entities").Event[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getMyEvents(user: User): Promise<import("../entities").Event[]>;
    findOne(id: string): Promise<import("../entities").Event>;
    update(id: string, user: User, dto: UpdateEventDto): Promise<import("../entities").Event>;
    setStatus(id: string, status: EventStatus, user: User): Promise<import("../entities").Event>;
    delete(id: string, user: User): Promise<void>;
}
