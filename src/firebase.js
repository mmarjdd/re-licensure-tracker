import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgf_nFpsEKUzsvPZ00AUU9rTMTAwEihw8",
  authDomain: "re-licensure-tracker.firebaseapp.com",
  projectId: "re-licensure-tracker",
  storageBucket: "re-licensure-tracker.firebasestorage.app",
  messagingSenderId: "413335810049",
  appId: "1:413335810049:web:df5bce620ccf9bbce25000"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Firestore helpers ──────────────────────────────────────────────────────────

// Load a document by key from a collection
export async function loadDoc(collection, key) {
  try {
    const ref = doc(db, collection, key);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("loadDoc error:", e);
    return null;
  }
}

// Save/merge a document
export async function saveDoc(collection, key, data) {
  try {
    const ref = doc(db, collection, key);
    await setDoc(ref, data, { merge: true });
    return true;
  } catch (e) {
    console.error("saveDoc error:", e);
    return false;
  }
}
