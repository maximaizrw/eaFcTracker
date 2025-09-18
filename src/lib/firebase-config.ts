
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
