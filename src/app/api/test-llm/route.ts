import { NextResponse } from 'next/server';
// import { model } from '@/lib/llm'; // No longer directly needed here
import { extractLocationFromMessages, type Message } from '@/lib/locationExtractor';
import { getCoordinates } from '@/lib/geocoding'; // Import the new function

// GET handler to test location extraction and geocoding
export async function GET() {
    try {
        console.log("Testing Location Extraction and Geocoding (Complex Case)...");

        // Example messages - Complex, ambiguous, multiple locations mentioned
        const exampleMessages: Message[] = [
            { sender: 'caller', content: 'Help! There\'s a guy causing trouble outside.' },
            { sender: 'admin', content: 'Okay, where are you located?' },
            { sender: 'caller', content: 'I\'m on the main shopping street, you know, by that new coffee shop... the one with the green sign? Not the Starbucks.' },
            { sender: 'admin', content: 'Do you mean near Čopova or maybe Trubarjeva Street?' },
            { sender: 'caller', content: 'Trubarjeva! That\'s it. Yeah, near the... uh... dragon statue thing. The bridge!' },
            { sender: 'admin', content: 'Okay, so near the Dragon Bridge on Trubarjeva cesta? Is he near a specific store there?' },
            { sender: 'caller', content: 'Right by the bridge, near the corner, I think it\'s next to that small bakery. Forget the bakery, he\'s closer to the bridge itself. Traffic is bad today too.' },
            { sender: 'admin', content: 'Understood, near the Dragon Bridge on Trubarjeva cesta. Sending officers now.' },
        ];

        // 1. Extract Location
        const location = await extractLocationFromMessages(exampleMessages);
        console.log("Extracted Location String:", location);

        if (!location) {
            return NextResponse.json({ success: true, message: "No location found by LLM." });
        }

        // 2. Geocode Location
        const coordinates = await getCoordinates(location);
        console.log("Found Coordinates:", coordinates);

        if (!coordinates) {
            return NextResponse.json({ success: true, location: location, message: "Could not find coordinates for the location." });
        }

        // 3. Return both
        return NextResponse.json({ success: true, location: location, coordinates: coordinates });

    } catch (error) {
        console.error("Test Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
} 