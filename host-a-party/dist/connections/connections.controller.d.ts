import { ConnectionsService } from './connections.service';
import { User } from '../entities/user.entity';
import { SwipeDto } from './dto';
export declare class ConnectionsController {
    private readonly connectionsService;
    constructor(connectionsService: ConnectionsService);
    swipe(eventId: string, user: User, dto: SwipeDto): Promise<{
        swipe: import("../entities").Swipe;
        isMatch: boolean;
        match: import("../entities").Match | null;
    }>;
    getCandidates(eventId: string, user: User): Promise<User[]>;
    getEventMatches(eventId: string, user: User): Promise<import("../entities").Match[]>;
    getAllMatches(user: User): Promise<import("../entities").Match[]>;
}
