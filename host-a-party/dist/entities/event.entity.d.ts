import { User } from './user.entity';
import { JoinRequest } from './join-request.entity';
import { Swipe } from './swipe.entity';
import { Match } from './match.entity';
import { Message } from './message.entity';
import { CheckIn } from './check-in.entity';
export declare enum EventStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    LIVE = "live",
    ENDED = "ended",
    CANCELLED = "cancelled"
}
export declare class Event {
    id: string;
    title: string;
    description: string;
    coverImageUrl: string;
    venue: string;
    address: string;
    latitude: number;
    longitude: number;
    startsAt: Date;
    endsAt: Date;
    maxGuests: number;
    price: number;
    status: EventStatus;
    partyModeEnabled: boolean;
    tags: string[];
    host: User;
    hostId: string;
    createdAt: Date;
    updatedAt: Date;
    joinRequests: JoinRequest[];
    swipes: Swipe[];
    matches: Match[];
    messages: Message[];
    checkIns: CheckIn[];
}
