interface GeocodingResult {
    lat: number;
    lng: number;
}

interface GoogleGeocodingResponse {
    results: {
        geometry: {
            location: GeocodingResult;
        };
    }[];
    status: string; // e.g., "OK", "ZERO_RESULTS", "OVER_QUERY_LIMIT"
    error_message?: string;
}

/**
 * Fetches coordinates for a given location string using Google Maps Geocoding API.
 * @param location The location string (address, place name, etc.).
 * @returns An object with latitude and longitude, or null if not found or an error occurs.
 */
export async function getCoordinates(location: string): Promise<GeocodingResult | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("GOOGLE_MAPS_API_KEY environment variable is not set.");
        return null;
    }

    if (!location || location.trim() === "") {
        console.log("Cannot geocode empty location string.");
        return null;
    }

    const encodedLocation = encodeURIComponent(location);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;

    console.log(`Fetching coordinates for: "${location}"`);

    try {
        const response = await fetch(url);
        const data: GoogleGeocodingResponse = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const coordinates = data.results[0].geometry.location;
            console.log("Coordinates found:", coordinates);
            return coordinates; // { lat: number, lng: number }
        } else {
            console.warn(`Geocoding failed for "${location}". Status: ${data.status}. ${data.error_message || ''}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching coordinates for "${location}":`, error);
        return null;
    }
} 