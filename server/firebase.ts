
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
    private_key_id: "2c254eb3a138b31d92335373db8988452fcdcb34",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDGzPJHTIyqlRTS\nDPn85GiMC7gNgoGtP39o2VMRgJSjbkW12nUXXTQfSI0hVU/uxvxegzvpPxwzNFHr\nMiLosIExXZP08LQ+vOnT7DNzvOwRCNsTWsps/eKAEgDhxBUtzSejUUPIgBdsbUnT\nu1vwzpD/eeqYjApsGBE9GfXaU7Be4m40Bz3FFCS1iCEkLvq8T6eC1fnhw5S5Hal2\nuuD0L4MmeSG1C6c6DOHpZv6z60puP1wweaXUv+6aF73Q7mDk/Z0NR2K7n5qwuzE5\n31CG9HfyZqZ3CazVjZQwy8CjoTLrgDaRTJpkbcwW35xetZdAnCuVc+fpM/YT59r1\nGpAKLOB3AgMBAAECggEARQZ1/OGMWdInh4Mv7WnVDwMmpbIxmljYwSvsFsChW1l3\nZNv0GeenqFEFh5Rai5qVl69TRvo9rV22L8aZrldSlDRcoghNXRc0zPtPJhlrkcKU\nZlT4wf0o/rTBj6IIhH2eDKuzsFMhTulnX9fG5Yaje8D1/n9pQvzcR23TGjpCm77A\nQO40ut0o4aAuWLcay1pijkY28KtmWydMIr9pAbMa+RgKjLC90JRVnQKfNO/zPBLL\nHExPYciSbHDKiI6Xy4W7TKaeYKNajd/Tk7IUNGRxjMnCwQ6u0t+cAt7PoQfEyywF\nbiLfSeL+40yWa9BR3ebAIJV0wBJkn2SkOxgnxhHpWQKBgQDjVhaSTAluOtLHU/sC\n7W2VsVKt3wVpMDJa7KZEQCwSI9+3d9uv8J0K4OwhkNvPwML31UpAPJAm+Vp2Tqi8\nym77cYF5nG/dKnpgEuS96yzkMSmXAMCX0r5gq2X6owHiJ1MbLDtVATwQPeVPFcwB\nqOXsA9GsI04BNX8eVnwRYXfRewKBgQDf3cnnun9Hnx0UJDnp5cxBn+m6bvd3qMLn\nX7Sx7mPNwVM0vzncSzlXatmFbGv3PY593AqCw/CBhBrhxMsiAReD7+0SkKBDbxLG\nmtlocsx+gv+d1hlh2vef8iIqOL7XOvKK5P2t9iRku76ChD/SQGoBP/YffsLb7ei2\ngJ8dcV7mNQKBgQCEImmEJwXkN/SDPuDK1s23EBYKUXKHrSfXiW0qhlIXSRqjPNtH\n7AabaBhXeicJHfU0r5g0tf7jaFOYKCgTc2YGZ/blhHPQjPwME284pBS3nYua5SkM\nFcXp0jW39D8H/+tiA9eIlOsgVZmO2hB1doINKDsaXnrcYQe9zm7We1x1OQKBgQDe\nZqSzhl/0c2qcG/E9IYLun0PAZ4WKZypaWoZVTpPwUWOsP13oMQNiiVBYcQJBufHZ\nr8TxbF9/DBL4wF1eBt+pv64yh2PwGmT40dWzInluJg50a8MDqFnhmNfAQme1w2Y5\n/ozXSnWVbb8yQth0tHGblEObvn8vpwdOaDGrOnohEQKBgCXi0F7Lyil2t4B+Bqto\n/Sgqf2o5l0cprA+3L0fd2pSzqPCwRw3scEWXHgxR/+njNFStxqkzVESpf/xuaeCU\ndSpDifhhBB2oIf9yICQIqZ8h4WFCuTHRiw7zq674jF0y1Yb2lTLkD2d1PuxS7j2E\nt1oH+lJIigyCGUAuk0v0z9m0-----END PRIVATE KEY-----",
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
