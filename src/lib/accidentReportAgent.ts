import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";

// 1. Define the Zod schema for the accident report
export const accidentReportSchema = z.object({
    locationDescription: z.string().describe("A textual description of the accident location based on the conversation (e.g., 'intersection of Oak St and Maple Ave', 'highway exit 23', 'parking lot behind the supermarket')"),
    timeEstimate: z.string().describe("An estimated time or time frame of the accident based on the conversation (e.g., 'around 4:30 PM', 'yesterday afternoon', 'a few minutes ago')"),
    eventDescription: z.string().describe("A concise summary of the events that occurred during the accident, as described in the conversation"),
    severity: z.enum(["Minor", "Moderate", "Severe", "Unknown"]).describe("An assessment of the accident's severity based on the conversation (Minor: minimal damage/injury, Moderate: noticeable damage/injury, Severe: significant damage/injury/emergency services involved)"),
    partiesInvolved: z.array(z.string()).describe("A list of distinct parties mentioned as being involved in the accident (e.g., ['red Toyota Camry', 'cyclist', 'white van', 'pedestrian'])"),
});

export type AccidentReport = z.infer<typeof accidentReportSchema>;

// 2. Create the output parser
// const parser = ZodStructuredOutputParser.fromZodSchema(accidentReportSchema);

// 3. Define the prompt template
const promptTemplate = PromptTemplate.fromTemplate(
    `Analyze the following conversation transcript describing an incident. Extract the key details and generate an accident report based *only* on the information present in the transcript.

Conversation Transcript:
{transcript}

Accident Report:`
);

// 4. Instantiate the Gemini model
// Ensure GOOGLE_API_KEY is set in your environment variables
const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.2, // Lower temperature for more factual extraction
});

// Create the structured LLM by binding the schema
const structuredLlm = model.withStructuredOutput(accidentReportSchema, {
    name: "accident_report_extractor", // Optional name for the function calling structure
});

// 5. Build the simplified LCEL chain
const chain = RunnableSequence.from([
    // Prepare the input for the prompt template
    (input: { transcript: string }) => ({ transcript: input.transcript }),
    promptTemplate,
    // Wrap the prompt output in an array containing a HumanMessage
    (promptOutput) => [new HumanMessage(promptOutput.toString())],
    structuredLlm, // Use the LLM with the structured output binding
    // The parser step is no longer needed here
]);

// 6. Export the function to generate the report
export async function generateAccidentReport(transcript: string): Promise<AccidentReport> {
    try {
        console.log("(Report Agent) Invoking chain for accident report...");
        const result = await chain.invoke({ transcript });
        console.log("(Report Agent) Received structured result:", result);
        return result;
    } catch (error) {
        console.error("Error generating accident report:", error);
        // Consider more robust error handling or returning a default/error state
        throw new Error("Failed to generate accident report.");
    }
} 