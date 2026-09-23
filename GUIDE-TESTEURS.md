# Guide testeurs — ML CHOP

Merci de participer à la phase de test ! Ce guide tient en 5 minutes de lecture.

**Lien de l'application** : https://mlchop-31688.web.app
(navigateur récent, ordinateur ou téléphone ; sur PC l'app s'affiche au format smartphone).

## 1. Créer un compte

1. Ouvrir le lien → choisir un rôle (Client, Vendeur ou Livreur).
2. « Créer un compte » → nom, téléphone, mot de passe (+ nom de boutique pour un vendeur,
   véhicule pour un livreur).
3. **Code OTP : `1234`**. Aucun SMS n'est envoyé, c'est un code de démonstration fixe.

| Rôle | Activation |
|---|---|
| Client | Actif immédiatement |
| Vendeur / Livreur | En attente de **validation par l'admin** (l'app l'indique) — patience, c'est fait à la main |

Le rôle Admin n'est pas ouvert à l'inscription.

## 2. Règles importantes

- **Paiements simulés** : aucun argent ne circule, aucun vrai numéro Orange Money / Wave / carte
  n'est demandé ni utile.
- **Maximum 5 produits différents par commande.**
- **Pas de vraies données personnelles** : utilisez un nom fictif et un numéro inventé.
- **Pas de DoS ni de scripts de masse** (création de comptes/commandes en boucle, flood) :
  l'app tourne sur un plan Firebase gratuit dont le quota est **partagé par les 50 testeurs**.
  Si le quota saute, tout le monde est bloqué.
- **Les tests de sécurité sont bienvenus**, mais une faille se signale **en privé**
  (voir §4), jamais en issue publique.

## 3. Quoi tester (checklist)

### Client
- [ ] Inscription + OTP `1234`, déconnexion, reconnexion
- [ ] Catalogue, catégories, recherche, fiche produit, avis, favoris
- [ ] Panier : ajout, quantités, retrait ; refus au-delà de 5 produits différents
- [ ] Commande + paiement simulé (chaque moyen de paiement)
- [ ] Suivi de commande : statuts, notifications, position du livreur, code de livraison

### Vendeur (après validation)
- [ ] Ajout / édition / masquage / suppression d'un produit
- [ ] Traitement des commandes : confirmer, préparer, transmettre, refuser
- [ ] Revenus cohérents avec les commandes livrées

### Livreur (après validation)
- [ ] Liste des missions disponibles, acceptation
- [ ] Parcours récupération → en route → arrivée → saisie du code donné par le client → succès
- [ ] Géolocalisation (autoriser le navigateur), historique et gains

### Tous rôles
- [ ] Affichage mobile et PC, rechargement de la page (la session doit rester ouverte)
- [ ] Messages d'erreur compréhensibles (mauvais mot de passe, réseau coupé…)
- [ ] Tentatives d'accès à des données qui ne sont pas les vôtres (doivent être refusées)

## 4. Signaler un problème

1. **Dans l'app : bouton 🐞** en bas à droite (visible une fois connecté) → choisir *Bug*,
   *Suggestion* ou *Faille de sécurité* → décrire → Envoyer. L'écran courant et votre navigateur
   sont joints automatiquement. Les retours « Faille de sécurité » ne sont lus que par l'admin.
2. **Sur GitHub** (si vous avez un compte) : https://github.com/ehekbealberto-prog/mlv1/issues/new/choose
   → modèle *Bug* ou *Suggestion*.
3. **Faille de sécurité** : uniquement en privé, via le bouton 🐞 (*Faille de sécurité*) ou
   https://github.com/ehekbealberto-prog/mlv1/security/advisories/new — voir [SECURITY.md](SECURITY.md).

Un bon signalement : ce que vous avez fait (étapes), ce que vous attendiez, ce qui s'est passé,
votre rôle, et si possible une capture d'écran (issue GitHub).
