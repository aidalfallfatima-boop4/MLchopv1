import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Persistance locale (AsyncStorage, fonctionne aussi sur web via son shim
 * localStorage). MVP volontairement simple : lecture/écriture JSON par clé,
 * pensée pour être remplacée par de vrais appels API plus tard sans changer
 * les stores qui l'utilisent (voir hydrate*Store dans chaque store/*.ts).
 */
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}
