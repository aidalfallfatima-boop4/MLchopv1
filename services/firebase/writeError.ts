import { pushLocalNotification } from "../../store/notificationStore";
import { auth } from "./app";

/** Délai minimal entre deux toasts "connexion perdue" (évite la rafale quand
 * plusieurs listeners tombent en même temps). */
const SUBSCRIPTION_TOAST_COOLDOWN_MS = 60_000;

let lastSubscriptionToastAt = 0;

function errorCode(error: unknown): string {
  return (error as { code?: string } | null)?.code ?? "";
}

/** Traduit les codes Firebase/Firestore courants en message lisible (FR). */
export function writeErrorMessage(error: unknown): string {
  switch (errorCode(error)) {
    case "permission-denied":
    case "unauthenticated":
      return "Action refusée (droits insuffisants).";
    case "unavailable":
    case "deadline-exceeded":
    case "auth/network-request-failed":
      return "Pas de connexion — réessayez.";
    default:
      return "L'enregistrement a échoué. Réessayez dans un instant.";
  }
}

/**
 * Échec d'une écriture Firestore : log TOUJOURS (aussi en prod, `__DEV__`
 * étant faux sur le build web) + toast local. Le toast ne passe JAMAIS par
 * Firestore (sinon un refus de rules produirait une boucle d'échecs).
 */
export function reportWriteError(context: string, error: unknown): void {
  console.error(`[${context}] écriture refusée :`, error);
  pushLocalNotification({
    title: "Échec de l'enregistrement",
    message: writeErrorMessage(error),
    type: "error",
  });
}

/**
 * Échec d'un listener temps réel : on garde les dernières données connues
 * (jamais de store vidé) et on prévient une seule fois par minute.
 */
export function reportSubscriptionError(context: string, error: unknown): void {
  // Sans session (écran d'accueil, juste après une déconnexion), les rules
  // refusent normalement la lecture : ce n'est pas une panne, pas de toast.
  if (!auth.currentUser && errorCode(error) === "permission-denied") {
    console.warn(`[${context}] lecture refusée hors session (attendu).`);
    return;
  }
  console.error(`[${context}] écoute temps réel interrompue :`, error);
  const now = Date.now();
  if (now - lastSubscriptionToastAt < SUBSCRIPTION_TOAST_COOLDOWN_MS) return;
  lastSubscriptionToastAt = now;
  pushLocalNotification({
    title: "Connexion perdue",
    message: "Connexion perdue — données peut-être pas à jour.",
    type: "warning",
  });
}
