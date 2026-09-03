// Store GPS coordinates
export const STORE_LOCATIONS = {
  Sha: { lat: -31.9505, lng: 115.8605, radiusMeters: 200 }, // Replace with exact venue coordinates
  ZB: { lat: -31.9520, lng: 115.8580, radiusMeters: 200 },
};

// Haversine formula to calculate distance in meters
export function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function isWithinOnsiteRange(
  userLat: number,
  userLng: number,
  location: 'Sha' | 'ZB' = 'Sha'
) {
  const store = STORE_LOCATIONS[location] || STORE_LOCATIONS.Sha;
  const distance = getDistanceInMeters(userLat, userLng, store.lat, store.lng);

  return {
    allowed: distance <= store.radiusMeters,
    distanceMeters: distance,
    radiusMeters: store.radiusMeters,
  };
}