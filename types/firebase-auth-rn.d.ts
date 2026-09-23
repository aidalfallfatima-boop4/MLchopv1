/**
 * `getReactNativePersistence` existe bien au runtime (Metro résout le build
 * React Native du SDK Firebase, qui l'exporte — voir
 * node_modules/@firebase/auth/dist/rn/index.rn.d.ts), mais `tsc`/l'éditeur
 * résolvent "firebase/auth" vers le build navigateur, qui ne le déclare pas.
 * Bug connu du SDK (voir firebase/firebase-js-sdk#9316) : on complète juste
 * les types ici plutôt que de désactiver le typage sur tout le fichier.
 */
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
