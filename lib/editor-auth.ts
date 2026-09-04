"use client";

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "@/lib/firebase";

const editorEmails: Record<string, string> = {
  nks00: "nks00@nks-fukuoka.app",
  nkstaco: "nkstaco@nks-fukuoka.app",
  nkstuna: "nkstuna@nks-fukuoka.app",
};

export function useEditorAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
  }), []);

  return {
    authReady,
    canEdit: Boolean(user?.email && Object.values(editorEmails).includes(user.email)),
    username: user?.email?.split("@")[0] ?? "",
    login: async (username: string, password: string) => {
      const email = editorEmails[username.trim().toLowerCase()];
      if (!email) throw new Error("帳號或密碼錯誤");
      await signInWithEmailAndPassword(auth, email, password);
    },
    logout: () => signOut(auth),
  };
}
