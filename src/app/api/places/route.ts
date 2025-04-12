import { NextResponse } from 'next/server';

interface PlaceResult {
  photos?: Array<{ photo_reference: string }>;
}

// Cache successful responses for 1 hour
const CACHE_MAX_AGE = 60 * 60;

export async function GET(request: Request) {
  console.log('📥 Received Places API request');

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  console.log('📍 Coordinates:', { lat, lng });

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
    // 1. First, search for places near the coordinates
    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&key=${GOOGLE_MAPS_API_KEY}`;
    console.log('🔍 Searching nearby places:', nearbySearchUrl.replace(GOOGLE_MAPS_API_KEY, 'REDACTED'));

    const searchResponse = await fetch(nearbySearchUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: CACHE_MAX_AGE }
    });

    console.log('📥 Places API response status:', searchResponse.status);
    console.log('📥 Places API response headers:', Object.fromEntries(searchResponse.headers.entries()));

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('❌ Google Places API error:', {
        status: searchResponse.status,
        error,
        headers: Object.fromEntries(searchResponse.headers.entries())
      });
      return NextResponse.json({ error: 'Failed to fetch places data', details: error }, {
        status: searchResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      });
    }

    const searchData = await searchResponse.json();
    console.log('📦 Places API response data:', {
      resultsCount: searchData.results?.length || 0,
      status: searchData.status,
      errorMessage: searchData.error_message,
    });

    // Check if we got any results
    if (!searchData.results || searchData.results.length === 0) {
      console.warn('⚠️ No places found');
      return NextResponse.json({ error: 'No places found near these coordinates' }, {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      });
    }

    // Get the first place that has photos
    const place = searchData.results.find((place: PlaceResult) => place.photos && place.photos.length > 0);
    console.log('📸 Found place with photos:', {
      hasPlace: !!place,
      hasPhotos: place?.photos?.length > 0,
      photoCount: place?.photos?.length
    });

    if (!place || !place.photos) {
      console.warn('⚠️ No photos found');
      return NextResponse.json({ error: 'No photos found for nearby places' }, {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      });
    }

    // Get the photo reference from the first photo
    const photoReference = place.photos[0].photo_reference;

    // 2. Construct the URL for the actual photo
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
    console.log('🖼️ Generated photo URL:', photoUrl.replace(GOOGLE_MAPS_API_KEY, 'REDACTED'));

    return NextResponse.json({ photoUrl }, {
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
    return NextResponse.json({ error: 'Failed to fetch photo' }, {
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