"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                                <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6">{children}</div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
