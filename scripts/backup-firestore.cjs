/**
 * Sauvegarde JSON de toutes les collections Firestore (plan Spark : pas
 * d'export managé). Se connecte en admin — les Security Rules donnent à
 * l'admin la lecture de chaque collection.
 *
 * Usage : MLCHOP_ADMIN_PASSWORD=... node scripts/backup-firestore.cjs
 * Sortie : backups/firestore-<date ISO>.json (dossier ignoré par git).
 */
const fs = require("fs");
const path = require("path");
const { ROOT, F, CONFIG, signInAdmin, closeAll } = require("./lib/firebase-node.cjs");

const COLLECTIONS = [
  "users", "products", "orders", "cart", "favorites", "notifications", "reviews",
  "stockMovements", "deliveryTracking", "messages", "conversations", "feedback",
  "shops", "categories", "payments", "adminLogs",
];

/** Types Firestore → JSON restaurable (Timestamp, GeoPoint, références, octets). */
function toJson(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(toJson);
  if (value instanceof F.Timestamp) return { __type: "timestamp", iso: value.toDate().toISOString() };
  if (value instanceof F.GeoPoint) return { __type: "geopoint", lat: value.latitude, lng: value.longitude };
  if (value instanceof F.DocumentReference) return { __type: "ref", path: value.path };
  if (value instanceof F.Bytes) return { __type: "bytes", base64: value.toBase64() };
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toJson(v)]));
}

async function exportCollection(db, name) {
  try {
    const snap = await F.getDocs(F.collection(db, name));
    return { docs: snap.docs.map((d) => ({ id: d.id, data: toJson(d.data()) })) };
  } catch (error) {
    return { docs: [], error: error.code || error.message };
  }
}

(async () => {
  const admin = await signInAdmin("backup");
  const startedAt = new Date().toISOString();
  const collections = {};
  let failures = 0;

  for (const name of COLLECTIONS) {
    const { docs, error } = await exportCollection(admin.db, name);
    collections[name] = docs;
    if (error) {
      failures++;
      console.log(`${name.padEnd(18)} ERREUR ${error}`);
    } else {
      console.log(`${name.padEnd(18)} ${docs.length}`);
    }
  }

  const dir = path.join(ROOT, "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `firestore-${startedAt.replace(/[:.]/g, "-")}.json`);
  const total = Object.values(collections).reduce((sum, docs) => sum + docs.length, 0);
  fs.writeFileSync(file, JSON.stringify({ projectId: CONFIG.projectId, exportedAt: startedAt, collections }, null, 2));
  console.log(`\n${total} documents -> ${path.relative(ROOT, file)}`);

  await closeAll();
  process.exit(failures ? 1 : 0);
})().catch((error) => {
  console.error("ERR", error.code || "", error.message);
  process.exit(1);
});
