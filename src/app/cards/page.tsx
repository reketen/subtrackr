"use client";

import CardList from "@/components/cards/CardList";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function CardsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        // Minimal loading state to avoid flash
        return <div className="min-h-screen bg-slate-950"></div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="ml-64 flex-1 p-10">
                <div className="max-w-6xl mx-auto">
                    <CardList />
                </div>
            </main>
        </div>
    );
}
