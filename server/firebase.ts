
import admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

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

// Define a flag to track if Firebase is initialized
let firebaseInitialized = false;

// Initialize Firebase Admin if credentials are available
let db, rtdb, storage, auth;

try {
  // Initialize Firebase Admin SDK with credentials file
  const serviceAccount = {
    type: "service_account",
    project_id: "chatapp-c7950",
    private_key_id: "2c254eb3a1",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGzPJHTIyqlRTS\nDPn85GiMC7gNgoGtP39o2VMRgJSjbkW12nUXXTQfSI0hVU/uxvxegzvpPxwzNFHr\nMiLosIExXZP08LQ+vOnT7DNzvOwRCNsTWsps/eKAEgDhxBUtzSejUUPIgBdsbUnT\nu1vwzpD/eeqYjApsGBE9GfXaU7Be4m40Bz3FFCS1iCEkLvq8T6eC1fnhw5S5Hal2\nuuD0L4MmeSG1C6c",
    client_email: "firebase-adminsdk-fbsvc@chatapp-c7950.iam.gserviceaccount.com",
    client_id: "112928116877502512982",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40chatapp-c7950.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };
  
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
