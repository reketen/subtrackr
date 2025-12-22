"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Plus, TrendingUp, Calendar, CreditCard as CardIcon, ExternalLink } from "lucide-react";
import Modal from "@/components/Modal";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import { subscribeToSubscriptions, subscribeToCards } from "@/lib/firestore";
import { Subscription } from "@/types/subscription";
import { Card } from "@/types/card";
import { format, parseISO, isAfter, isBefore, addDays, isSameMonth, addWeeks, startOfDay } from "date-fns";
import { deleteSubscription } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2, ArrowRight } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { calculateNextBillingDate } from "@/lib/date-utils";

// Helper to get effective next billing date (auto-advances if past)
const getEffectiveNextBillingDate = (sub: Subscription) => {
    const nextDate = parseISO(sub.nextBillingDate);
    const today = startOfDay(new Date());

    // If the stored date is in the past (before today), calculate the next one
    if (isBefore(nextDate, today)) {
        return calculateNextBillingDate(sub.startDate, sub.billingPeriod);
    }
    return sub.nextBillingDate;
};

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [subs, setSubs] = useState<(Subscription & { effectiveNextBillingDate: string })[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | undefined>();
    const [dataLoading, setDataLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "price" | "date">("date");

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;
        const unsubSubs = subscribeToSubscriptions(user.uid, (fetchedSubs) => {
            // Calculate effective dates and sort
            const processedSubs = fetchedSubs.map(sub => ({
                ...sub,
                effectiveNextBillingDate: getEffectiveNextBillingDate(sub)
            })).sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });

            setSubs(processedSubs);
            setDataLoading(false);
        });
        const unsubCards = subscribeToCards(user.uid, setCards);

        return () => {
            unsubSubs();
            unsubCards();
        };
    }, [user]);

    const dueThisMonth = subs.reduce((acc, sub) => {
        const today = startOfDay(new Date());
        const nextBill = parseISO(sub.effectiveNextBillingDate);
        let subTotal = 0;

        // Check if the *effective* next billing date is in the current month AND in the future/today
        if (isSameMonth(nextBill, today) && !isBefore(nextBill, today)) {
            subTotal += sub.price;

            // For shorter periods, check if subsequent payments also fall in this month
            if (["daily", "weekly", "bi-weekly"].includes(sub.billingPeriod)) {
                let subsequentDate = nextBill;
                while (true) {
                    switch (sub.billingPeriod) {
                        case "daily": subsequentDate = addDays(subsequentDate, 1); break;
                        case "weekly": subsequentDate = addWeeks(subsequentDate, 1); break;
                        case "bi-weekly": subsequentDate = addWeeks(subsequentDate, 2); break;
                    }

                    if (isSameMonth(subsequentDate, today)) {
                        subTotal += sub.price;
                    } else {
                        break;
                    }
                }
            }
        }
        return acc + subTotal;
    }, 0);

    const upcomingPayments = subs
        .filter(sub => {
            const nextDate = parseISO(sub.effectiveNextBillingDate);
            const sevenDaysFromNow = addDays(new Date(), 7);
            const today = startOfDay(new Date());
            // Show payment if it's today or within 7 days
            return !isBefore(nextDate, today) && !isAfter(nextDate, sevenDaysFromNow);
        })
        .sort((a, b) => a.effectiveNextBillingDate.localeCompare(b.effectiveNextBillingDate));

    const filteredAndSortedSubs = subs
        .filter(sub =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "price") return b.price - a.price;
            return a.effectiveNextBillingDate.localeCompare(b.effectiveNextBillingDate);
        });

    const handleEdit = (sub: Subscription) => {
        setEditingSub(sub);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingSub(undefined);
        setIsModalOpen(true);
    };

    const handleDeleteSub = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteSubscription(id);
            } catch (err) {
                console.error("Failed to delete subscription", err);
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-950 font-sans">
            <Sidebar />
            <main className="ml-64 flex-1 p-10">
                <div className="max-w-6xl mx-auto">
                    <header className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
                            <p className="text-slate-400 font-medium">Welcome back! Here&apos;s your subscription overview.</p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Subscription
                        </button>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-slate-400 font-semibold tracking-tight uppercase text-xs">Due This Month</h3>
                            </div>
                            <p className="text-3xl font-bold text-slate-100">${dueThisMonth.toFixed(2)}</p>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl">
                                    <Calendar className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h3 className="text-slate-400 font-semibold tracking-tight uppercase text-xs">Total Subscriptions</h3>
                            </div>
                            <p className="text-3xl font-bold text-slate-100">{subs.length}</p>
                        </div>

                        <Link href="/cards" className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl hover:bg-slate-800/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-all">
                                        <CardIcon className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <h3 className="text-slate-400 font-semibold tracking-tight uppercase text-xs">Active Cards</h3>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-all" />
                            </div>
                            <p className="text-3xl font-bold text-slate-100">{cards.length}</p>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Subscription Table */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    All Subscriptions
                                    <span className="text-xs font-normal text-slate-500 px-2 py-1 bg-slate-900 border border-slate-800 rounded-full">
                                        {filteredAndSortedSubs.length} Total
                                    </span>
                                </h2>
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1 sm:w-48 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                    />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as "name" | "price" | "date")}
                                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="date">Next Bill</option>
                                        <option value="name">Name</option>
                                        <option value="price">Price</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-800/50 border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Service</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Period</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Bill</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {filteredAndSortedSubs.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-slate-800/20 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-slate-100">{sub.name}</span>
                                                                {sub.category && (
                                                                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-500 border border-slate-700 rounded-md font-bold uppercase tracking-widest">
                                                                        {sub.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {sub.manageUrl && (
                                                                <a
                                                                    href={sub.manageUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 font-medium transition-colors"
                                                                >
                                                                    Manage Service <ExternalLink className="w-2.5 h-2.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="px-2 py-1 text-[10px] font-bold bg-slate-800 text-slate-400 rounded-md uppercase tracking-wider border border-slate-700/50">
                                                            {sub.billingPeriod}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-100 font-bold">${sub.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-medium text-slate-300">
                                                                {format(parseISO(sub.effectiveNextBillingDate), "MMM d, yyyy")}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">
                                                                in {Math.ceil((parseISO(sub.effectiveNextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEdit(sub)}
                                                                className="p-2 hover:bg-indigo-500/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                                                                title="Edit Subscription"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSub(sub.id!, sub.name)}
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                                title="Delete Subscription"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {subs.length === 0 && !dataLoading && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="p-4 bg-slate-800/50 rounded-full">
                                                                <Plus className="w-8 h-8 text-slate-500" />
                                                            </div>
                                                            <p className="text-slate-500 font-medium">No subscriptions yet.</p>
                                                            <button
                                                                onClick={handleAdd}
                                                                className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
                                                            >
                                                                Add your first subscription
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Payments Sidebar */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-100">Upcoming Payments</h2>
                            <div className="space-y-4">
                                {upcomingPayments.map((sub) => (
                                    <div key={sub.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-l-indigo-500 hover:translate-x-1 transition-transform cursor-default">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-100">{sub.name}</h4>
                                            <span className="text-indigo-400 font-bold">${sub.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium font-mono uppercase tracking-tight">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Due {format(parseISO(sub.effectiveNextBillingDate), "EEEE, MMM d")}
                                        </div>
                                    </div>
                                ))}
                                {upcomingPayments.length === 0 && (
                                    <div className="bg-slate-900/30 border border-slate-800 border-dashed p-10 rounded-2xl text-center">
                                        <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                        <p className="text-slate-600 text-sm font-medium">No payments due in the next 7 days.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSub ? "Edit Subscription" : "Add New Subscription"}
            >
                <SubscriptionForm
                    initialData={editingSub}
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
