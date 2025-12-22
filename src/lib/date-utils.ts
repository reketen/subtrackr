import {
    addDays,
    addWeeks,
    addMonths,
    addYears,
    isBefore,
    parseISO,
    formatISO
} from "date-fns";
import { BillingPeriodType } from "../types/subscription";

export const calculateNextBillingDate = (
    startDate: string,
    period: BillingPeriodType
): string => {
    const start = parseISO(startDate);
    const now = new Date();
    let nextDate = start;

    while (isBefore(nextDate, now)) {
        switch (period) {
            case "daily":
                nextDate = addDays(nextDate, 1);
                break;
            case "weekly":
                nextDate = addWeeks(nextDate, 1);
                break;
            case "bi-weekly":
                nextDate = addWeeks(nextDate, 2);
                break;
            case "monthly":
                nextDate = addMonths(nextDate, 1);
                break;
            case "quarterly":
                nextDate = addMonths(nextDate, 3);
                break;
            case "yearly":
                nextDate = addYears(nextDate, 1);
                break;
        }
    }

    return formatISO(nextDate);
};
