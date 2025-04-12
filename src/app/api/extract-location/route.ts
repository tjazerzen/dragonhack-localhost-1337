import { NextResponse } from 'next/server';
import { extractLocationFromMessages, Message } from '@/lib/locationExtractor';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const messages: Message[] = body.messages;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format in request body' }, { status: 400 });
        }

        console.log("API route /api/extract-location received messages:", messages);

        // Call the server-side function (which can access env vars)
        const location = await extractLocationFromMessages(messages);

        console.log("API route /api/extract-location extracted location:", location);

        if (location) {
            return NextResponse.json({ location });
        } else {
            // Return success even if no location found, just indicate it
            return NextResponse.json({ location: null });
        }

    } catch (error) {
        console.error("Error in /api/extract-location:", error);
        // Check if the error is an instance of Error to access message property safely
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 