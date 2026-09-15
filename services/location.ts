import * as Location from "expo-location";

export type LocationSubscription = { remove: () => void };

export type PositionUpdate = {
  lat: number;
  lng: number;
  heading: number | null;
};

/** Demande la permission de géolocalisation au premier plan (mobile + web). */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

/** Position ponctuelle — utile pour un premier point avant que le flux continu démarre. */
export async function getCurrentPosition(): Promise<PositionUpdate | null> {
  try {
    const granted = await requestLocationPermission();
    if (!granted) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      heading: location.coords.heading ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Suit la position réelle de l'appareil (GPS) en continu.
 * Retourne null si la permission est refusée ou si la géolocalisation
 * n'est pas disponible (ex. navigateur sans support, HTTP non sécurisé).
 */
export async function watchPosition(
  onUpdate: (position: PositionUpdate) => void
): Promise<LocationSubscription | null> {
  const granted = await requestLocationPermission();
  if (!granted) {
    return null;
  }

  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 5,
      },
      (location) => {
        onUpdate({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          heading: location.coords.heading ?? null,
        });
      }
    );

    return subscription;
  } catch {
    return null;
  }
}
