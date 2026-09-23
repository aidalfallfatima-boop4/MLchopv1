# Politique de sécurité — ML CHOP

## Périmètre

Dans le périmètre :

- l'application web https://mlchop-31688.web.app ;
- les **Security Rules** Firestore / Storage (`firestore.rules`, `storage.rules`) et les données
  du projet Firebase `mlchop-31688` accessibles avec un compte testeur ;
- le code de ce dépôt (https://github.com/aidalfallfatima-boop4/MLchopv1).

Exemples de ce qui nous intéresse : lire ou modifier les données d'un autre utilisateur, s'attribuer
un rôle (admin, vendeur/livreur validé), modifier un prix, un total ou un statut de commande
sans y être autorisé, contourner la validation admin, XSS.

Hors périmètre : l'infrastructure Google/Firebase elle-même, l'ingénierie sociale, les attaques
par déni de service et tout test automatisé en masse (le quota du plan gratuit est partagé par tous
les testeurs).

## Signaler une faille (en privé)

- **GitHub, avis de sécurité privé** :
  https://github.com/aidalfallfatima-boop4/MLchopv1/security/advisories/new
- ou **dans l'app** : bouton 🐞 → type **« Faille de sécurité »** (visible uniquement par l'admin).

Merci de **ne pas** ouvrir d'issue publique ni de divulguer la faille avant sa correction.
Indiquez : étapes de reproduction, rôle/compte utilisé, impact constaté. Testez uniquement avec
vos propres comptes et n'accédez pas plus que nécessaire aux données d'autrui pour démontrer le
problème.

## Limites connues et acceptées

Ces points sont assumés pour la phase de test et ne sont pas des failles en soi :

- **Plan Firebase gratuit (Spark) : pas de Cloud Functions.** Toute la validation serveur passe par
  les Security Rules ; il n'y a pas de logique métier côté serveur.
- **OTP fixe (`1234`)** : aucun SMS n'est envoyé, la vérification du numéro de téléphone est
  simulée.
- **Paiements simulés** : aucune transaction réelle.
- **La configuration web Firebase (clé API, projectId…) est publique par conception** : elle est
  embarquée dans tout client web Firebase. La protection des données repose sur les Security Rules,
  pas sur le secret de cette configuration.
