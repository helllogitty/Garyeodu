import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWLnCMHUe5wcIuD9ueWCKoFU4Aufh0g4o",
  authDomain: "snapguard-75074.firebaseapp.com",
  projectId: "snapguard-75074",
  storageBucket: "snapguard-75074.firebasestorage.app",
  messagingSenderId: "121964848026",
  appId: "1:121964848026:web:fc4bf663bbab758015d023",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
