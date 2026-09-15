export type GeoPoint = {
  lat: number;
  lng: number;
};

/** Zone approximative Hamdallaye ACI 2000 (Bamako) utilisée pour la maquette carte. */
export const BAMAKO_REGION = {
  minLat: 12.615,
  maxLat: 12.66,
  minLng: -8.035,
  maxLng: -7.965,
};

export const STORE_LOCATION: GeoPoint = { lat: 12.6465, lng: -8.0175 };
export const CLIENT_LOCATION: GeoPoint = { lat: 12.6285, lng: -7.9825 };

export type Landmark = {
  name: string;
  icon: string;
  point: GeoPoint;
};

export const ROUTE_LANDMARKS: Landmark[] = [
  { name: "Boutique ML CHOP", icon: "🏪", point: STORE_LOCATION },
  { name: "Station-service", icon: "⛽", point: { lat: 12.641, lng: -8.006 } },
  { name: "Rond-point de l'ACI", icon: "🔄", point: { lat: 12.6355, lng: -7.995 } },
  { name: "Pharmacie", icon: "🏥", point: { lat: 12.631, lng: -7.988 } },
];

/** Distance à vol d'oiseau (km) entre deux points GPS — formule de haversine. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Vitesse moyenne moto-livreur en ville (km/h), pour une estimation simple. */
const AVERAGE_SPEED_KMH = 22;

export function estimateEtaMinutes(distance: number): number {
  if (!Number.isFinite(distance) || distance <= 0) {
    return 0;
  }
  return Math.max(1, Math.round((distance / AVERAGE_SPEED_KMH) * 60));
}

/** Projette un point GPS dans un repère [0,1]x[0,1] pour l'affichage sur la carte stylisée. */
export function projectPoint(point: GeoPoint, region = BAMAKO_REGION) {
  const x = (point.lng - region.minLng) / (region.maxLng - region.minLng);
  const y = 1 - (point.lat - region.minLat) / (region.maxLat - region.minLat);

  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
  };
}
