import { CheckInsService } from './check-ins.service';
import { User } from '../entities/user.entity';
import { CheckInDto } from './dto';
export declare class CheckInsController {
    private readonly checkInsService;
    constructor(checkInsService: CheckInsService);
    checkIn(eventId: string, user: User, dto: CheckInDto): Promise<import("../entities").CheckIn>;
    getEventCheckIns(eventId: string): Promise<import("../entities").CheckIn[]>;
    getStatus(eventId: string, user: User): Promise<{
        checkedIn: boolean;
        checkIn: import("../entities").CheckIn | null;
    }>;
}
