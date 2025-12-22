"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardSchema, Card } from "../../types/card";
import { addCard, updateCard } from "../../lib/firestore";

interface CardFormProps {
    initialData?: Card;
    onSuccess: () => void;
    onCancel: () => void;
}

import { useAuth } from "../../contexts/AuthContext";

export default function CardForm({ initialData, onSuccess, onCancel }: CardFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Card>({
        resolver: zodResolver(CardSchema),
        defaultValues: initialData || {
            cardName: "",
            bank: "",
            last4: "",
            expirationDate: "",
        },
    });

    const onSubmit = async (data: Card) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            if (initialData?.id) {
                await updateCard(initialData.id, data);
            } else {
                await addCard(data, user.uid);
            }
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong saving the card.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                    Card Nickname (e.g., Main Visa)
                </label>
                <input
                    {...register("cardName")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Personal Visa"
                />
                {errors.cardName && (
                    <p className="mt-1 text-xs text-red-500">{errors.cardName.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Bank Name</label>
                <input
                    {...register("bank")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Chase"
                />
                {errors.bank && <p className="mt-1 text-xs text-red-500">{errors.bank.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Last 4 Digits</label>
                    <input
                        {...register("last4")}
                        maxLength={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="1234"
                    />
                    {errors.last4 && <p className="mt-1 text-xs text-red-500">{errors.last4.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Expiry (MM/YY)</label>
                    <input
                        {...register("expirationDate")}
                        maxLength={5}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="12/28"
                    />
                    {errors.expirationDate && (
                        <p className="mt-1 text-xs text-red-500">{errors.expirationDate.message}</p>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                >
                    {loading ? "Saving..." : initialData ? "Update Card" : "Add Card"}
                </button>
            </div>
        </form>
    );
}
