import { z } from "zod";

export const BillingPeriod = z.enum([
    "daily",
    "weekly",
    "bi-weekly",
    "monthly",
    "quarterly",
    "yearly",
]);

export type BillingPeriodType = z.infer<typeof BillingPeriod>;

export const SubscriptionCategory = z.enum([
    "Entertainment",
    "Software",
    "Utilities",
    "Health",
    "Education",
    "Financial",
    "Other",
]);

export type SubscriptionCategoryType = z.infer<typeof SubscriptionCategory>;

export const SubscriptionSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    startDate: z.string(), // ISO string
    billingPeriod: BillingPeriod,
    nextBillingDate: z.string(), // ISO string
    price: z.number().min(0),
    cardId: z.string().min(1, "Payment card is required"),
    manageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
    category: SubscriptionCategory,
    createdAt: z.any().optional(),
    userId: z.string().optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
