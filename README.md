# ML CHOP

Marketplace + livraison à Bamako : des clients commandent auprès de vendeurs, des livreurs
acheminent les commandes, un administrateur supervise.

- **Application en ligne (phase de test)** : https://mlchop-31688.web.app
- **Dépôt** : https://github.com/aidalfallfatima-boop4/MLchopv1-

## Les 4 rôles

| Rôle | Ce qu'il fait |
|---|---|
| **Client** | Parcourt le catalogue, gère favoris et panier, commande (paiement simulé), suit la livraison en temps réel. Compte actif dès l'inscription. |
| **Vendeur** | Gère ses produits (ajout, édition, masquage), traite ses commandes, consulte ses revenus. Compte à valider par l'admin. |
| **Livreur** | Accepte une mission, suit le parcours récupération → route → arrivée → code de remise, partage sa position GPS. Compte à valider par l'admin. |
| **Admin** | Valide/refuse vendeurs et livreurs, supervise comptes, produits, commandes et retours testeurs. Pas d'inscription publique. |

## Stack

- Expo **SDK 57**, React Native **0.86**, React **19.2**, TypeScript **6**
- Build web via `react-native-web`, hébergé sur **Firebase Hosting**
- **Firebase Auth** (session) + **Cloud Firestore** (données temps réel), protégés par
  `firestore.rules` / `storage.rules`
- État applicatif : petits stores maison (`store/createStore.ts`, basé sur `useSyncExternalStore`)

## Lancer en local

Prérequis : Node.js 22 et npm.

```bash
npm install
cp .env.example .env        # puis remplir les valeurs EXPO_PUBLIC_FIREBASE_* (console Firebase)
npx expo start --web        # ouvre http://localhost:8081
```

Sur téléphone : `npx expo start` puis scanner le QR code avec **Expo Go en version SDK 57**
(voir `AGENTS.md`).

Vérification des types : `npm run typecheck`. Détails des tests : [TESTS.md](TESTS.md).

## Déployer (mainteneur uniquement)

```bash
npx expo export --platform web                              # génère dist/
npx firebase-tools deploy --only firestore,hosting          # règles + index + site
```

`firebase.json` sert `dist/` avec réécriture SPA vers `index.html`. Toujours relancer le test des
règles après un déploiement (voir [TESTS.md](TESTS.md)).

## Organisation du projet

```
App.tsx               Point d'entrée UI : hydratation des stores, navigation par rôle, onglets bas
index.ts              Enregistrement racine (ErrorBoundary + polyfill Alert web)
screens/
  auth/               Choix du rôle, connexion, inscription, OTP
  client/  seller/  delivery/  admin/   Écrans de chaque rôle
components/           Composants partagés (navigation, carte de suivi, bouton 🐞 FeedbackButton…)
store/                Stores par domaine (auth, panier, commandes, produits, avis, favoris, retours…)
services/firebase/    Initialisation Firebase, helpers Auth / Firestore / Storage
services/             Paiement simulé, géolocalisation, chatbot local…
constants/ utils/ types/ data/
firestore.rules       Security Rules (la vraie barrière d'accès aux données)
scripts/              Test live des règles, sauvegarde Firestore
.github/              CI, Dependabot, modèles d'issues et de PR
```

## Ce qui est simulé (volontairement)

- **OTP** : code fixe `1234`, aucun SMS envoyé.
- **Paiement** : Orange Money / Moov / Wave / carte sont simulés, aucune transaction réelle.
- **Chatbot** : moteur de règles local, pas d'IA externe.

## Documentation

- [GUIDE-TESTEURS.md](GUIDE-TESTEURS.md) : guide pour les testeurs (comptes, parcours, signalement)
- [SECURITY.md](SECURITY.md) : périmètre et signalement privé des failles
- [TESTS.md](TESTS.md) : typecheck, test des règles Firestore, sauvegarde, CI
- [CONTINUER.md](CONTINUER.md) : notes techniques historiques (antérieures à la migration Firebase,
  en partie obsolètes)
