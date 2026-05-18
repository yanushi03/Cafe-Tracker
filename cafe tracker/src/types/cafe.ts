export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Location {
    address: string;
    city: string;
    postcode: string;
}

export interface Hours {
    display: string;
    open_now: boolean;
}

export interface Cafe {
    fsq_id: string;
    name: string;
    location: Location;
    geocodes: {
        main: Coordinates;
    };
    rating: number;
    photos: any[];
    hours: Hours;
    price: number;
    description?: string;
}

export interface SavedCafe extends Cafe {
    vibe: 'chill' | 'work-friendly' | 'lively';
}