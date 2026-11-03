import {
    addDays,
    addWeeks,
    addMonths,
    addYears,
    isBefore,
    isAfter,
    startOfDay,
    startOfMonth,
    endOfMonth,
    parseISO,
    formatISO
} from "date-fns";
import { BillingPeriodType } from "../types/subscription";

export const calculateNextBillingDate = (
    startDate: string,
    period: BillingPeriodType,
    referenceDate: Date = new Date()
): string => {
    const start = parseISO(startDate);
    let nextDate = start;

    while (isBefore(nextDate, referenceDate)) {
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

/**
 * Returns all planned payment dates for a subscription within the month of targetDate.
 */
export const getPlannedPaymentsForMonth = (
    startDate: string,
    period: BillingPeriodType,
    targetDate: Date = new Date()
): Date[] => {
    const start = startOfDay(parseISO(startDate));
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // If subscription starts after this month ends, no payments this month
    if (isAfter(start, monthEnd)) {
        return [];
    }

    const advance = (d: Date): Date => {
        switch (period) {
            case "daily":
                return addDays(d, 1);
            case "weekly":
                return addWeeks(d, 1);
            case "bi-weekly":
                return addWeeks(d, 2);
            case "monthly":
                return addMonths(d, 1);
            case "quarterly":
                return addMonths(d, 3);
            case "yearly":
                return addYears(d, 1);
            default:
                return addMonths(d, 1);
        }
    };

    let curr = start;
    if (period === "daily" && isBefore(start, monthStart)) {
        curr = monthStart;
    } else {
        while (isBefore(curr, monthStart)) {
            curr = advance(curr);
        }
    }

    const payments: Date[] = [];
    while (!isAfter(curr, monthEnd)) {
        payments.push(curr);
        curr = advance(curr);
    }

    return payments;
};
