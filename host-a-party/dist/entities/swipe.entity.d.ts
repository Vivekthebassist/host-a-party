import { User } from './user.entity';
import { Event } from './event.entity';
export declare enum SwipeDirection {
    LEFT = "left",
    RIGHT = "right",
    SUPER_LIKE = "super_like"
}
export declare class Swipe {
    id: string;
    swiper: User;
    swiperId: string;
    swiped: User;
    swipedId: string;
    event: Event;
    eventId: string;
    direction: SwipeDirection;
    createdAt: Date;
}
