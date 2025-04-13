import { NextRequest, NextResponse } from 'next/server';

// Ensure your Google API Key is stored securely, e.g., in environment variables
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// Helper function to get query parameters
function getQueryParam(req: NextRequest, param: string): string | null {
    return req.nextUrl.searchParams.get(param);
}

export async function GET(req: NextRequest) {
    if (!GOOGLE_API_KEY) {
        console.error('Google API Key not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const origin = getQueryParam(req, 'origin');
    const destination = getQueryParam(req, 'destination');

    if (!origin || !destination) {
        return NextResponse.json({ error: 'Missing origin or destination parameters' }, { status: 400 });
    }

    const googleDirectionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`;

    console.log(`Proxying request to Google Directions API: ${googleDirectionsUrl.replace(GOOGLE_API_KEY, '[REDACTED]')}`);

    try {
        const googleRes = await fetch(googleDirectionsUrl);
        const data = await googleRes.json();

        if (!googleRes.ok) {
            console.error('Google Directions API Error:', data);
            return NextResponse.json({ error: data.error_message || 'Error fetching directions' }, { status: googleRes.status });
        }

        // Optional: Log success or parts of the response for debugging
        // console.log('Google Directions API Success:', data);

        // Return the successful response from Google
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error proxying to Google Directions API:', error);
        return NextResponse.json({ error: 'Failed to fetch directions from Google' }, { status: 500 });
    }
} 