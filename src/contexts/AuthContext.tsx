"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { syncUserProfile } from "../lib/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth State Changed:", user ? "User logged in" : "User logged out");
            setUser(user);
            setLoading(false);
            if (user) {
                // Sync user profile to Firestore
                try {
                    await syncUserProfile({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    });
                } catch (error) {
                    console.error("Failed to sync user profile", error);
                }
            }
        });

        return () => unsubscribe();
    }, [router]);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            router.push("/dashboard");
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
