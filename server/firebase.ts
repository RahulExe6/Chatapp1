import * as admin from 'firebase-admin';

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

// Initialize Firebase Admin SDK with a try-catch
let db, rtdb, storage, auth, Timestamp, FieldValue;
let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: firebaseConfig.databaseURL,
      storageBucket: firebaseConfig.storageBucket,
    });
    
    // Import these only if the initialization succeeds
    const { getFirestore, Timestamp: FbTimestamp, FieldValue: FbFieldValue } = require('firebase-admin/firestore');
    const { getDatabase } = require('firebase-admin/database');
    const { getStorage } = require('firebase-admin/storage');
    const { getAuth } = require('firebase-admin/auth');
    
    // Assign to our variables
    db = getFirestore(app);
    rtdb = getDatabase(app);
    storage = getStorage(app);
    auth = getAuth(app);
    Timestamp = FbTimestamp;
    FieldValue = FbFieldValue;
    
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.warn('Missing Firebase credentials. Firebase services will not be available.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

// Export everything, but they might be undefined if initialization failed
export { admin, db, rtdb, storage, auth, Timestamp, FieldValue, firebaseInitialized };