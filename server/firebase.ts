import admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

// Firebase client configuration for frontend
export const firebaseConfig = {
  apiKey: "AIzaSyB5oH7sdcV16AW5rSw1N4Rl-xUVtJA2sl0",
  authDomain: "chatapp-c7950.firebaseapp.com",
  databaseURL: "https://chatapp-c7950-default-rtdb.firebaseio.com",
  projectId: "chatapp-c7950",
  storageBucket: "chatapp-c7950.firebasestorage.app",
  messagingSenderId: "547852260706",
  appId: "1:547852260706:web:a445da1ec24f48cfde883b",
  measurementId: "G-D5KD364RZ0"
};

let firebaseInitialized = false;
let db, rtdb, storage, auth;

try {
  const serviceAccount = JSON.parse(
    fs.readFileSync(new URL('./firebase-credentials.json', import.meta.url), 'utf8')
  );

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: firebaseConfig.databaseURL,
    storageBucket: firebaseConfig.storageBucket
  });

  db = getFirestore(app);
  rtdb = getDatabase(app);
  storage = getStorage(app);
  auth = getAuth(app);

  firebaseInitialized = true;
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

export { admin, db, rtdb, storage, auth, Timestamp, FieldValue, firebaseInitialized };