"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { itinerary as initialItinerary, type ItineraryItem } from "@/data/trip";
import { db } from "@/lib/firebase";

export type TripMember = { id: string; name: string; avatar: string };

const sharedId = "shared_fukuoka_trip";
const initialMembers: TripMember[] = [
  { id: "member-00", name: "00", avatar: "" },
  { id: "member-mom", name: "媽媽", avatar: "" },
  { id: "member-uu", name: "UU", avatar: "" },
  { id: "member-tuna", name: "鮪魚", avatar: "" },
  { id: "member-paipai", name: "派派", avatar: "" },
];

export function useCloudMembers() {
  const [members, setMembers] = useState<TripMember[]>(initialMembers);
  const [cloudError, setCloudError] = useState("");

  useEffect(() => {
    const membersQuery = query(collection(db, "fukuoka_members"), where("userId", "==", sharedId));
    return onSnapshot(
      membersQuery,
      (snapshot) => {
        if (snapshot.empty) {
          void Promise.all(
            initialMembers.map((member) =>
              setDoc(doc(db, "fukuoka_members", member.id), {
                name: member.name,
                avatar: member.avatar,
                userId: sharedId,
                createdAt: serverTimestamp(),
              }),
            ),
          );
          return;
        }
        setMembers(
          snapshot.docs
            .map((memberDoc) => ({ id: memberDoc.id, name: String(memberDoc.data().name), avatar: String(memberDoc.data().avatar ?? "") }))
            .sort((a, b) => a.id.localeCompare(b.id)),
        );
        setCloudError("");
      },
      () => setCloudError("成員雲端同步失敗，請確認 Firebase 規則已部署。"),
    );
  }, []);

  return {
    members,
    cloudError,
    addMember: (name: string) =>
      addDoc(collection(db, "fukuoka_members"), { name, avatar: "", userId: sharedId, createdAt: serverTimestamp() }),
    deleteMember: (id: string) => deleteDoc(doc(db, "fukuoka_members", id)),
    updateAvatar: (id: string, avatar: string) => updateDoc(doc(db, "fukuoka_members", id), { avatar }),
  };
}

export function useCloudItinerary() {
  const [items, setItems] = useState<ItineraryItem[]>(initialItinerary);
  const [cloudError, setCloudError] = useState("");

  useEffect(() => {
    const itineraryQuery = query(collection(db, "fukuoka_itinerary"), where("userId", "==", sharedId));
    return onSnapshot(
      itineraryQuery,
      (snapshot) => {
        if (snapshot.empty) {
          void Promise.all(
            initialItinerary.map((item) =>
              setDoc(doc(db, "fukuoka_itinerary", item.id), {
                ...item,
                userId: sharedId,
                createdAt: serverTimestamp(),
              }),
            ),
          );
          return;
        }
        setItems(
          snapshot.docs
            .map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }) as ItineraryItem)
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
        );
        setCloudError("");
      },
      () => setCloudError("行程雲端同步失敗，請確認 Firebase 規則已部署。"),
    );
  }, []);

  return {
    items,
    cloudError,
    addItem: (item: Omit<ItineraryItem, "id">) =>
      addDoc(collection(db, "fukuoka_itinerary"), { ...item, userId: sharedId, createdAt: serverTimestamp() }),
    updateItem: (id: string, item: Partial<Omit<ItineraryItem, "id">>) => updateDoc(doc(db, "fukuoka_itinerary", id), item),
    deleteItem: (id: string) => deleteDoc(doc(db, "fukuoka_itinerary", id)),
  };
}
