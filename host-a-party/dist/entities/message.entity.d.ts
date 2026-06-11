import { User } from './user.entity';
import { Event } from './event.entity';
import { Match } from './match.entity';
export declare class Message {
    id: string;
    match: Match;
    matchId: string;
    sender: User;
    senderId: string;
    event: Event;
    eventId: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
}
