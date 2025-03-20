import admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Firebase client configuration for frontend
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB5oH7sdcV16AW5rSw1N4Rl-xUVtJA2sl0",
  authDomain: "chatapp-c7950.firebaseapp.com",
  databaseURL: "https://chatapp-c7950-default-rtdb.firebaseio.com",
  projectId: "chatapp-c7950",
  storageBucket: "chatapp-c7950.firebasestorage.app",
  messagingSenderId: "547852260706",
  appId: "1:547852260706:web:a445da1ec24f48cfde883b",
  measurementId: "G-D5KD364RZ0"
};

// Define a flag to track if Firebase is initialized
let firebaseInitialized = false;

// Initialize Firebase Admin if credentials are available
let db, rtdb, storage, auth;

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}');

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: firebaseConfig.databaseURL,
    storageBucket: firebaseConfig.storageBucket
  });

  // Initialize Firebase services
  db = getFirestore(app);
  rtdb = getDatabase(app);
  storage = getStorage(app);
  auth = getAuth(app);

  firebaseInitialized = true;
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

// Export Firebase services and flag
export { admin, db, rtdb, storage, auth, Timestamp, FieldValue, firebaseInitialized };