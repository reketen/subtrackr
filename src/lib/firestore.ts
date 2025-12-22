import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    onSnapshot,
    where,
    serverTimestamp,
    setDoc,
    DocumentData,
    getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { Card } from "../types/card";
import { Subscription } from "../types/subscription";

// Collections
const CARDS_COLLECTION = "cards";
const SUBS_COLLECTION = "subscriptions";

// Cards CRUD
export const addCard = (card: Omit<Card, "id" | "createdAt" | "userId">, userId: string) => {
    return addDoc(collection(db, CARDS_COLLECTION), {
        ...card,
        userId,
        createdAt: serverTimestamp(),
    });
};

export const updateCard = (id: string, card: Partial<Card>) => {
    const cardRef = doc(db, CARDS_COLLECTION, id);
    return updateDoc(cardRef, card);
};

export const deleteCard = (id: string) => {
    const cardRef = doc(db, CARDS_COLLECTION, id);
    return deleteDoc(cardRef);
};

export const subscribeToCards = (userId: string, callback: (cards: Card[]) => void) => {
    const q = query(
        collection(db, CARDS_COLLECTION),
        where("userId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
        const cards = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Card[];
        callback(cards);
    }, (error) => {
        console.error("Error fetching cards:", error);
    });
};

// Subscriptions CRUD
export const addSubscription = (sub: Omit<Subscription, "id" | "createdAt" | "userId">, userId: string) => {
    return addDoc(collection(db, SUBS_COLLECTION), {
        ...sub,
        userId,
        createdAt: serverTimestamp(),
    });
};

export const updateSubscription = (id: string, sub: Partial<Subscription>) => {
    const subRef = doc(db, SUBS_COLLECTION, id);
    return updateDoc(subRef, sub);
};

export const deleteSubscription = (id: string) => {
    const subRef = doc(db, SUBS_COLLECTION, id);
    return deleteDoc(subRef);
};

export const subscribeToSubscriptions = (userId: string, callback: (subs: Subscription[]) => void) => {
    const q = query(
        collection(db, SUBS_COLLECTION),
        where("userId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
        const subs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Subscription[];
        callback(subs);
    }, (error) => {
        console.error("Error fetching subscriptions:", error);
    });
};
// User Sync
export const syncUserProfile = async (user: { uid: string; email: string | null; displayName: string | null }) => {
    if (!user.email) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // New user: create with defaults
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            updatedAt: serverTimestamp(),
            notificationsEnabled: true
        });
    } else {
        // Existing user: update profile, ensure notificationsEnabled exists (default to true if missing)
        const data = userSnap.data();
        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            updatedAt: serverTimestamp(),
            // Preserve existing setting, or default to true if it was somehow lost
            notificationsEnabled: data.notificationsEnabled ?? true
        }, { merge: true });
    }
};

// Update User Preferences
export const updateUserPreferences = async (userId: string, preferences: { notificationsEnabled: boolean }) => {
    const userRef = doc(db, "users", userId);
    // Use setDoc with merge=true instead of updateDoc to be robust against missing fields/docs
    return setDoc(userRef, {
        ...preferences,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

export const subscribeToUserProfile = (userId: string, callback: (data: DocumentData | undefined) => void) => {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
};
