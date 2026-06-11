import { EventStatus } from '../../entities/event.entity';
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    coverImageUrl?: string;
    venue?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    startsAt?: string;
    endsAt?: string;
    maxGuests?: number;
    price?: number;
    partyModeEnabled?: boolean;
    tags?: string[];
    status?: EventStatus;
}
