# ML CHOP — reprise (26 août 2026, session 2)

Marketplace + livraison Bamako. **4 rôles** (Client / Vendeur / Livreur / Admin), état partagé en mémoire + persisté localement (AsyncStorage).

## Lancer

```bash
npx expo start --web
```

Ouvrir **http://localhost:8081**. Fonctionne aussi sur téléphone via l'app Expo Go (`npx expo start`).

## Comptes de démonstration (connexion rapide, sans OTP)

| Rôle | Téléphone |
|---|---|
| Client | +223 70 12 34 56 |
| Vendeur | +223 65 11 22 33 |
| Livreur | +223 77 00 11 22 |
| Admin | +223 90 00 00 00 |

Depuis l'écran de connexion : bouton "Connexion rapide (démo)" ou saisir le numéro (mot de passe ignoré pour ces 4 comptes).

## Inscription / OTP

Choix du rôle → Créer un compte → formulaire (nom, téléphone, mot de passe, boutique si Vendeur, véhicule si Livreur) → code OTP **1234** → compte créé et connecté automatiquement. Client = actif immédiatement ; Vendeur/Livreur = statut **"En attente d'approbation"** tant que l'Admin ne les valide pas (onglet Approbations).

Le brouillon d'inscription (`RegistrationDraft` dans `store/authStore.ts`) porte rôle + toutes les infos d'un seul bloc jusqu'à l'OTP — plus de risque de perdre le rôle en route.

## Ce qui marche réellement (pas juste visuel)

- **Auth** : inscription/OTP/connexion, approbation vendeur/livreur par l'Admin, session persistée (AsyncStorage).
- **Client** : catalogue (populaires/tendances/catégories), recherche, fiche produit détaillée (stock, note, avis), favoris, panier, caisse, **commande créée avant le paiement puis paiement rattaché à son vrai id** (plus de "pending-order"), suivi de commande avec timeline + carte stylisée + GPS réel du livreur, centre de notifications + bannière auto, chatbot contextuel (panier/commande/catalogue).
- **Vendeur** : dashboard réel, ajout/édition/suppression/masquage de produit (persistés), commandes (confirmer/préparer/transmettre/refuser), revenus calculés sur les vraies commandes, profil avec statut d'approbation.
- **Livreur** : missions disponibles (liste réelle), acceptation, parcours complet **récupération → route → arrivée → confirmation code → succès** (tous les écrans de `screens/delivery/*` sont maintenant branchés), position GPS réelle (expo-location) partagée au client pendant "En route", historique et revenus calculés sur les vraies livraisons.
- **Admin** : vue d'ensemble, approbation/refus des comptes vendeur/livreur, liste utilisateurs, produits (activer/masquer), commandes.
- **Persistance** : session, panier, commandes, produits, notifications, avis, favoris survivent au rechargement (AsyncStorage — voir `services/persistence.ts` et les `hydrate*Store()` appelés dans `App.tsx`).

## Ce qui reste simulé (assumé, pas de backend/API externe)

- **Paiement** (`services/payments.ts`) : simulation locale claire (`simulated: true`), aucune vraie transaction Orange/Moov/Wave/carte.
- **OTP** (inscription + code de livraison) : code fixe `1234`, aucun vrai SMS.
- **GPS** : position réelle de l'appareil (expo-location) mais seulement partagée entre rôles dans la **même session locale** — pas de synchronisation multi-appareils sans backend.
- **Revenus/versements livreur** : "Bonus" et "Historique des paiements" détaillés retirés (étaient inventés) ; les totaux affichés sont calculés sur les vraies commandes livrées.
- **Chatbot** : moteur de règles local, pas de vraie API IA.

## Architecture à ne pas casser

- `App.tsx` : navigation par rôle (pas Expo Router), + onglets bas (`components/BottomNavigation.tsx`) par rôle.
- `store/authStore.ts` : comptes, session, inscription/OTP — appelle `userStore.setRole/updateUserProfile/logout` en interne (ne pas dupliquer la logique de rôle ailleurs).
- `store/` : un store par domaine, chacun avec `hydrate*Store()` à appeler une fois (déjà fait dans `App.tsx`).
- `constants/theme.ts` (statuts/catégories) + `constants/roleTheme.ts` (identité visuelle par rôle) + `constants/landmarks.ts` (carte stylisée Bamako).
- Expo SDK **57** — docs : https://docs.expo.dev/versions/v57.0.0/

## Fichiers legacy

- `screens/delivery/DeliveryNewOrder.tsx` : ancien écran d'acceptation de mission, remplacé par `DeliveryAvailable.tsx` + `components/delivery/DeliveryOrderCard.tsx`. Toujours fonctionnel mais plus branché dans `App.tsx` — gardé au cas où.

## Prochaines étapes possibles

- Écran `ProductDetail` ✅ fait / `AdminDashboard` ✅ fait (voir ci-dessus) — restait dans le canvas de design d'origine.
- Vraie carte (Google/Apple Maps) à la place de la carte stylisée maison.
- Backend réel : API auth, paiement, notifications push (Expo Notifications), synchronisation GPS multi-appareils.
- Tests automatisés (actuellement vérifié via `tsc --noEmit` + build du bundle web).
