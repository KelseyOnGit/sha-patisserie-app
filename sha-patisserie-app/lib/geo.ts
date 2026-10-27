type VenueName = 'Sha' | 'ZB';

type Site = { lat: number; lng: number; radiusMeters: number };

// Each venue can have more than one accepted site.
export const VENUE_SITES: Record<VenueName, Site[]> = {
  Sha: [
    { lat: -31.954819, lng: 115.854858, radiusMeters: 200 }, // Sha shop
    { lat: -31.9056, lng: 115.9392, radiusMeters: 200 },     
  ],
  ZB: [
    { lat: -31.9520, lng: 115.8580, radiusMeters: 200 },
  ],
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
  location: VenueName = 'Sha'
) {
  const sites = VENUE_SITES[location] ?? VENUE_SITES.Sha;

  // Check every site for this venue and keep the closest one
  let closest = {
    distanceMeters: Infinity,
    radiusMeters: sites[0].radiusMeters,
  };

  for (const site of sites) {
    const distance = getDistanceInMeters(userLat, userLng, site.lat, site.lng);

    if (distance <= site.radiusMeters) {
      return { allowed: true, distanceMeters: distance, radiusMeters: site.radiusMeters };
    }

    if (distance < closest.distanceMeters) {
      closest = { distanceMeters: distance, radiusMeters: site.radiusMeters };
    }
  }

  return {
    allowed: false,
    distanceMeters: closest.distanceMeters,
    radiusMeters: closest.radiusMeters,
  };
}