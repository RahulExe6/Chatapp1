import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5oH7sdcV16AW5rSw1N4Rl-xUVtJA2sl0",
  authDomain: "chatapp-c7950.firebaseapp.com",
  databaseURL: "https://chatapp-c7950-default-rtdb.firebaseio.com",
  projectId: "chatapp-c7950",
  storageBucket: "chatapp-c7950.firebasestorage.app",
  messagingSenderId: "547852260706",
  appId: "1:547852260706:web:a445da1ec24f48cfde883b",
  measurementId: "G-D5KD364RZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;