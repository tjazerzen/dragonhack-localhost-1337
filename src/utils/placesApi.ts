export async function getNearestPhotoUrl(
  latitude: number,
  longitude: number
): Promise<string | null> {
  console.log('🚀 Starting photo fetch for coordinates:', { latitude, longitude });

  try {
    // Call our server-side API route
    const url = `/api/places?lat=${latitude}&lng=${longitude}`;
    console.log('📡 Fetching from:', url);

    const response = await fetch(url);
    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData
      });
      return null;
    }

    const data = await response.json();
    console.log('✅ Successful response:', {
      hasPhotoUrl: !!data.photoUrl,
      photoUrlStart: data.photoUrl?.substring(0, 50) + '...'
    });

    return data.photoUrl;
  } catch (error) {
    console.error('💥 Fatal error in getNearestPhotoUrl:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

// New function to fetch Street View image URL
export async function getStreetViewUrl(
  latitude: number,
  longitude: number
): Promise<string | null> {
  console.log('🚀 Starting Street View fetch for coordinates:', { latitude, longitude });

  try {
    // Call our server-side API route
    const url = `/api/places-streetview?lat=${latitude}&lng=${longitude}`;
    console.log('📡 Fetching Street View from:', url);

    const response = await fetch(url);
    console.log('📥 Street View response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Street View error response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData
      });
      return null;
    }

    const data = await response.json();
    console.log('✅ Successful Street View response:', {
      hasPhotoUrl: !!data.photoUrl,
      photoUrlStart: data.photoUrl?.substring(0, 50) + '...'
    });

    return data.photoUrl;
  } catch (error) {
    console.error('💥 Fatal error in getStreetViewUrl:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

// Polyline decoding function (standard implementation)
function decodePolyline(encoded: string): Array<[number, number]> {
  let points: Array<[number, number]> = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Function to fetch route from Google Directions API
export async function getRouteFromGoogle(
  origin: [number, number],
  destination: [number, number]
): Promise<Array<[number, number]> | null> {
  console.log(`🗺️ Fetching Google route from ${origin} to ${destination}`);

  // Use the backend proxy
  const url = `/api/directions?origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}`;

  try {
    const response = await fetch(url);
    console.log(`📥 Directions response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Directions API error: ${response.status} - ${errorText}`);
      // Return null or an empty array to indicate failure but allow fallback
      return null;
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0 && data.routes[0].overview_polyline) {
      const encodedPolyline = data.routes[0].overview_polyline.points;
      const decodedPath = decodePolyline(encodedPolyline);
      console.log(`✅ Route successfully decoded. Points: ${decodedPath.length}`);
      return decodedPath;
    } else {
      console.warn('No route found in Google Directions response', data);
      return null; // Or return an empty array
    }

  } catch (error) {
    console.error('💥 Fatal error fetching or decoding Google Directions:', error);
    return null; // Indicate failure
  }
}
