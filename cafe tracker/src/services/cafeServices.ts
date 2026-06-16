import type { Cafe } from '../types/cafe';

const OVERPASS_MIRRORS = [
    '/overpass',                                              // Vite dev proxy (no CORS)
    'https://overpass.private.coffee/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter',
];

// --- Filter categories (shared with UI) ---
export type FilterCategory = {
    id: string;
    label: string;
    icon: string;
    amenities: string[];
};

export const FILTER_CATEGORIES: FilterCategory[] = [
    { id: 'cafe',       label: 'Café',      icon: 'local_cafe',    amenities: ['cafe', 'coffee_shop'] },
    { id: 'restaurant', label: 'Restaurant', icon: 'restaurant',    amenities: ['restaurant'] },
    { id: 'bar',        label: 'Bar / Pub',  icon: 'sports_bar',    amenities: ['bar', 'pub'] },
    { id: 'dessert',    label: 'Dessert',    icon: 'icecream',      amenities: ['ice_cream', 'dessert'] },
    { id: 'bakery',     label: 'Bakery',     icon: 'bakery_dining', amenities: ['bakery'] },
    { id: 'fast_food',  label: 'Fast Food',  icon: 'fastfood',      amenities: ['fast_food'] },
];

export function applyFilters(cafes: Cafe[], active: Set<string>): Cafe[] {
    if (active.size === 0) return cafes;
    return cafes.filter((cafe) =>
        [...active].some((id) => {
            const cat = FILTER_CATEGORIES.find((c) => c.id === id);
            return cat?.amenities.includes(cafe.amenity ?? '') ?? false;
        })
    );
}

// --- Label maps ---
const CUISINE_LABELS: Record<string, string> = {
    coffee_shop: 'Coffee Shop', cafe: 'Café', dessert: 'Dessert',
    ice_cream: 'Ice Cream', bubble_tea: 'Bubble Tea', cake: 'Bakery',
    bakery: 'Bakery', sandwich: 'Sandwich', pizza: 'Pizza', burger: 'Burgers',
    sushi: 'Sushi', ramen: 'Ramen', noodle: 'Noodles', noodles: 'Noodles',
    asian: 'Asian', western: 'Western', japanese: 'Japanese', chinese: 'Chinese',
    korean: 'Korean', thai: 'Thai', indian: 'Indian', italian: 'Italian',
    french: 'French', mediterranean: 'Mediterranean', american: 'American',
    breakfast: 'Breakfast', brunch: 'Brunch', vegetarian: 'Vegetarian', vegan: 'Vegan',
    seafood: 'Seafood', steak: 'Steak House', tapas: 'Tapas', bar: 'Bar',
};

const AMENITY_LABELS: Record<string, string> = {
    cafe: 'Café', coffee_shop: 'Coffee Shop', restaurant: 'Restaurant',
    bar: 'Bar', pub: 'Pub', fast_food: 'Fast Food',
    ice_cream: 'Ice Cream', bakery: 'Bakery', dessert: 'Dessert',
    food_court: 'Food Court', biergarten: 'Beer Garden',
};

export function formatCafeType(cuisine?: string, amenity?: string): string {
    if (cuisine) {
        const primary = cuisine.split(';')[0].trim().toLowerCase();
        if (CUISINE_LABELS[primary]) return CUISINE_LABELS[primary];
        return primary.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (amenity && AMENITY_LABELS[amenity]) return AMENITY_LABELS[amenity];
    return 'Café';
}

// --- Gradient (unchanged) ---
export function cafeGradient(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = 90 + (Math.abs(hash) % 50);
    return `linear-gradient(135deg, hsl(${hue},30%,72%), hsl(${hue + 20},25%,62%))`;
}

// --- Helpers ---
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatAddress(tags: Record<string, string>): string {
    const parts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:suburb'] || tags['addr:city'],
    ].filter(Boolean);
    return parts.join(', ') || tags['addr:full'] || '';
}

function normaliseInstagram(raw: string): string {
    if (raw.startsWith('http')) return raw;
    return `https://www.instagram.com/${raw.replace(/^@/, '')}`;
}

// --- API ---
function fetchOverpass(query: string): Promise<any> {
    const encoded = `data=${encodeURIComponent(query)}`;
    const tryMirror = (index: number): Promise<any> => {
        if (index >= OVERPASS_MIRRORS.length) {
            throw new Error('All Overpass API mirrors failed. Please try again later.');
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        return fetch(OVERPASS_MIRRORS[index], {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encoded,
            signal: controller.signal,
        })
            .then((r) => {
                clearTimeout(timer);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .catch(() => {
                clearTimeout(timer);
                return tryMirror(index + 1);
            });
    };
    return tryMirror(0);
}

export function getCafesByLocation(lat: number, lng: number): Promise<Cafe[]> {
    const query = `
        [out:json][timeout:25];
        (
            nwr["amenity"~"cafe|coffee_shop|restaurant|bar|pub|fast_food|ice_cream|dessert|bakery|food_court|biergarten"](around:1500,${lat},${lng});
            nwr["shop"~"bakery|confectionery|pastry"](around:1500,${lat},${lng});
        );
        out body center;
    `;

    return fetchOverpass(query).then((data) =>
        (data.elements as any[])
            .filter((el) => el.tags?.name)
            .map((el) => {
                const elLat: number = el.type === 'node' ? el.lat : el.center?.lat;
                const elLng: number = el.type === 'node' ? el.lon : el.center?.lon;
                if (!elLat || !elLng) return null;
                return {
                    id: String(el.id),
                    name: el.tags.name as string,
                    lat: elLat,
                    lng: elLng,
                    address: formatAddress(el.tags),
                    openingHours: el.tags['opening_hours'],
                    website: el.tags['website'] || el.tags['contact:website'] || el.tags['url'],
                    instagram: (el.tags['contact:instagram'] || el.tags['instagram'])
                        ? normaliseInstagram(el.tags['contact:instagram'] || el.tags['instagram'])
                        : undefined,
                    cuisine: el.tags['cuisine'],
                    amenity: el.tags['amenity'] || el.tags['shop'],
                    distance: haversineDistance(lat, lng, elLat, elLng),
                };
            })
            .filter((el): el is Cafe => el !== null)
            .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    );
}
