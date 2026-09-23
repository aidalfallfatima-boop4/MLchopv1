/**
 * Lit la config Firebase depuis les variables d'environnement EXPO_PUBLIC_*
 * (voir .env.example). Expo/Metro les inline au build, y compris dans Expo Go.
 */
export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

/**
 * Accès STATIQUE obligatoire : Expo ne remplace au build que les lectures écrites
 * en toutes lettres (`process.env.EXPO_PUBLIC_X`). Un accès dynamique
 * (`process.env[key]`) reste vide sur le web → page blanche au démarrage.
 */
const ENV_VALUES = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const REQUIRED_KEYS = [
  ["EXPO_PUBLIC_FIREBASE_API_KEY", "apiKey"],
  ["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", "authDomain"],
  ["EXPO_PUBLIC_FIREBASE_PROJECT_ID", "projectId"],
  ["EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", "storageBucket"],
  ["EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "messagingSenderId"],
  ["EXPO_PUBLIC_FIREBASE_APP_ID", "appId"],
] as const;

function readConfig(): FirebaseConfig {
  const values: Partial<FirebaseConfig> = {};
  const missing: string[] = [];

  for (const [envKey, configKey] of REQUIRED_KEYS) {
    const value = ENV_VALUES[envKey];
    if (!value) {
      missing.push(envKey);
    } else {
      values[configKey] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Configuration Firebase manquante : ${missing.join(", ")}. ` +
        "Copie .env.example vers .env et renseigne les valeurs depuis Firebase Console " +
        "(Paramètres du projet > Tes applications > App web)."
    );
  }

  values.measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined;

  return values as FirebaseConfig;
}

export const firebaseConfig = readConfig();
