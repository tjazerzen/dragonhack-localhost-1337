import { NextResponse } from 'next/server';

interface PlaceResult {
  photos?: Array<{ photo_reference: string }>;
}

// Cache successful responses for 1 hour
const CACHE_MAX_AGE = 60 * 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing latitude or longitude' }, { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  }
  
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAS_JvksyL6G4NnZPqQ93pExHzj6qywBl0';
  
  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      }
    });
  }
  
  try {
    // 1. First, search for places near the coordinates
    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=100&key=${GOOGLE_MAPS_API_KEY}`;
    
    const searchResponse = await fetch(nearbySearchUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: CACHE_MAX_AGE }
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('Google Places API error:', error);
      return NextResponse.json({ error: 'Failed to fetch places data' }, { 
        status: searchResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        }
      });
    }
    
    const searchData = await searchResponse.json();
    
    // Check if we got any results
    if (!searchData.results || searchData.results.length === 0) {
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
    
    if (!place || !place.photos) {
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
    
    return NextResponse.json({ photoUrl }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
      }
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
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