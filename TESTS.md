# Tests — ML CHOP

## 1. Vérification des types

```bash
npm run typecheck        # = tsc --noEmit
```

Doit sortir sans erreur avant toute PR.

## 2. Test live des Security Rules Firestore

`scripts/test-firestore-rules.cjs` joue un parcours client → vendeur → livreur contre le **vrai
projet** (`mlchop-31688`) et vérifie que les tentatives de fraude sont bien refusées
(`permission-denied`). Il crée un client jetable puis nettoie ce qu'il a créé.

```bash
MLCHOP_ADMIN_PASSWORD=... node scripts/test-firestore-rules.cjs
```

- Lit la config Firebase dans `.env` (voir `.env.example`).
- Nécessite le mot de passe du compte admin : **à lancer en local uniquement**, jamais en CI
  publique.
- À relancer après chaque déploiement des règles
  (`npx firebase-tools deploy --only firestore`).
- Résultat : une ligne `OK` / `FAIL` par vérification ; tout `FAIL` bloque le déploiement.

Sous PowerShell : `$env:MLCHOP_ADMIN_PASSWORD="..."; node scripts/test-firestore-rules.cjs`.

## 3. Sauvegarde Firestore

```bash
node scripts/backup-firestore.cjs
```

Exporte les collections du projet dans un fichier local (voir l'en-tête du script pour
l'emplacement et les variables requises). À lancer avant tout changement de règles ou de schéma.
Les sauvegardes contiennent des données de testeurs : ne jamais les commiter.

## 4. Intégration continue

`.github/workflows/ci.yml` s'exécute sur chaque push vers `main` et chaque pull request :

1. `npm ci`
2. `npm run typecheck`
3. `npx expo export --platform web` (le build web doit compiler, avec une config Firebase factice)

Le test des règles (§2) n'est pas dans la CI car il exige le mot de passe admin.
Dependabot (`.github/dependabot.yml`) propose les mises à jour de dépendances.

## 5. Tests manuels

La checklist par rôle utilisée par les testeurs est dans [GUIDE-TESTEURS.md](GUIDE-TESTEURS.md).
