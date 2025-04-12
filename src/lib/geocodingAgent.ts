import { z } from "zod";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { geocodeTool, type GeocodingResult } from "./geocoding"; // Import type

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
// Adjusted prompt to explicitly ask for JSON output
const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant that uses tools to find geographic coordinates for a given location. Only use the tools provided. Respond with the final coordinates in JSON format (e.g., {{\"lat\": 46.05, \"lng\": 14.51}}) or an error message if geocoding fails."],
    ["human", "{input}"],
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
    verbose: true,
});

// Helper type guard
// function isGeocodingResult(obj: any): obj is GeocodingResult {
//     return obj && typeof obj.lat === 'number' && typeof obj.lng === 'number';
// }

// 6. Define the function to run the agent
/**
 * Takes a location string and uses the geocoding agent to find coordinates.
 * @param location The street address or place name to geocode.
 * @returns A promise that resolves to the GeocodingResult object or null if unsuccessful.
 */
export async function runGeocodingAgent(location: string): Promise<GeocodingResult | null> {
    console.log(`(Agent) Invoking geocoding agent for: "${location}"`);
    try {
        const result = await agentExecutor.invoke({
            input: location,
        });

        console.log("(Agent) Raw Result:", result);

        if (typeof result.output === 'string') {
            try {
                let jsonString = result.output.trim();
                // Regex to find JSON content optionally wrapped in ```json ... ```
                const match = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);

                if (match && match[1]) {
                    // If fences are found, use the captured content
                    jsonString = match[1].trim();
                    console.log("(Agent) Extracted JSON from fences:", jsonString);
                } else {
                    // If no fences, assume the string might be the JSON directly
                    console.log("(Agent) No fences detected, attempting direct parse:", jsonString);
                }

                const parsedJson = JSON.parse(jsonString); // Parse first
                const validationResult = GeocodingResultSchema.safeParse(parsedJson); // Then validate with Zod

                if (validationResult.success) {
                    console.log("(Agent) Parsed & Validated Coordinates:", validationResult.data);
                    return validationResult.data; // Return the validated data
                } else {
                    console.warn("(Agent) Zod validation failed:", validationResult.error.errors);
                }
            } catch (parseError) {
                console.warn("(Agent) Failed to parse agent output as JSON:", result.output, parseError);
                // Could add fallback parsing for "lat, lng" string here if needed
            }
        } else {
            console.error("(Agent) Unexpected result format (output not a string):", result);
        }

        // If parsing/validation failed or output wasn't a string
        return null;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown agent execution error";
        console.error(`(Agent) Error invoking agent for "${location}":`, error);
        return null; // Return null on agent execution error
    }
} 