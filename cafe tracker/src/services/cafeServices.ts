import type { Cafe } from "../types/cafe";

const API_BASE_URL = "/foursquare/places/search";
const API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;
const HEADERS = {
    Authorization: `Bearer ${API_KEY}`,
    Accept: "application/json",
    "X-Places-Api-Version": "2025-06-17"
};

export function getCafesByLocation(lat: number, lng: number): Promise<Cafe[]> {
    const url = `${API_BASE_URL}?ll=${lat},${lng}&categories=13035&limit=20`;
    return fetch(url, { headers: HEADERS })
        .then((response) => response.json())
        .then((data) => data.results);
}

export function getCafeBySearch(query: string): Promise<Cafe[]> {
    const url = `${API_BASE_URL}?near=${encodeURIComponent(query)}&categories=13035&limit=20`;
    return fetch(url, { headers: HEADERS })
        .then((response) => response.json())
        .then((data) => data.results);
}
