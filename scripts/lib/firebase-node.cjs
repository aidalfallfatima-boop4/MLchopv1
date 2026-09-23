/**
 * Helpers partagés par les scripts Node (tests des Security Rules, sauvegarde) :
 * charge la config Firebase publique depuis .env et ouvre des sessions
 * (app Firebase JS SDK isolée par nom) avec le SDK du projet (node_modules).
 */
const { createRequire } = require("module");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const req = createRequire(path.join(ROOT, "package.json"));
const { initializeApp, deleteApp } = req("firebase/app");
const A = req("firebase/auth");
const F = req("firebase/firestore");

// Les refus attendus des Security Rules sont journalisés par le SDK : silence.
F.setLogLevel("silent");

const ADMIN_EMAIL = "22390000000@mlchop.app";

function loadEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) throw new Error(`.env introuvable (${file})`);
  const entries = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => [line.slice(0, line.indexOf("=")).trim(), line.slice(line.indexOf("=") + 1).trim()]);
  return Object.fromEntries(entries);
}

function firebaseConfig() {
  const env = loadEnv();
  const cfg = {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  const missing = Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) throw new Error(`Config Firebase incomplète dans .env : ${missing.join(", ")}`);
  return cfg;
}

const CONFIG = firebaseConfig();
const apps = [];

/** Session indépendante (auth + firestore) : plusieurs comptes connectés en parallèle. */
function session(name) {
  const app = initializeApp(CONFIG, name);
  apps.push(app);
  return { name, app, auth: A.getAuth(app), db: F.initializeFirestore(app, { ignoreUndefinedProperties: true }) };
}

function requireAdminPassword() {
  const pw = process.env.MLCHOP_ADMIN_PASSWORD;
  if (!pw) {
    console.error("Définir MLCHOP_ADMIN_PASSWORD (mot de passe du compte admin +223 90 00 00 00).");
    process.exit(2);
  }
  return pw;
}

async function signInAdmin(name = "admin") {
  const s = session(name);
  const user = (await A.signInWithEmailAndPassword(s.auth, ADMIN_EMAIL, requireAdminPassword())).user;
  return { ...s, user };
}

async function closeAll() {
  await Promise.all(apps.splice(0).map((app) => deleteApp(app).catch(() => {})));
}

module.exports = { ROOT, A, F, CONFIG, ADMIN_EMAIL, session, signInAdmin, closeAll };
