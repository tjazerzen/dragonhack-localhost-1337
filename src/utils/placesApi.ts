export async function getNearestPhotoUrl(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    // Call our server-side API route
    const response = await fetch(`/api/places?lat=${latitude}&lng=${longitude}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching photo:', errorData.error);
      return null;
    }
    
    const data = await response.json();
    return data.photoUrl;
  } catch (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
}
