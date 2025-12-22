"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    The Ultimate Free Subscription Tracker
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
                    Stop Losing Money on <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Forgotten Subscriptions</span>
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Track all your recurring payments in one place. Get notified before you get billed. Save hundreds of dollars a year with our sleek, privacy-focused dashboard.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Link href="/login" className="h-12 px-8 bg-white text-slate-950 rounded-full font-bold text-base hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-xl shadow-white/5">
                        Start Tracking for Free <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link href="#features" className="h-12 px-8 bg-slate-900/50 text-white border border-slate-800 rounded-full font-bold text-base hover:bg-slate-800 transition-colors flex items-center justify-center">
                        See How It Works
                    </Link>
                </div>

                {/* Dashboard Visualization */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-20 pointer-events-none" />
                    <div className="rounded-2xl border border-white/10 p-2 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/dashboard-preview.svg"
                            alt="SubTrackr Dashboard Preview"
                            className="rounded-xl w-full h-auto border border-white/5 shadow-2xl"
                        />
                        {/* This image src should be replaced by the user with the generated one or a hosted URL */}
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-20 pt-10 border-t border-white/5">
                    <p className="text-sm font-medium text-slate-500 mb-6">TRUSTED BY SMART SAVERS EVERYWHERE</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder logos */}
                        <div className="flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-full" /> <span className="font-bold text-white">Acme Corp</span></div>
                        <div className="flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-full" /> <span className="font-bold text-white">GlobalBank</span></div>
                        <div className="flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-full" /> <span className="font-bold text-white">TechStart</span></div>
                        <div className="flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-full" /> <span className="font-bold text-white">DevTools</span></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
