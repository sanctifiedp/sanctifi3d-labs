import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEFewiakVD8OD650mnSZ99IWZhIb5uBK4",
  authDomain: "sanctifi3d-labs.firebaseapp.com",
  projectId: "sanctifi3d-labs",
  storageBucket: "sanctifi3d-labs.firebasestorage.app",
  messagingSenderId: "539531026124",
  appId: "1:539531026124:web:55eb6392e4a6976487ac69"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
