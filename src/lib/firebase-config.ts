
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEz7kgfon1BSfSrxpeGov67Acz7ai6pAI",
  authDomain: "eafctracker-93724881-c25a8.firebaseapp.com",
  projectId: "eafctracker-93724881-c25a8",
  storageBucket: "eafctracker-93724881-c25a8.firebasestorage.app",
  messagingSenderId: "928101690810",
  appId: "1:928101690810:web:80b6cfd7da0df64a31c183"
};

// This function checks if all required environment variables are present.
// It's a critical step to ensure Firebase can initialize.
const isConfigValid = 
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.messagingSenderId &&
    !!firebaseConfig.appId;

let app: FirebaseApp;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Only initialize Firebase if the configuration is valid.
if (isConfigValid) {
    if (!getApps().length) {
      // Initialize a new app if one doesn't exist.
      app = initializeApp(firebaseConfig);
    } else {
      // Use the existing app if it's already been initialized.
      app = getApps()[0];
    }
    db = getFirestore(app);
    storage = getStorage(app);
}

// Export the config validation result so other parts of the app can check it.
export { db, storage, isConfigValid };
