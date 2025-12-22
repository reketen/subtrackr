"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";

export default function LandingNavbar() {
    const { user } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <span className="text-2xl font-black tracking-tight text-white">SubTrackr</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
                    </div>
                    {user ? (
                        <Link href="/dashboard" className="px-5 py-2.5 bg-white text-slate-950 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link href="/login" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25">
                            Get Started
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
