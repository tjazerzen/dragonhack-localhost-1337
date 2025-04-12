import { z } from "zod";
import { DynamicTool } from "@langchain/core/tools";

export interface GeocodingResult {
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

async function fetchCoordinatesFromGoogle(location: string): Promise<GeocodingResult | string> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        console.error("GOOGLE_MAPS_API_KEY environment variable is not set.");
        return "Error: Server configuration missing API key.";
    }

    if (!location || location.trim() === "") {
        return "Error: Cannot geocode empty location string.";
    }

    const encodedLocation = encodeURIComponent(location);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${apiKey}`;

    console.log(`(Tool) Fetching coordinates for: "${location}"`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google API request failed with status ${response.status}: ${errorText}`);
        }
        const data: GoogleGeocodingResponse = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            const coordinates = data.results[0].geometry.location;
            console.log("(Tool) Coordinates found:", coordinates);
            return coordinates; // Return the object if successful
        } else {
            const errorMessage = `Geocoding failed. Status: ${data.status}. ${data.error_message || 'Unknown reason'}`;
            console.warn(`(Tool) ${errorMessage}`);
            return `Error: ${errorMessage}`; // Return error string
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown fetch/parse error";
        console.error(`(Tool) Error during geocoding fetch for "${location}":`, error);
        return `Error: ${errorMessage}`; // Return error string
    }
}

export const geocodeTool = new DynamicTool({
    name: "google_maps_geocoder",
    description: "Fetches latitude and longitude for a given street address or place name using the Google Maps Geocoding API. Input should be the location string itself.",
    // func expects a string and returns a string
    func: async (location: string): Promise<string> => {
        const result = await fetchCoordinatesFromGoogle(location);
        if (typeof result === 'string') {
            // If the fetch function returned an error string
            return result;
        }
        // If successful, stringify the coordinates object for the Agent
        return JSON.stringify(result);
    },
});

export async function getCoordinates(location: string): Promise<GeocodingResult | null> {
    console.log(`(Standalone) Getting coordinates for: "${location}"`);
    const result = await fetchCoordinatesFromGoogle(location);
    if (typeof result === 'string') {

        return null;
    }
    return result;
} 