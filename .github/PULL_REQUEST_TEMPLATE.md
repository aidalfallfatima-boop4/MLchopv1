## Quoi / pourquoi

## Vérifications
- [ ] `npm run typecheck` passe
- [ ] `npx expo export --platform web` compile
- [ ] Si `firestore.rules` a changé : `node scripts/test-firestore-rules.cjs` passe (voir TESTS.md)
- [ ] Testé dans le navigateur (au moins le parcours touché)
- [ ] Aucun secret ajouté (`.env` reste hors Git)
