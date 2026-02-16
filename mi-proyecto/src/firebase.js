import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABN4bFohkMTxdi2J0FmIRM8SSCdnhZ-00",
  authDomain: "entrevista-b76ca.firebaseapp.com",
  projectId: "entrevista-b76ca",
  storageBucket: "entrevista-b76ca.firebasestorage.app",
  messagingSenderId: "627097703633",
  appId: "1:627097703633:web:a9cca27d35e6cc399861f0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);