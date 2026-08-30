import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import firebaseConfig from "@/firebase-applet-config.json";

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
