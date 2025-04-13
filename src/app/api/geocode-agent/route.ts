import { NextResponse } from 'next/server';
import { extractAndGeocodeViaAgent } from '@/lib/geocodingAgent';
import type { GeocodingResult } from '@/lib/geocoding';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transcript: string = body.transcript;

    if (typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Invalid transcript format in request body (must be a string)' }, { status: 400 });
    }

    //console.log('API route /api/geocode-agent received transcript:', transcript.substring(0, 100) + '...'); // Log start of transcript

    // Call the agent function
    const coordinates: GeocodingResult | null = await extractAndGeocodeViaAgent(transcript);

    //console.log('API route /api/geocode-agent result:', coordinates);

    // Return the result (coordinates object or null)
    return NextResponse.json({ coordinates });

  } catch (error) {
    console.error('Error in /api/geocode-agent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage, coordinates: null }, { status: 500 });
  }
} 