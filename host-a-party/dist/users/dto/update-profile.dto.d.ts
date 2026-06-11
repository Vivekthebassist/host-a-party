export declare class UpdateProfileDto {
    fullName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
    city?: string;
}
export declare class UpdateLocationDto {
    latitude: number;
    longitude: number;
    city?: string;
}
export declare class UpdatePreferencesDto {
    appearance?: string;
    locationEnabled?: boolean;
    showProfileInPartyMode?: boolean;
    pushNotificationsEnabled?: boolean;
}
