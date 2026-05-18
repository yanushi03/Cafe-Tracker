export interface Coordinates {
  lat: number
  lng: number
}

export interface Cafe {
    id: number;
    name: string;
    location: string;
    coordinates: Coordinates;
    rating: number;
    imageUrl: string;
    openingHours: string;
    closeTime: string;
    isOpen: boolean;
    priceLevel: "$" | "$$" | "$$$";
    vibe: 'chill' | 'work-friendly' | 'lively';
    description: string;
}
