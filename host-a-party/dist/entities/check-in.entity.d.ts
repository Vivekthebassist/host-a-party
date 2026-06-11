import { User } from './user.entity';
import { Event } from './event.entity';
export declare class CheckIn {
    id: string;
    user: User;
    userId: string;
    event: Event;
    eventId: string;
    latitude: number;
    longitude: number;
    checkedInAt: Date;
}
