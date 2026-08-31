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
export type CloudExpense = { id: string; title: string; amount: number; payer: string; paid?: boolean };
export type CloudChecklistItem = { id: string; label: string; done: boolean };
export type CloudChecklistCategory = { id: string; title: string; accent: string; items: CloudChecklistItem[] };

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
        const validItems = snapshot.docs.flatMap((itemDoc) => {
          const data = itemDoc.data();

          // Earlier versions stored itinerary documents with a different shape.
          // Keep those documents untouched, but do not let them break this UI.
          if (typeof data.date !== "string" || typeof data.time !== "string" || typeof data.title !== "string") {
            return [];
          }

          const category: ItineraryItem["category"] = ["交通", "食物", "購物", "景點"].includes(data.category)
            ? data.category
            : "景點";

          const isOldDefaultOutboundFlight = itemDoc.id === "d1-01" && data.title === "出發 (JX846)";

          return [
            {
              id: itemDoc.id,
              date: data.date,
              time: isOldDefaultOutboundFlight ? "14:40" : data.time,
              title: isOldDefaultOutboundFlight ? "出發 (CI128)" : data.title,
              category,
              description: isOldDefaultOutboundFlight
                ? "搭乘中華航空前往福岡，預計 18:05 抵達福岡機場國際線航廈。"
                : typeof data.description === "string" ? data.description : "",
              address: typeof data.address === "string" ? data.address : "",
              url: typeof data.url === "string" ? data.url : "",
            } satisfies ItineraryItem,
          ];
        });

        if (validItems.length === 0) {
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
          validItems.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
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

export function useCloudChecklist(memberId: string, initialCategories: CloudChecklistCategory[]) {
  const [categories, setCategories] = useState<CloudChecklistCategory[]>(initialCategories);
  const [cloudError, setCloudError] = useState("");

  useEffect(() => {
    if (!memberId) return;
    const checklistRef = doc(db, "fukuoka_checklists", memberId);
    return onSnapshot(
      checklistRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          void setDoc(checklistRef, {
            memberId,
            categories: initialCategories,
            userId: sharedId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setCategories(initialCategories);
          return;
        }
        const value = snapshot.data().categories;
        if (Array.isArray(value)) setCategories(value as CloudChecklistCategory[]);
        setCloudError("");
      },
      () => setCloudError("準備清單雲端同步失敗，請確認 Firebase 規則已部署。"),
    );
  }, [memberId, initialCategories]);

  function save(update: (current: CloudChecklistCategory[]) => CloudChecklistCategory[]) {
    setCategories((current) => {
      const next = update(current);
      if (memberId) {
        void updateDoc(doc(db, "fukuoka_checklists", memberId), {
          categories: next,
          updatedAt: serverTimestamp(),
        }).catch(() => setCloudError("準備清單儲存失敗，請稍後再試。"));
      }
      return next;
    });
  }

  return { categories, cloudError, save };
}

export function useCloudExpenses(initialExpenses: CloudExpense[]) {
  const [expenses, setExpenses] = useState<CloudExpense[]>(initialExpenses);
  const [cloudError, setCloudError] = useState("");

  useEffect(() => {
    const expensesQuery = query(collection(db, "fukuoka_ledger"), where("userId", "==", sharedId));
    return onSnapshot(
      expensesQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setExpenses([]);
          setCloudError("");
          return;
        }

        setExpenses(
          snapshot.docs
            .map((expenseDoc) => {
              const data = expenseDoc.data();
              return {
                id: expenseDoc.id,
                title: String(data.title ?? ""),
                amount: Number(data.amount ?? 0),
                payer: String(data.payer ?? ""),
                paid: Boolean(data.paid),
                position: Number(data.position ?? 0),
              };
            })
            .sort((a, b) => a.position - b.position)
            .map(({ position: _position, ...expense }) => expense),
        );
        setCloudError("");
      },
      () => setCloudError("旅行帳本雲端同步失敗，請確認 Firebase 規則已發布。"),
    );
  }, [initialExpenses]);

  return {
    expenses,
    cloudError,
    addExpense: (expense: Omit<CloudExpense, "id">) =>
      addDoc(collection(db, "fukuoka_ledger"), {
        ...expense,
        paid: Boolean(expense.paid),
        position: Date.now(),
        userId: sharedId,
        createdAt: serverTimestamp(),
      }),
    deleteExpense: (id: string) => deleteDoc(doc(db, "fukuoka_ledger", id)),
  };
}
