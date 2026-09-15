# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

**Note (7 septembre 2026)** : les 4 apps (racine `MLChopV1`, `app-client`, `app-direction`,
`app-cmdt`) sont remontées de **SDK 54 → SDK 57** (expo 57.0.20, react-native 0.86.3, react 19.2.3,
expo-status-bar ~57.0.1, expo-location ~57.0.16, @types/react ~19.2.4, typescript ~6.0.3). L'app
Expo Go du téléphone de test est en **57.0.9** et ne supporte QUE le SDK 57 ("Project is
incompatible with this version of Expo Go" sinon). Avant de changer le SDK un jour, vérifier
d'abord dans l'app Expo Go (onglet Profil) quelle version elle affiche, puis
`npx expo install expo@<version>` suivi de `npx expo install --fix` dans **chaque** dossier d'app
(chacun a son propre `node_modules`).
