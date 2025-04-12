import { z } from "zod";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { geocodeTool, type GeocodingResult } from "./geocoding"; // Import type
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";

// Zod schema for validation
const GeocodingResultSchema = z.object({
    lat: z.number(),
    lng: z.number(),
});

// 1. Initialize the Gemini Model
// Ensure GOOGLE_API_KEY is set in your environment
const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash", // Keep the working model name
    temperature: 0,
});

// 2. Define the Tools (we already have geocodeTool)
const tools = [geocodeTool];

// 3. Create the Agent Prompt
// *** Updated Prompt for Transcript Analysis ***
const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an assistant that analyzes conversation transcripts to find geographic coordinates.
- First, carefully read the transcript and identify the single, most specific street address or place name mentioned that can be used for geocoding.
- If a specific, geocodable location is identified, use the 'google_maps_geocoder' tool with that exact location string.
- If no specific location is found, or the location is too vague (e.g., "near the park", "downtown"), respond with the text "No specific location found".
- Only use the tools provided. Do not make up information.
- Respond ONLY with the JSON coordinates (e.g., {{"lat": 46.05, "lng": 14.51}}) if the tool is used successfully, or the exact text "No specific location found" otherwise.`
    ],
    // Use "transcript" as the input key
    ["human", "Analyze this transcript:\n\n{transcript}"],
    new MessagesPlaceholder("agent_scratchpad"),
]);


// 4. Create the Agent
const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt,
});

// 5. Create the Agent Executor
const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // Keep verbose for debugging
});

// Helper type guard
// function isGeocodingResult(obj: any): obj is GeocodingResult {
//     return obj && typeof obj.lat === 'number' && typeof obj.lng === 'number';
// }

// 6. Define the function to run the agent
// *** Renamed and updated function signature ***
/**
 * Takes a conversation transcript and uses an agent to identify a location
 * within it and fetch its coordinates using the geocoding tool.
 * @param transcript The full conversation transcript.
 * @returns A promise that resolves to the GeocodingResult object or null if unsuccessful or no location found.
 */
export async function extractAndGeocodeViaAgent(transcript: string): Promise<GeocodingResult | null> {
    console.log(`(Agent) Invoking geocoding agent with transcript...`);
    try {
        const result = await agentExecutor.invoke({
            // Pass the transcript to the input key defined in the prompt
            transcript: transcript,
        });

        console.log("(Agent) Raw Result:", result);

        // Check if the output is the specific string indicating no location
        if (typeof result.output === 'string' && result.output.trim() === "No specific location found") {
            console.log("(Agent) Agent indicated no specific location found.");
            return null;
        }

        // Attempt to parse and validate if it's not the "not found" message
        if (typeof result.output === 'string') {
            try {
                let jsonString = result.output.trim();
                // Regex to find JSON content optionally wrapped in ```json ... ```
                const match = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);

                if (match && match[1]) {
                    jsonString = match[1].trim();
                    console.log("(Agent) Extracted JSON from fences:", jsonString);
                } else {
                    console.log("(Agent) No fences detected, attempting direct parse:", jsonString);
                }

                const parsedJson = JSON.parse(jsonString);
                const validationResult = GeocodingResultSchema.safeParse(parsedJson);

                if (validationResult.success) {
                    console.log("(Agent) Parsed & Validated Coordinates:", validationResult.data);
                    return validationResult.data;
                } else {
                    console.warn("(Agent) Zod validation failed:", validationResult.error.errors);
                }
            } catch (parseError) {
                console.warn("(Agent) Failed to parse agent output as JSON:", result.output, parseError);
            }
        } else {
            console.error("(Agent) Unexpected result format (output not a string):", result);
        }

        return null;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown agent execution error";
        console.error(`(Agent) Error invoking agent with transcript:`, error);
        return null;
    }
} 