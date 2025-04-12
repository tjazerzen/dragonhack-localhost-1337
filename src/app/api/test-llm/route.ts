import { NextResponse } from 'next/server';
// import { model } from '@/lib/llm'; // No longer directly needed here
// Remove locationExtractor import
// import { extractLocationFromMessages, type Message } from '@/lib/locationExtractor';
import type { Message } from '@/lib/locationExtractor'; // Keep Message type if needed elsewhere
// Import the new agent function
import { extractAndGeocodeViaAgent } from '@/lib/geocodingAgent';
import type { GeocodingResult } from '@/lib/geocoding'; // Import the type for checking
// Import the accident report agent
import { generateAccidentReport, type AccidentReport } from '@/lib/accidentReportAgent';

// GET handler to test combined geocoding agent and accident report agent
export async function GET() {
    try {
        console.log("Testing Combined Geocoding Agent and Accident Report Agent...");

        // Original example messages
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

        // Format messages into a single transcript string
        const transcript = exampleMessages
            .map(msg => `${msg.sender}: ${msg.content}`)
            .join("\n");

        // --- Run the agents --- 
        // Remove location variable
        // let location: string | undefined = undefined;
        let geocodingResult: GeocodingResult | null = null;
        let accidentReport: AccidentReport | null = null;

        // 1. Call the Combined Geocoding Agent
        try {
            console.log("Invoking combined geocoding agent with transcript...");
            geocodingResult = await extractAndGeocodeViaAgent(transcript);
            console.log("Geocoding Agent Result (object or null):", geocodingResult);
        } catch (error) {
            console.error("Error during geocoding agent execution:", error);
            // Allow request to continue
        }

        // 2. Generate Accident Report (remains the same)
        try {
            console.log("Invoking accident report agent...");
            accidentReport = await generateAccidentReport(transcript);
            console.log("Accident Report Result:", accidentReport);
        } catch (error) {
            console.error("Error generating accident report:", error);
            // Allow request to continue
        }

        // 3. Return the combined results
        return NextResponse.json({
            success: true,
            // Remove extracted_location field
            // extracted_location: location || null,
            geocoding_result: geocodingResult, // Result comes directly from the agent now
            accident_report: accidentReport, // Will be null if generation failed
        });

    } catch (error) {
        // Catch unexpected errors in the overall handler
        console.error("Test API Top-Level Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
} 