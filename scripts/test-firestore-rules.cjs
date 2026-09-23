/**
 * Test de bout en bout des Security Rules Firestore contre le VRAI projet
 * (mlchop-31688). Autonome : crée des comptes jetables (vendeur, livreur,
 * client) aux numéros aléatoires, déroule le parcours complet + tentatives de
 * fraude qui doivent être refusées, puis nettoie TOUT (même en cas d'échec).
 *
 * Usage : MLCHOP_ADMIN_PASSWORD=... node scripts/test-firestore-rules.cjs
 * (à relancer après chaque "firebase deploy --only firestore").
 * Code de sortie 1 si un seul contrôle échoue.
 */
const crypto = require("crypto");
const { A, F, session, signInAdmin, closeAll } = require("./lib/firebase-node.cjs");

const DELIVERY_FEE = 2500;
const now = () => new Date().toISOString();
const rand = (n) => crypto.randomInt(10 ** (n - 1), 10 ** n).toString();
const long = (n) => "x".repeat(n);

let pass = 0;
let fail = 0;

async function check(label, fn, expectDenied = false) {
  try {
    const result = await fn();
    if (expectDenied) {
      fail++;
      console.log("FAIL (should be denied):", label);
    } else {
      pass++;
      console.log("OK:", label, result ?? "");
    }
  } catch (error) {
    if (expectDenied && error.code === "permission-denied") {
      pass++;
      console.log("OK (denied as expected):", label);
    } else {
      fail++;
      console.log("FAIL:", label, error.code || "", error.message);
    }
  }
}

const deny = (label, fn) => check(label, fn, true);

/** Tout doc qu'on tente d'écrire est noté : l'admin le supprime au nettoyage
 * (y compris ceux qui auraient été acceptés à tort). */
const touched = new Set();
function ref(s, collection, id) {
  touched.add(`${collection}/${id}`);
  return F.doc(s.db, collection, id);
}

const throwaway = [];
async function newAccount(name) {
  const s = session(name);
  const phone = `+223 99 ${rand(6)}`;
  const email = `${phone.replace(/\D/g, "")}${rand(3)}@mlchop.app`;
  const user = (await A.createUserWithEmailAndPassword(s.auth, email, `T-${crypto.randomBytes(12).toString("hex")}`)).user;
  throwaway.push({ s, user });
  touched.add(`users/${user.uid}`);
  return { ...s, user, uid: user.uid, phone };
}

function userDoc(role, extra = {}) {
  return {
    role,
    fullName: `Test ${role}`,
    phone: "+223 99 00 00 00",
    status: role === "client" ? "active" : "pending_approval",
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

function makeOrder(orderId, customerId, product, overrides = {}) {
  const items = overrides.items ?? [{ ...product, quantity: 2 }];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = overrides.deliveryFee ?? DELIVERY_FEE;
  return {
    id: orderId,
    items,
    total: subtotal + deliveryFee,
    status: "pending",
    customerName: "Client Test",
    customerPhone: "+223 99 00 00 00",
    deliveryAddress: "Hamdallaye ACI, Bamako",
    paymentMethod: "cash",
    paymentStatus: "pending",
    createdAt: now(),
    deliveryCode: "1234",
    deliveryFee,
    customerId,
    sellerIds: [product.sellerId],
    statusHistory: [{ status: "pending", at: now() }],
    ...overrides,
  };
}

async function registration(seller, courier, client) {
  await deny("sécurité: un inscrit ne peut pas se déclarer vendeur actif", () =>
    F.setDoc(ref(client, "users", client.uid), userDoc("seller", { status: "active" })));
  await deny("sécurité: un client ne peut pas se créer admin", () =>
    F.setDoc(ref(client, "users", client.uid), userDoc("admin", { status: "active" })));
  await deny("validation: nom de 81 caractères refusé", () =>
    F.setDoc(ref(client, "users", client.uid), userDoc("client", { fullName: long(81) })));
  await deny("validation: clé inconnue dans users refusée", () =>
    F.setDoc(ref(client, "users", client.uid), userDoc("client", { isAdmin: true })));
  await deny("validation: véhicule hors liste refusé", () =>
    F.setDoc(ref(courier, "users", courier.uid), userDoc("delivery", { vehicle: "Avion" })));
  await check("inscription client (active, champs undefined)", () =>
    F.setDoc(ref(client, "users", client.uid), userDoc("client", { shopName: undefined, vehicle: undefined })));
  await check("inscription vendeur (pending_approval)", () =>
    F.setDoc(ref(seller, "users", seller.uid), userDoc("seller", { shopName: "Boutique Test" })));
  await check("inscription livreur (pending_approval)", () =>
    F.setDoc(ref(courier, "users", courier.uid), userDoc("delivery", { vehicle: "Moto" })));
  await deny("sécurité: vendeur en attente s'auto-active", () =>
    F.updateDoc(ref(seller, "users", seller.uid), { status: "active" }));
  await deny("sécurité: client se promeut vendeur", () =>
    F.updateDoc(ref(client, "users", client.uid), { role: "seller" }));
  await check("client: modifie son nom", () =>
    F.updateDoc(ref(client, "users", client.uid), { fullName: "Client Test", updatedAt: now() }));
}

function newProduct(sellerUid, extra = {}) {
  const id = Date.now() + crypto.randomInt(1000);
  return {
    id,
    name: "Produit Test Rules",
    price: 5000,
    category: "Alimentation",
    emoji: "🛍️",
    stock: 10,
    description: "Produit jetable des tests de règles",
    sellerId: sellerUid,
    sellerName: "Boutique Test",
    active: true,
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

async function pendingCannotAct(seller, courier) {
  const p = newProduct(seller.uid);
  await deny("vendeur en attente: crée un produit", () => F.setDoc(ref(seller, "products", String(p.id)), p));
  await deny("livreur en attente: lit toutes les commandes", () => F.getDocs(F.collection(courier.db, "orders")));
  await deny("vendeur en attente: lit ses commandes", () =>
    F.getDocs(F.query(F.collection(seller.db, "orders"), F.where("sellerIds", "array-contains", seller.uid))));
}

async function approve(admin, seller, courier) {
  await check("admin: valide le vendeur", () =>
    F.updateDoc(F.doc(admin.db, "users", seller.uid), { status: "active", updatedAt: now() }));
  await check("admin: valide le livreur", () =>
    F.updateDoc(F.doc(admin.db, "users", courier.uid), { status: "active", updatedAt: now() }));
}

async function sellerCatalog(seller) {
  const p = newProduct(seller.uid);
  await check("vendeur actif: crée un produit", () => F.setDoc(ref(seller, "products", String(p.id)), p));
  const bad = (label, extra) => {
    const b = newProduct(seller.uid, extra);
    return deny(`validation produit: ${label}`, () => F.setDoc(ref(seller, "products", String(b.id)), b));
  };
  await bad("prix 0", { price: 0 });
  await bad("prix décimal", { price: 10.5 });
  await bad("stock 100001", { stock: 100001 });
  await bad("nom 101 caractères", { name: long(101) });
  await bad("description 1001 caractères", { description: long(1001) });
  await bad("clé inconnue", { hacked: true });
  await bad("sellerId d'un autre", { sellerId: "someone-else" });
  const mismatched = newProduct(seller.uid);
  await deny("validation produit: id ≠ id du doc", () =>
    F.setDoc(ref(seller, "products", String(mismatched.id + 1)), mismatched));
  await check("vendeur: modifie prix/stock de son produit", () =>
    F.updateDoc(ref(seller, "products", String(p.id)), { price: 6000, stock: 12, updatedAt: now() }));
  p.price = 6000;
  p.stock = 12;
  await deny("fraude: vendeur modifie le produit d'un autre vendeur", () =>
    F.updateDoc(F.doc(seller.db, "products", "1"), { price: 1 }));
  const smId = `${p.id}-${Date.now()}`;
  await check("vendeur: journalise un mouvement de stock", () =>
    F.setDoc(ref(seller, "stockMovements", smId), {
      productId: p.id, previousQty: 10, newQty: 12, type: "restock", userId: seller.uid, userName: "Test seller", at: now(),
    }));
  return p;
}

async function orderCreation(client, product) {
  const base = "MLT" + rand(7);
  const orderId = base;
  const order = makeOrder(orderId, client.uid, product);
  const tryBad = (label, suffix, overrides) =>
    deny(`fraude commande: ${label}`, () =>
      F.setDoc(ref(client, "orders", base + suffix), { ...makeOrder(base + suffix, client.uid, product, overrides) }));

  await tryBad("total faux", "A", { total: 100 });
  await tryBad("prix unitaire faux (total cohérent)", "B", { items: [{ ...product, price: 1, quantity: 2 }] });
  await tryBad("6 articles", "C", { items: Array.from({ length: 6 }, () => ({ ...product, quantity: 1 })) });
  await tryBad("quantité 0", "D", { items: [{ ...product, quantity: 0 }] });
  await tryBad("quantité 100", "E", { items: [{ ...product, quantity: 100 }] });
  await tryBad("frais de livraison 0", "F", { deliveryFee: 0 });
  await tryBad("adresse 201 caractères", "G", { deliveryAddress: long(201) });
  await tryBad("nom client 81 caractères", "H", { customerName: long(81) });
  await tryBad("déjà payée/livrée", "I", { status: "delivered", paymentStatus: "paid" });
  await tryBad("pour un autre client", "J", { customerId: "someone-else" });
  await tryBad("produit inexistant", "K", { items: [{ ...product, id: 999999999999, quantity: 1 }] });
  await tryBad("clé inconnue", "L", { discount: 90 });
  await tryBad("historique pré-rempli", "M", {
    statusHistory: [{ status: "pending", at: now() }, { status: "delivered", at: now() }],
  });
  await check("client: passe une commande valide", () => F.setDoc(ref(client, "orders", orderId), order));
  return { orderId, order };
}

async function orderLifecycle(admin, seller, courier, client, product, { orderId, order }) {
  const o = (s) => ref(s, "orders", orderId);
  await check("client: enregistre le paiement (attachPayment)", () =>
    F.updateDoc(o(client), { paymentStatus: "paid", paymentReference: "REF-TEST" }));
  await deny("fraude: client passe sa commande en livrée", () => F.updateDoc(o(client), { status: "delivered" }));
  await deny("fraude: client change le total", () => F.updateDoc(o(client), { total: 1 }));
  await deny("fraude: vendeur change les articles", () => F.updateDoc(o(seller), { items: [] }));
  await deny("fraude: livreur change le paiement", () => F.updateDoc(o(courier), { paymentStatus: "failed" }));
  await deny("validation: statut inconnu", () => F.updateDoc(o(seller), { status: "hacked" }));
  await check("client: voit ses commandes", async () =>
    (await F.getDocs(F.query(F.collection(client.db, "orders"), F.where("customerId", "==", client.uid)))).size);
  await check("vendeur: voit la commande", async () => {
    const snap = await F.getDocs(F.query(F.collection(seller.db, "orders"), F.where("sellerIds", "array-contains", seller.uid)));
    if (!snap.docs.some((d) => d.id === orderId)) throw new Error("commande absente");
    return snap.size;
  });
  await check("vendeur: confirme", () =>
    F.updateDoc(o(seller), { status: "confirmed", statusHistory: F.arrayUnion({ status: "confirmed", at: now() }) }));
  await check("livreur actif: voit les commandes", async () => (await F.getDocs(F.collection(courier.db, "orders"))).size);
  await deny("fraude: livreur marque livrée une commande non prise", () => F.updateDoc(o(courier), { status: "delivered" }));
  await check("livreur: accepte (commande non assignée)", () =>
    F.updateDoc(o(courier), { deliveryId: courier.uid, status: "shipping", statusHistory: F.arrayUnion({ status: "shipping", at: now() }) }));
  await check("livreur: publie sa position GPS", () =>
    F.setDoc(ref(courier, "deliveryTracking", orderId), { position: { lat: 12.6, lng: -8, heading: null }, updatedAt: Date.now() }));
  await check("client: lit la position du livreur", async () => (await F.getDoc(F.doc(client.db, "deliveryTracking", orderId))).exists());
  await check("livreur: livre", () =>
    F.updateDoc(o(courier), { status: "delivered", statusHistory: F.arrayUnion({ status: "delivered", at: now() }) }));
  await check("client: voit le statut final", async () => {
    const status = (await F.getDoc(F.doc(client.db, "orders", orderId))).data().status;
    if (status !== "delivered") throw new Error(status);
    return status;
  });

  const o2 = orderId + "C";
  await check("client: 2e commande", () => F.setDoc(ref(client, "orders", o2), { ...order, id: o2 }));
  await check("client: annule une commande impayée (cancelUnpaidOrder)", () =>
    F.updateDoc(ref(client, "orders", o2), { status: "cancelled", statusHistory: F.arrayUnion({ status: "cancelled", at: now() }) }));
  await check("admin: lit toutes les commandes", async () => (await F.getDocs(F.collection(admin.db, "orders"))).size);
}

async function notificationsReviewsCart(admin, seller, client, product, orderId) {
  const nid = `n-test-${rand(8)}`;
  const notif = { id: nid, title: "Test", message: "Message", type: "info", createdAt: now(), read: false, userId: client.uid };
  await check("notification valide (vendeur → client)", () => F.setDoc(ref(seller, "notifications", nid), notif));
  const n2 = nid + "b";
  await deny("notification avec clé en plus", () => F.setDoc(ref(seller, "notifications", n2), { ...notif, id: n2, extra: 1 }));
  await deny("notification message 501 caractères", () =>
    F.setDoc(ref(seller, "notifications", n2), { ...notif, id: n2, message: long(501) }));
  await deny("notification type inconnu", () => F.setDoc(ref(seller, "notifications", n2), { ...notif, id: n2, type: "phishing" }));
  await deny("notification déjà lue", () => F.setDoc(ref(seller, "notifications", n2), { ...notif, id: n2, read: true }));
  await check("client: marque sa notification lue", () => F.updateDoc(ref(client, "notifications", nid), { read: true }));
  await deny("vendeur: lit la notification du client", () => F.getDoc(F.doc(seller.db, "notifications", nid)));

  const rid = `rev-test-${rand(8)}`;
  const review = { id: rid, productId: product.id, orderId, author: "Client Test", rating: 5, comment: "Très bien", createdAt: now(), authorId: client.uid };
  await check("avis valide", () => F.setDoc(ref(client, "reviews", rid), review));
  await deny("avis note 6", () => F.setDoc(ref(client, "reviews", rid + "b"), { ...review, id: rid + "b", rating: 6 }));
  await deny("avis note 0", () => F.setDoc(ref(client, "reviews", rid + "b"), { ...review, id: rid + "b", rating: 0 }));
  await deny("avis commentaire 1001 caractères", () =>
    F.setDoc(ref(client, "reviews", rid + "b"), { ...review, id: rid + "b", comment: long(1001) }));
  await deny("avis au nom d'un autre", () =>
    F.setDoc(ref(client, "reviews", rid + "b"), { ...review, id: rid + "b", authorId: seller.uid }));

  await check("client: panier 1 article", () => F.setDoc(ref(client, "cart", client.uid), { items: [{ ...product, quantity: 1 }] }));
  await deny("client: panier 51 articles", () =>
    F.setDoc(ref(client, "cart", client.uid), { items: Array.from({ length: 51 }, () => ({ ...product, quantity: 1 })) }));
  await deny("vendeur: lit le panier du client", () => F.getDoc(F.doc(seller.db, "cart", client.uid)));
  await check("client: favoris", () => F.setDoc(ref(client, "favorites", client.uid), { productIds: [product.id] }));
  await check("admin: lit paniers/favoris/notifications", async () => {
    const counts = await Promise.all(["cart", "favorites", "notifications"].map(async (c) => (await F.getDocs(F.collection(admin.db, c))).size));
    return counts.join("/");
  });
}

async function feedback(admin, client) {
  const valid = { userId: client.uid, role: "client", type: "bug", message: "Le bouton payer ne répond pas", screen: "Checkout", userAgent: "node-test", createdAt: now(), status: "new" };
  const fid = `fb-test-${rand(8)}`;
  await check("feedback valide", () => F.setDoc(ref(client, "feedback", fid), valid));
  const bad = (label, data) => deny(`feedback invalide: ${label}`, () => F.setDoc(ref(client, "feedback", fid + "b"), data));
  await bad("type inconnu", { ...valid, type: "spam" });
  await bad("message 4 caractères", { ...valid, message: "abcd" });
  await bad("message 2001 caractères", { ...valid, message: long(2001) });
  await bad("statut 'fixed'", { ...valid, status: "fixed" });
  await bad("clé en plus", { ...valid, admin: true });
  await bad("userId d'un autre", { ...valid, userId: "someone-else" });
  await check("admin: lit les feedbacks", async () => (await F.getDocs(F.collection(admin.db, "feedback"))).size);
  await check("admin: marque un feedback vu", () => F.updateDoc(F.doc(admin.db, "feedback", fid), { status: "seen" }));
  await deny("client: lit les feedbacks", () => F.getDocs(F.collection(client.db, "feedback")));
  await deny("client: lit son propre feedback", () => F.getDoc(F.doc(client.db, "feedback", fid)));
  await deny("client: change le statut d'un feedback", () => F.updateDoc(F.doc(client.db, "feedback", fid), { status: "fixed" }));
}

async function cleanup(admin) {
  console.log(`\n--- Nettoyage (${touched.size} docs, ${throwaway.length} comptes Auth)`);
  let errors = 0;
  // users en dernier : les autres suppressions n'en dépendent pas mais l'ordre reste lisible.
  const paths = [...touched].sort((a, b) => (a.startsWith("users/") ? 1 : 0) - (b.startsWith("users/") ? 1 : 0));
  for (const p of paths) {
    const [collection, id] = p.split("/");
    await F.deleteDoc(F.doc(admin.db, collection, id)).catch((e) => {
      errors++;
      console.log("cleanup", p, e.code);
    });
  }
  for (const { user } of throwaway) {
    await A.deleteUser(user).catch((e) => {
      errors++;
      console.log("cleanup auth", user.uid, e.code);
    });
  }
  console.log(errors ? `Nettoyage : ${errors} erreur(s)` : "Nettoyage : OK");
  return errors;
}

(async () => {
  const admin = await signInAdmin();
  let cleanupErrors = 0;
  try {
    const seller = await newAccount("seller");
    const courier = await newAccount("delivery");
    const client = await newAccount("client");

    await registration(seller, courier, client);
    await pendingCannotAct(seller, courier);
    await approve(admin, seller, courier);
    const product = await sellerCatalog(seller);
    const created = await orderCreation(client, product);
    await orderLifecycle(admin, seller, courier, client, product, created);
    await notificationsReviewsCart(admin, seller, client, product, created.orderId);
    await feedback(admin, client);
    await check("admin: liste les utilisateurs", async () => (await F.getDocs(F.collection(admin.db, "users"))).size);
  } catch (error) {
    fail++;
    console.log("FAIL: erreur inattendue", error.code || "", error.message);
  } finally {
    cleanupErrors = await cleanup(admin);
  }
  console.log(`\nRESULT: ${pass} OK, ${fail} FAIL`);
  await closeAll();
  process.exit(fail || cleanupErrors ? 1 : 0);
})().catch((error) => {
  console.error("ERR", error.code || "", error.message);
  process.exit(1);
});
