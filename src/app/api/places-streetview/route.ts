import { NextResponse } from 'next/server';

// Cache successful responses for 1 hour
const CACHE_MAX_AGE = 60 * 60;

// Configuration
const DEFAULT_SIZE = '700x400';
const DEFAULT_FOV = 90;
const DEFAULT_HEADING = 0;
const DEFAULT_PITCH = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const size = searchParams.get('size') || DEFAULT_SIZE;
  const fov = searchParams.get('fov') || DEFAULT_FOV;
  const heading = searchParams.get('heading') || DEFAULT_HEADING;
  const pitch = searchParams.get('pitch') || DEFAULT_PITCH;
  
  if (!lat || !lng) {
    console.warn('❌ Missing coordinates');
    return NextResponse.json({ error: 'Missing latitude or longitude' }, {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  }

  // Read API key from environment variables
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  // Check if the API key is set
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('GOOGLE_MAPS_API_KEY environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error: Missing API key.' }, { status: 500 });
  }

  try {
    // Construct the Google Street View API URL
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&fov=${fov}&heading=${heading}&pitch=${pitch}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('🖼️ Generated Google Street View image URL (token redacted):', 
      streetViewUrl.replace(GOOGLE_MAPS_API_KEY, 'REDACTED'));
    
    // Return the image URL directly
    return NextResponse.json({ photoUrl: streetViewUrl }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
      }
    });
  } catch (error) {
    console.error('💥 Fatal error in StreetView API:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to fetch Street View image' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 