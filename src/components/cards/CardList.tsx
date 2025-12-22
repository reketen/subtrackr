"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../types/card";
import { subscribeToCards } from "../../lib/firestore";
import CardItem from "./CardItem";
import CardForm from "./CardForm";
import Modal from "../Modal";

import { useAuth } from "../../contexts/AuthContext";

export default function CardList() {
    const { user } = useAuth();
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | undefined>();

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToCards(user.uid, (fetchedCards) => {
            const sortedCards = fetchedCards.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });
            setCards(sortedCards);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleEdit = (card: Card) => {
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCard(undefined);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-slate-900 rounded-2xl border border-slate-800" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Payment Cards</h2>
                    <p className="text-slate-400">Manage the cards used for your subscriptions</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Card
                </button>
            </div>

            {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                    <div className="p-4 bg-slate-800 rounded-full mb-4">
                        <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">No cards yet</h3>
                    <p className="text-slate-400 text-center max-w-sm mb-6">
                        Add your first payment card to start linking it to your subscriptions.
                    </p>
                    <button
                        onClick={handleAdd}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium transition-all"
                    >
                        Add Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <CardItem key={card.id} card={card} onEdit={handleEdit} />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCard ? "Edit Card" : "Add New Card"}
            >
                <CardForm
                    initialData={editingCard}
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
