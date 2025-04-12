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
