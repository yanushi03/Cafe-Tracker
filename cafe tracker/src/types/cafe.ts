export interface Cafe {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    openingHours?: string;
    website?: string;
    instagram?: string;
    cuisine?: string;
    amenity?: string;
    distance?: number;
}

export interface SavedCafe extends Cafe {}

export interface DiaryEntry extends Cafe {
    vibe: 'chill' | 'work-friendly' | 'lively';
    rating?: number;
    note?: string;
    willVisitAgain?: boolean;
    visitedAt: string;
}
