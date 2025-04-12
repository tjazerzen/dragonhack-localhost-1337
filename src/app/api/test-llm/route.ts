import { NextResponse } from 'next/server';
// import { model } from '@/lib/llm'; // No longer directly needed here
import { extractLocationFromMessages, type Message } from '@/lib/locationExtractor';
// import { geocodeTool } from '@/lib/geocoding'; // No longer needed here
import { runGeocodingAgent } from '@/lib/geocodingAgent'; // Import the agent runner
import type { GeocodingResult } from '@/lib/geocoding'; // Import the type for checking

// GET handler to test location extraction and geocoding agent
export async function GET() {
    try {
        console.log("Testing Location Extraction and Geocoding Agent...");

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
            return NextResponse.json({ success: true, message: "No location found by LLM.", extracted_location: null, agent_result: null });
        }

        // 2. Call Geocoding Agent
        console.log(`Invoking geocoding agent with: "${location}"`);
        const agentResult: GeocodingResult | null = await runGeocodingAgent(location); // Use the agent, get object or null
        console.log("Agent Result (object or null):", agentResult);

        // 3. Return the result
        if (agentResult) {
            return NextResponse.json({
                success: true,
                extracted_location: location,
                agent_result: agentResult // Return the object
            });
        } else {
            return NextResponse.json({
                success: false, // Indicate failure if agent returned null
                message: "Agent failed to retrieve or parse coordinates.",
                extracted_location: location,
                agent_result: null
            });
        }

    } catch (error) {
        console.error("Test Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
} 