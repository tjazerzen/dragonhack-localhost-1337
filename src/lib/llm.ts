import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Initialize the Gemini LLM
// The GOOGLE_API_KEY will be automatically picked up from process.env
export const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash", // Or specify the exact Gemini model you want to use
    maxOutputTokens: 2048,
    // You can add other configuration options here if needed
});

// Optional: You could add more models or configurations here 