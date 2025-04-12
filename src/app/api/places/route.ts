import { NextResponse } from 'next/server';

interface PlaceResult {
  photos?: Array<{ photo_reference: string }>;
  rating?: number;
  user_ratings_total?: number;
  types?: Array<string>;
}

// Cache successful responses for 1 hour
const CACHE_MAX_AGE = 60 * 60;

// Configuration
const DEFAULT_RADIUS = 500; // meters
const DEFAULT_PHOTO_WIDTH = 800;

// Place types we're interested in - focusing specifically on buildings and structures
// https://developers.google.com/maps/documentation/places/web-service/supported_types
const PLACE_TYPES = [
  // Educational institutions
  'university',
  'school',
  'secondary_school',
  'primary_school',
  'library',
  
  // Cultural and historical buildings
  'museum',
  'art_gallery',
  'tourist_attraction',
  
  // Government and public buildings
  'city_hall',
  'courthouse',
  'embassy',
  'local_government_office',
  
  // Religious buildings
  'church',
  'mosque',
  'synagogue',
  'hindu_temple',
  
  // Large structures
  'stadium',
  'shopping_mall',
  
  // Generic building categories
  'point_of_interest',
  'establishment',
  'landmark'
].join('|');

export async function GET(request: Request) {
  console.log('📥 Received Places API request');

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || DEFAULT_RADIUS;
  const photoWidth = searchParams.get('width') || DEFAULT_PHOTO_WIDTH;
  
  console.log('📍 Coordinates:', { lat, lng, radius, photoWidth });
  
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
    // 1. First, search for places near the coordinates with enhanced parameters
    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=${PLACE_TYPES}&key=${GOOGLE_MAPS_API_KEY}`;
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
    
    // Get the best rated place that has photos
    const place = searchData.results
      .filter((place: PlaceResult) => place.photos && place.photos.length > 0)
      .sort((a: PlaceResult, b: PlaceResult) => {
        // Prioritize places with higher ratings and more reviews
        // We're giving slightly more weight to places with photos since they're likely more notable
        const photoWeight = (p: PlaceResult) => Math.min(p.photos?.length || 0, 5) * 0.1;
        const scoreA = (a.rating || 0) * Math.log(a.user_ratings_total || 1) + photoWeight(a);
        const scoreB = (b.rating || 0) * Math.log(b.user_ratings_total || 1) + photoWeight(b);
        return scoreB - scoreA;
      })[0];

    console.log('📸 Found best rated place with photos:', {
      hasPlace: !!place,
      rating: place?.rating,
      totalRatings: place?.user_ratings_total,
      photoCount: place?.photos?.length,
      types: place?.types
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
    
    // 2. Construct the URL for the actual photo with configurable width
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${photoWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
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