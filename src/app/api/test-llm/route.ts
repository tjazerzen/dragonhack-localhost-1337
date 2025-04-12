import { NextResponse } from 'next/server';
import { model } from '@/lib/llm';

// Simple GET handler to test the LLM
export async function GET() {
    try {
        console.log("Testing LLM...");
        const result = await model.invoke("Hello! Tell me a short joke.");
        console.log("LLM Result:", result);

        // Return the raw content from the AIMessage
        return NextResponse.json({ success: true, response: result.content });
    } catch (error) {
        console.error("LLM Test Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
} 