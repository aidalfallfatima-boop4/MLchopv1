/**
 * Test de bout en bout des Security Rules Firestore contre le VRAI projet
 * (mlchop-31688) : parcours client → vendeur → livreur + tentatives de fraude
 * qui doivent être refusées. Crée un client jetable puis nettoie tout.
 *
 * Usage : MLCHOP_ADMIN_PASSWORD=... node scripts/test-firestore-rules.cjs
 * (à relancer après chaque "firebase deploy --only firestore:rules").
 */
const { createRequire } = require("module");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const req = createRequire(path.join(ROOT, "package.json"));
const fs = require("fs");
const env = Object.fromEntries(fs.readFileSync(path.join(ROOT, ".env"),"utf8").split(/\r?\n/).filter(l=>l.includes("=")).map(l=>[l.split("=")[0], l.slice(l.indexOf("=")+1)]));
const { initializeApp } = req("firebase/app");
const A = req("firebase/auth"), F = req("firebase/firestore");
const cfg = { apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY, authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, appId: env.EXPO_PUBLIC_FIREBASE_APP_ID };
const PROJECT = cfg.projectId;
function session(name) { const app = initializeApp(cfg, name); return { auth: A.getAuth(app), db: F.initializeFirestore(app, { ignoreUndefinedProperties: true }) }; }
const now = () => new Date().toISOString();
const DEMO_PW = "MLChopDemo2026!";
let pass = 0, fail = 0;
async function check(label, fn, expectDenied = false) {
  try { const r = await fn(); if (expectDenied) { fail++; console.log("FAIL (should be denied):", label); } else { pass++; console.log("OK:", label, r ?? ""); } }
  catch (e) { if (expectDenied && e.code === "permission-denied") { pass++; console.log("OK (denied as expected):", label); } else { fail++; console.log("FAIL:", label, e.code || "", e.message); } }
}
async function signInOrCreate(s, email, pw) {
  try { return (await A.signInWithEmailAndPassword(s.auth, email, pw)).user; }
  catch (e) { if (e.code !== "auth/invalid-credential" && e.code !== "auth/user-not-found") throw e; return (await A.createUserWithEmailAndPassword(s.auth, email, pw)).user; }
}
(async () => {
  // --- Admin : créé en client puis promu via REST avec le jeton du propriétaire du projet
  const adminS = session("admin"); const adminEmail = "22390000000@mlchop.app";
  const adminPw = process.env.MLCHOP_ADMIN_PASSWORD;
  if (!adminPw) { console.error("Définir MLCHOP_ADMIN_PASSWORD (mot de passe du compte admin +223 90 00 00 00)."); process.exit(2); }
  const adminUser = (await A.signInWithEmailAndPassword(adminS.auth, adminEmail, adminPw)).user;

  // --- Vendeur démo (existe déjà) / livreur démo (créé comme le ferait le bouton)
  const sellerS = session("seller"); const seller = await signInOrCreate(sellerS, "22365112233@mlchop.app", DEMO_PW);
  const delS = session("delivery"); const del = await signInOrCreate(delS, "22377001122@mlchop.app", DEMO_PW);
  const delDoc = await F.getDoc(F.doc(delS.db, "users", del.uid));
  if (!delDoc.exists()) await check("livreur démo: profil actif", () => F.setDoc(F.doc(delS.db, "users", del.uid), { role: "delivery", fullName: "Livreur Démo", phone: "+223 77 00 11 22", vehicle: "Moto", shopName: undefined, status: "active", createdAt: now(), updatedAt: now() }));

  // --- Client de test
  const cS = session("client"); const c = (await A.createUserWithEmailAndPassword(cS.auth, `2230000${Date.now() % 100000}@mlchop.app`, "test123456")).user;
  await check("sécurité: un inscrit ne peut pas se déclarer vendeur actif", () => F.setDoc(F.doc(cS.db, "users", c.uid), { role: "seller", fullName: "X", phone: "0", status: "active", createdAt: now(), updatedAt: now() }), true);
  await check("inscription client (champs undefined)", () => F.setDoc(F.doc(cS.db, "users", c.uid), { role: "client", fullName: "Test E2E", phone: "+223 00", shopName: undefined, vehicle: undefined, status: "active", createdAt: now(), updatedAt: now() }));
  await check("client: lit le catalogue", async () => (await F.getDocs(F.collection(cS.db, "products"))).size + " produits");
  const p = (await F.getDoc(F.doc(cS.db, "products", "1"))).data();
  const orderId = "MLE2E" + Date.now().toString().slice(-5);
  const order = { id: orderId, items: [{ ...p, quantity: 1 }], total: p.price + 1000, status: "pending", customerName: "Test E2E", customerPhone: "+223 00", deliveryAddress: "Bamako", paymentMethod: "cash", paymentStatus: "pending", createdAt: now(), deliveryCode: "1234", deliveryFee: 1000, customerId: c.uid, sellerIds: [p.sellerId], deliveryId: undefined, statusHistory: [{ status: "pending", at: now() }] };
  await check("client: passe une commande", () => F.setDoc(F.doc(cS.db, "orders", orderId), order));
  await check("client: enregistre le paiement (attachPayment)", () => F.updateDoc(F.doc(cS.db, "orders", orderId), { paymentStatus: "paid", paymentReference: "REF-E2E" }));
  await check("fraude: client crée une commande déjà payée/livrée", () => F.setDoc(F.doc(cS.db, "orders", orderId + "X"), { ...order, id: orderId + "X", status: "delivered", paymentStatus: "paid" }), true);
  await check("fraude: client passe sa commande en livrée", () => F.updateDoc(F.doc(cS.db, "orders", orderId), { status: "delivered" }), true);
  await check("fraude: client change le total", () => F.updateDoc(F.doc(cS.db, "orders", orderId), { total: 1 }), true);
  await check("fraude: vendeur change les articles", () => F.updateDoc(F.doc(sellerS.db, "orders", orderId), { items: [] }), true);
  await check("fraude: livreur change le paiement", () => F.updateDoc(F.doc(delS.db, "orders", orderId), { paymentStatus: "failed" }), true);
  await check("client: voit ses commandes", async () => (await F.getDocs(F.query(F.collection(cS.db, "orders"), F.where("customerId", "==", c.uid)))).size);
  await check("vendeur: voit la commande", async () => (await F.getDocs(F.query(F.collection(sellerS.db, "orders"), F.where("sellerIds", "array-contains", seller.uid)))).docs.some(d => d.id === orderId));
  await check("vendeur: confirme", () => F.updateDoc(F.doc(sellerS.db, "orders", orderId), { status: "confirmed", statusHistory: F.arrayUnion({ status: "confirmed", at: now() }) }));
  await check("livreur: voit les commandes", async () => (await F.getDocs(F.collection(delS.db, "orders"))).size);
  await check("livreur: accepte (commande non assignée)", () => F.updateDoc(F.doc(delS.db, "orders", orderId), { deliveryId: del.uid, status: "shipping" }));
  await check("livreur: livre", () => F.updateDoc(F.doc(delS.db, "orders", orderId), { status: "delivered" }));
  await check("client: voit le statut final", async () => (await F.getDoc(F.doc(cS.db, "orders", orderId))).data().status);
  await check("notification vers le client", () => F.setDoc(F.doc(delS.db, "notifications", "e2e-" + orderId), { userId: c.uid, title: "t", message: "m", createdAt: now() }));
  const o2 = orderId + "C";
  await check("client: 2e commande", () => F.setDoc(F.doc(cS.db, "orders", o2), { ...order, id: o2 }));
  await check("client: annule une commande impayée (cancelUnpaidOrder)", () => F.updateDoc(F.doc(cS.db, "orders", o2), { status: "cancelled", statusHistory: F.arrayUnion({ status: "cancelled", at: now() }) }));
  await F.deleteDoc(F.doc(adminS.db, "orders", o2)).catch(e => console.log("cleanup o2", e.code));
  await check("admin: liste les utilisateurs", async () => (await F.getDocs(F.collection(adminS.db, "users"))).size);

  // --- Nettoyage des données de test
  await F.deleteDoc(F.doc(adminS.db, "orders", orderId)).catch(e => console.log("cleanup order", e.code));
  await F.deleteDoc(F.doc(cS.db, "notifications", "e2e-" + orderId)).catch(e => console.log("cleanup notif", e.code));
  await F.deleteDoc(F.doc(adminS.db, "users", c.uid)).catch(e => console.log("cleanup user", e.code));
  await A.deleteUser(c).catch(e => console.log("cleanup auth", e.code));
  console.log(`\nRESULT: ${pass} OK, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("ERR", e.code || "", e.message); process.exit(1); });
