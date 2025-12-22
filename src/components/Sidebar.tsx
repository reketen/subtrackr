"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, LogOut, Bell } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { updateUserPreferences, subscribeToUserProfile } from "@/lib/firestore";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: CreditCard, label: "Payment Cards", href: "/cards" },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
            if (data && data.notificationsEnabled !== undefined) {
                setNotificationsEnabled(data.notificationsEnabled);
            }
        });
        return () => unsubscribe();
    }, [user]);

    const handleNotificationToggle = async (checked: boolean) => {
        if (!user) return;
        setNotificationsEnabled(checked); // Optimistic UI update
        try {
            await updateUserPreferences(user.uid, { notificationsEnabled: checked });
        } catch (error) {
            console.error("Failed to update preferences", error);
            setNotificationsEnabled(!checked); // Revert on error
        }
    };

    return (
        <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col p-6 fixed left-0 top-0">
            <div className="flex items-center gap-3 mb-12">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="text-white font-bold text-xl">S</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white">SubTrackr</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-slate-800 space-y-4">
                {user && (
                    <div className="flex items-center gap-3 px-4">
                        {user.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-slate-700" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                {user.displayName?.charAt(0) || "U"}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{user.displayName}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* Notification Toggle */}
                {user && (
                    <div className="px-4 py-2">
                        <label className="flex items-center justify-between group cursor-pointer">
                            <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Notifications
                            </span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notificationsEnabled}
                                    onChange={(e) => handleNotificationToggle(e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                        </label>
                    </div>
                )}

                <div className="space-y-1">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-medium">
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
