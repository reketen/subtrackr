"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import { ShieldCheck, Zap, Bell, PiggyBank } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Landing Page Mounted. User:", user, "Loading:", loading);
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 selection:bg-indigo-500/30 selection:text-indigo-200">
      <LandingNavbar />

      <main>
        <HeroSection />

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Built for Financial wellness</h2>
              <p className="text-xl text-slate-400">Everything you need to take control of your recurring expenses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: "Privacy First",
                  desc: "Your data is encrypted and stored securely. We never sell your personal information."
                },
                {
                  icon: Bell,
                  title: "Smart Alerts",
                  desc: "Get notified via email exactly 24 hours before any payment is due."
                },
                {
                  icon: Zap,
                  title: "Instant Overview",
                  desc: "See your total monthly spend and upcoming bills at a glance."
                },
                {
                  icon: PiggyBank,
                  title: "Free Forever",
                  desc: "Track unlimited subscriptions without paying a dime. No hidden fees."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition-colors group">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                    <feature.icon className="w-6 h-6 text-slate-300 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="font-bold text-slate-300">SubTrackr</span>
            </div>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} SubTrackr. All rights reserved.</p>
            <div className="flex gap-6 text-slate-500 text-sm font-medium">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
