import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const provider = new GoogleAuthProvider();

export const signIn = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("登入失敗:", error);
    if (error.code === 'auth/unauthorized-domain') {
      alert("網域未授權！請到 Firebase Console -> Authentication -> Settings -> Authorized domains 加入此網域：\n" + window.location.hostname);
    } else {
      alert("登入失敗：" + error.message);
    }
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("登出失敗:", error);
  }
};
