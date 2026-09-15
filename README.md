# ML CHOP — README (26 août 2026)

Marketplace + livraison à Bamako. MVP React Native / Expo, 4 rôles : **Client · Vendeur · Livreur · Admin**.

Statut : **✅ OK** — `npx tsc --noEmit` propre, bundle web compile sans erreur (dernière vérif : 395 modules, aucune erreur).

✅ **Projet sur Expo SDK 54** (redescendu depuis 57 le 26/08, en 2 temps : 57→56→54, pour matcher l'Expo Go réellement installé sur l'iPhone de test, version 54.0.2). **Confirmé fonctionnel via QR code Expo Go sur iPhone 16 Pro le 26/08.** Voir `AGENTS.md`.

---

## 🚀 Tester rapidement (5 min)

```bash
cd C:\Users\PC\Documents\MLChopV1
npx expo start --web
```

Ouvrir **http://localhost:8081**.

### Comptes de démonstration (connexion immédiate, sans OTP)

Sur l'écran de connexion, bouton **"Connexion rapide (démo)"** après avoir choisi un rôle — ou saisir un de ces numéros (mot de passe ignoré) :

| Rôle | Téléphone |
|---|---|
| Client | `+223 70 12 34 56` |
| Vendeur | `+223 65 11 22 33` |
| Livreur | `+223 77 00 11 22` |
| Admin | `+223 90 00 00 00` |

### Parcours à essayer

1. **Client** : Accueil → ouvrir un produit → laisser un avis / ajouter aux favoris → Panier → Caisse → confirmer (paiement simulé) → onglet Commandes → "🗺️ Suivre ma commande" (timeline + carte + notifications).
2. **Inscription réelle** : Rôle Select → "Créer un compte" → Vendeur, nom "Test Vendeur", boutique "Ma Boutique Test" → OTP **`1234`** → dashboard vendeur avec bandeau "en attente d'approbation".
3. **Admin** : connexion démo → onglet Approbations → valider le compte "Test Vendeur" créé à l'étape 2.
4. **Livreur** : connexion démo → onglet Disponibles → Accepter une commande → onglet En cours → suit tout le parcours (récupération → route → "Je suis arrivé" → code **`1234`** → succès). Autorisez la géolocalisation quand le navigateur le demande (GPS réel utilisé pour le suivi côté client).
5. Repasser en **Client** (même session, sans recharger la page) → bannière "Commande en cours" sur l'Accueil → voir la position du livreur en direct sur la carte de suivi.

⚠️ Rester dans le **même onglet navigateur sans recharger** entre les étapes 4 et 5 : les données vivent en mémoire + AsyncStorage, mais le rôle change par déconnexion (Profil → Se déconnecter), pas par un vrai compte multi-appareil.

---

## 📋 Rapport de la session du 26 août

### Fichiers modifiés / créés (par zone)
- **Types & thèmes** : `types/index.ts`, `constants/{config,theme,roleTheme,landmarks}.ts`
- **Persistance** : `services/persistence.ts`, `hydrate*Store()` dans tous les stores
- **Auth** : `store/authStore.ts`, `screens/auth/*` (Login/Register/Otp/AuthNavigator), `screens/RoleSelectScreen.tsx`
- **Paiement/commande** : `services/payments.ts`, `store/orderStore.ts`, `screens/client/CheckoutScreen.tsx`
- **Client** : Home, Profile (réécrits), Categories, Favorites, ProductDetail (nouveaux), ProductCard, BottomNavigation, Header
- **Vendeur** : SellerProducts, SellerOrders (réécrits), SellerRevenue, SellerProfile (nouveaux), SellerDashboard
- **Livreur** : DeliveryDashboard, DeliveryAvailable, DeliveryActive (nouveaux), DeliveryPickup/Arrived + 3 cards (implémentés, étaient vides), DeliveryHistory/Earnings/Profile (données réelles), `services/location.ts` (GPS)
- **Admin** : `screens/admin/*` (5 écrans, nouveaux)
- **App.tsx** : réécrit (hydratation au démarrage, 4 rôles, onglets bas par rôle)
- **package.json** : + `expo-location`, `@react-native-async-storage/async-storage`

### Fonctionnalités ajoutées
Auth complète (inscription/OTP/connexion/comptes démo), rôle Admin, favoris, fiche produit + avis, catégories dédiées, navigation par onglets par rôle, GPS réel du livreur, parcours livraison complet, approbation vendeur/livreur, revenus/historique sur données réelles, persistance locale générale (AsyncStorage).

### Bugs corrigés
- Paiement rattaché à un id de commande fictif → commande créée **avant** le paiement, paiement toujours associé au vrai id.
- Écrans livreur (Map/InProgress/Confirmation/Success) construits mais jamais atteignables → branchés dans un vrai parcours.
- 5 fichiers vides (`DeliveryPickup`, `DeliveryArrived`, 3 composants `delivery/*Card`) → implémentés.
- Risque de perte du rôle entre inscription et OTP → corrigé par un brouillon d'inscription unique (`RegistrationDraft`).

### Réellement fonctionnel
Auth/OTP/approbation, panier→commande→paiement→suivi, produits (ajout/édition/suppression/masquage) persistés, statuts de commande synchronisés client/vendeur/livreur avec notifications, GPS réel partagé en session, avis et favoris persistés.

### Encore simulé (assumé, pas de backend/API externe)
- OTP : code fixe `1234`, pas de vrai SMS.
- Paiement : simulation locale explicite (`simulated: true`), aucune vraie transaction Orange/Moov/Wave/carte.
- GPS : position réelle de l'appareil, mais partagée seulement **dans la même session locale** (pas de sync multi-appareils sans backend).
- Chatbot : moteur de règles local, pas de vraie API IA.
- Revenus livreur : totaux calculés sur les vraies commandes livrées ; "bonus"/"versements" détaillés retirés (c'étaient des chiffres inventés).

### Tests effectués
```bash
npx expo install expo-location
npx expo install @react-native-async-storage/async-storage
npx tsc --noEmit                                     # 0 erreur, revérifié plusieurs fois
npx expo start --web  (+ requête /index.bundle)      # "Web Bundled ... 394 modules", 0 erreur
```
**Limite honnête** : pas de clic réel dans un navigateur automatisé — vérification par type-checking strict + compilation du bundle + relecture attentive du câblage. Les parcours ci-dessus ("Tester rapidement") sont à confirmer visuellement.

### Étapes restantes
- Vraie carte (Google/Apple Maps) à la place de la carte stylisée maison.
- Backend réel : API auth, paiement, notifications push (Expo Notifications), synchro GPS multi-appareils.
- Tests automatisés (aujourd'hui : type-checking + build uniquement).
- `screens/delivery/DeliveryNewOrder.tsx` : ancien écran remplacé par `DeliveryAvailable` + `DeliveryOrderCard`, gardé mais plus branché — à supprimer si inutile.

---

## 🗂️ Pour continuer demain

Voir aussi `CONTINUER.md` (détails techniques : architecture des stores, fichiers clés à ne pas casser). Ce README est le point d'entrée rapide ; `CONTINUER.md` est la référence technique approfondie.
