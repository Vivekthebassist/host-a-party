export declare class CreateEventDto {
    title: string;
    description: string;
    coverImageUrl?: string;
    venue: string;
    address: string;
    latitude: number;
    longitude: number;
    startsAt: string;
    endsAt: string;
    maxGuests: number;
    price?: number;
    partyModeEnabled?: boolean;
    tags?: string[];
}
