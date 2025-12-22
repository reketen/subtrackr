"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubscriptionSchema, Subscription, BillingPeriod, SubscriptionCategory } from "../../types/subscription";
import { Card } from "../../types/card";
import { addSubscription, updateSubscription, subscribeToCards } from "../../lib/firestore";
import { calculateNextBillingDate } from "../../lib/date-utils";

interface SubscriptionFormProps {
    initialData?: Subscription;
    onSuccess: () => void;
    onCancel: () => void;
}

import { useAuth } from "../../contexts/AuthContext";

export default function SubscriptionForm({
    initialData,
    onSuccess,
    onCancel,
}: SubscriptionFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cards, setCards] = useState<Card[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<Subscription>({
        resolver: zodResolver(SubscriptionSchema),
        defaultValues: initialData || {
            name: "",
            startDate: new Date().toISOString().split("T")[0],
            billingPeriod: "monthly",
            price: 0,
            cardId: "",
            manageUrl: "",
            category: "Other",
        },
    });

    const billingPeriod = watch("billingPeriod");
    const startDate = watch("startDate");

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToCards(user.uid, setCards);
        return () => unsubscribe();
    }, [user]);

    // Auto-calculate next billing date when start date or period changes
    useEffect(() => {
        if (startDate && billingPeriod) {
            const nextDate = calculateNextBillingDate(startDate, billingPeriod);
            setValue("nextBillingDate", nextDate);
        }
    }, [startDate, billingPeriod, setValue]);

    const onSubmit = async (data: Subscription) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            if (initialData?.id) {
                await updateSubscription(initialData.id, data);
            } else {
                await addSubscription(data, user.uid);
            }
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong saving the subscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {error && (
                <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Service Name</label>
                <input
                    {...register("name")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Netflix, Spotify, GitHub, etc."
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select
                    {...register("category")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                    {SubscriptionCategory.options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                    <input
                        {...register("startDate")}
                        type="date"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    {errors.startDate && (
                        <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-2 text-slate-400">$</span>
                        <input
                            {...register("price", { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="9.99"
                        />
                    </div>
                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Billing Period</label>
                <select
                    {...register("billingPeriod")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                >
                    {BillingPeriod.options.map((option) => (
                        <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1).replace("-", " ")}
                        </option>
                    ))}
                </select>
                {errors.billingPeriod && (
                    <p className="mt-1 text-xs text-red-500">{errors.billingPeriod.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Payment Card</label>
                {cards.length === 0 ? (
                    <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        No cards found. Please add a payment card first in the Cards section.
                    </p>
                ) : (
                    <select
                        {...register("cardId")}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                        <option value="">Select a card</option>
                        {cards.map((card) => (
                            <option key={card.id} value={card.id}>
                                {card.cardName} ({card.bank} •••• {card.last4})
                            </option>
                        ))}
                    </select>
                )}
                {errors.cardId && <p className="mt-1 text-xs text-red-500">{errors.cardId.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Manage Subscription (Link)</label>
                <input
                    {...register("manageUrl")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="https://netflix.com/account"
                />
                {errors.manageUrl && <p className="mt-1 text-xs text-red-500">{errors.manageUrl.message}</p>}
            </div>

            <div className="flex gap-3 pt-6 sticky bottom-0 bg-slate-900 pb-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || (cards.length === 0 && !initialData)}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                    {loading ? "Saving..." : initialData ? "Update" : "Add Subscription"}
                </button>
            </div>
        </form>
    );
}
