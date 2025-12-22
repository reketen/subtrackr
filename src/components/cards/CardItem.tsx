"use client";

import { CreditCard, Trash2, Edit2 } from "lucide-react";
import { Card } from "../../types/card";
import { deleteCard } from "../../lib/firestore";
import { useState } from "react";

interface CardItemProps {
    card: Card;
    onEdit: (card: Card) => void;
}

export default function CardItem({ card, onEdit }: CardItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${card.cardName}"?`)) {
            setIsDeleting(true);
            try {
                await deleteCard(card.id!);
            } catch (err) {
                console.error("Failed to delete card", err);
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="relative group bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-xl hover:shadow-indigo-500/10 transition-all">
            <div className="flex justify-between items-start mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <CreditCard className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(card)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-slate-100">{card.cardName}</h4>
                    <p className="text-sm text-slate-400">{card.bank}</p>
                </div>

                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                            Card Number
                        </p>
                        <p className="text-slate-300 font-mono tracking-widest">
                            •••• •••• •••• {card.last4}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Expires</p>
                        <p className="text-slate-300 font-mono italic">{card.expirationDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
