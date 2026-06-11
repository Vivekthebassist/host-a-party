import { EventStatus } from '../../entities/event.entity';
export declare class QueryEventsDto {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    status?: EventStatus;
    search?: string;
    page?: number;
    limit?: number;
}
