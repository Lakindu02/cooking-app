import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBEDvwZZea7tMN_THS1pIMzoP9HLyxnjc0", // ✅ Make sure this is filled in!
  authDomain: "skillsport-62f67.firebaseapp.com",
  projectId: "Yskillsport-62f67",
  storageBucket: "skillsport-62f67.firebasestorage.app",
  messagingSenderId: "127936211664",
  appId: "1:127936211664:web:f4e06d84fe71f816500cd5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ FIX: Make sure to export everything!
export { auth, provider, signInWithPopup, signOut };
