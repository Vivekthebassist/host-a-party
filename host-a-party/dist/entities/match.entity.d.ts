import { User } from './user.entity';
import { Event } from './event.entity';
import { Message } from './message.entity';
export declare class Match {
    id: string;
    userOne: User;
    userOneId: string;
    userTwo: User;
    userTwoId: string;
    event: Event;
    eventId: string;
    isSuperLike: boolean;
    createdAt: Date;
    messages: Message[];
}
