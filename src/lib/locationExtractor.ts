import { z } from "zod";
import { model } from "./llm";
import { HumanMessage } from "@langchain/core/messages";

// Define the schema for the location output
const LocationSchema = z.object({
    location: z.string().optional().describe("The full street address or location name mentioned in the text. If no location is mentioned, omit this field."),
});

// Type for the input messages (assuming a structure)
// Export the interface so it can be imported elsewhere
export interface Message {
    sender: 'admin' | 'caller'; // Or other relevant roles
    content: string;
}

/**
 * Extracts location information from a list of messages.
 * @param messages An array of message objects.
 * @returns The extracted location string or undefined if no location is found.
 */
export async function extractLocationFromMessages(messages: Message[]): Promise<string | undefined> {
    // Format messages into a single string prompt for the LLM
    const formattedMessages = messages
        .map(msg => `${msg.sender}: ${msg.content}`)
        .join("\n");

    const prompt = `
    Review the following conversation transcript:
    --- Transcript ---
    ${formattedMessages}
    --- End Transcript ---

    Identify the main location or address mentioned in the conversation. If possible, provide a specific street address or intersection that could be used for geocoding. Avoid vague terms like "near" if a more specific point can be identified from the context.
    If no specific location or address is mentioned, do not provide one.
  `;

    try {
        const structuredLlm = model.withStructuredOutput(LocationSchema, {
            name: "location_extractor", // Optional: Name for the structured output function
        });

        console.log("Invoking LLM for location extraction...");
        const result = await structuredLlm.invoke([new HumanMessage(prompt)]);
        console.log("Location extraction result:", result);

        return result.location;
    } catch (error) {
        console.error("Error during location extraction:", error);
        // Decide how to handle errors - maybe return undefined or throw
        return undefined;
    }
} 