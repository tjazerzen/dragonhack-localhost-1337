import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";

// 1. Define the *NEW* Zod schema for the incident report
export const incidentReportSchema = z.object({
    noPoliceSupport: z.number().int().optional().describe("Estimated number of police units/officers needed or mentioned. Default to 0 if not mentioned or implied."),
    noFirefighterSupport: z.number().int().optional().describe("Estimated number of firefighter units/trucks needed or mentioned. Default to 0 if not mentioned or implied."),
    summary: z.string().describe("A concise summary of the incident based *only* on the conversation transcript provided."),
    location_description: z.string().describe("A textual description of the incident location based *only* on the conversation transcript (e.g., 'intersection of Oak St and Maple Ave', 'highway exit 23'). Avoid inferring details not present."),
    status: z.enum(["Critical", "Moderate"]).describe("Overall status or severity assessment based *only* on the transcript (Critical implies immediate danger, major damage/injury; Moderate implies significant but less immediately life-threatening situation)."),
    type: z.enum(["fire", "earthquake", "flood", "traffic_accident", "structural", "power_outage", "hazmat", "other", "unknown"]).describe("The primary type of incident reported based *only* on the transcript (fire, earthquake, flood, traffic_accident, structural, power_outage, hazmat, other, unknown)."),
});

// Use the new schema name for the type
export type IncidentReport = z.infer<typeof incidentReportSchema>;

// 2. Create the output parser - handled by withStructuredOutput

// 3. Define the prompt template - *Updated Instructions*
const promptTemplate = PromptTemplate.fromTemplate(
    `Analyze the following emergency call transcript. Extract the key details according to the requested JSON schema. Provide estimates for required support units based on the description. Base your answer *only* on the information present in the transcript.

Transcript:
--- START TRANSCRIPT ---
{transcript}
--- END TRANSCRIPT ---

Required JSON Output Format:
{{
  "noPoliceSupport": <number | undefined> (Estimate police units needed(between 0 and 6), 0 if none),
  "noFirefighterSupport": <number | undefined> (Estimate firefighter units needed(between 0 and 6), 0 if none),
  "summary": <string> (Concise incident summary),
  "location_description": <string> (Textual location description),
  "status": <"Critical" | "Moderate"> (Incident severity),
  "type": <"fire" | "earthquake" | "flood" | "traffic_accident" | "structural" | "power_outage" | "hazmat" | "other" | "unknown"> (Incident type)
}}`
);

// 4. Instantiate the Gemini model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.1, // Keep temperature low for factual extraction
});

// Create the structured LLM by binding the *NEW* schema
const structuredLlm = model.withStructuredOutput(incidentReportSchema, {
    name: "incident_report_extractor",
});

// 5. Build the simplified LCEL chain (structure remains the same)
const chain = RunnableSequence.from([
    (input: { transcript: string }) => ({ transcript: input.transcript }),
    promptTemplate,
    (promptOutput) => [new HumanMessage(promptOutput.toString())],
    structuredLlm,
]);

// 6. Export the function to generate the report - *Updated Return Type*
export async function generateAccidentReport(transcript: string): Promise<IncidentReport> {
    try {
        console.log("(Report Agent) Invoking chain for incident report...");
        const result = await chain.invoke({ transcript });
        console.log("(Report Agent) Received structured result:", result);
        // Add a fallback for optional fields if the LLM omits them
        return {
            noPoliceSupport: result.noPoliceSupport ?? 0,
            noFirefighterSupport: result.noFirefighterSupport ?? 0,
            summary: result.summary ?? "",
            location_description: result.location_description ?? "",
            status: result.status ?? "Moderate", // Default status if omitted
            type: result.type ?? "unknown", // Default type if omitted
        };
    } catch (error) {
        console.error("Error generating incident report:", error);
        // Consider returning a default error object matching the schema
        // For now, re-throwing the error as the API route handles it
        throw new Error("Failed to generate incident report.");
    }
} 