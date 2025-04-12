import { NextResponse } from 'next/server';

// Cache successful responses for 1 hour
const CACHE_MAX_AGE = 60 * 60;

// Configuration
const DEFAULT_ZOOM = 18;
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const DEFAULT_STYLE = 'streets-v12'; // Mapbox style

export async function GET(request: Request) {
  console.log('📥 Received Places API request');

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const zoom = searchParams.get('zoom') || DEFAULT_ZOOM;
  const width = searchParams.get('width') || DEFAULT_WIDTH;
  const height = searchParams.get('height') || DEFAULT_HEIGHT;
  const style = searchParams.get('style') || DEFAULT_STYLE;
  
  console.log('📍 Coordinates:', { lat, lng, zoom, width, height });
  
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
  const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

  // Check if the API key is set
  if (!MAPBOX_ACCESS_TOKEN) {
    console.error('MAPBOX_ACCESS_TOKEN environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error: Missing API key.' }, { status: 500 });
  }

  try {
    // Construct the Mapbox Static Images API URL
    // Format: https://api.mapbox.com/styles/v1/{username}/{style_id}/static/{longitude},{latitude},{zoom}/{width}x{height}
    const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
    
    console.log('🖼️ Generated Mapbox static image URL (token redacted):', 
      mapboxUrl.replace(MAPBOX_ACCESS_TOKEN, 'REDACTED'));
    
    // Return the image URL directly
    return NextResponse.json({ photoUrl: mapboxUrl }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
      }
    });
  } catch (error) {
    console.error('💥 Fatal error in Places API:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Failed to fetch map image' }, {
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