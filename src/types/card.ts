import { z } from "zod";

export const CardSchema = z.object({
    id: z.string().optional(),
    cardName: z.string().min(1, "Card name is required"),
    bank: z.string().min(1, "Bank name is required"),
    last4: z.string().length(4, "Must be exactly 4 digits").regex(/^\d+$/, "Must be numeric"),
    expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Must be MM/YY format"),
    createdAt: z.any().optional(),
    userId: z.string().optional(),
});

export type Card = z.infer<typeof CardSchema>;
