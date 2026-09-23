import { getApps, initializeApp } from "firebase/app";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Auth, getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { firebaseConfig } from "./config";

export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

/**
 * Sur web, le SDK Firebase gère seul la persistance (localStorage/IndexedDB).
 * Sur iOS/Android/Expo Go, il faut lui fournir explicitement AsyncStorage,
 * sinon la session ne survit pas au redémarrage (voir expo.fyi/firebase-js-auth-setup).
 */
export const auth: Auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

/**
 * ignoreUndefinedProperties : les types ML CHOP ont beaucoup de champs optionnels
 * (shopName, vehicle, customerId...). Sans cette option, Firestore rejette tout
 * setDoc/updateDoc contenant un `undefined` ("Unsupported field value: undefined").
 */
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const storage = getStorage(app);
