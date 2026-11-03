import { addDays, startOfDay, parseISO, isSameDay } from "date-fns";
import { calculateNextBillingDate, getPlannedPaymentsForMonth } from "../src/lib/date-utils.js";
import { generateReminderEmail, generateMonthlyReportEmail } from "../src/lib/email-templates.js";

console.log("=== RUNNING NOTIFICATION SYSTEM TESTS ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

// 1. Test 7-Day & 1-Day Advance Notice Calculation
const simToday = new Date(2026, 10, 3, 10, 0, 0); // Nov 3, 2026
const today = startOfDay(simToday);
const tomorrow = addDays(today, 1); // Nov 4, 2026
const in7Days = addDays(today, 7);  // Nov 10, 2026

// Subscription A: Due tomorrow (Nov 4)
const subA_next = calculateNextBillingDate("2026-05-04", "monthly", simToday);
assert(isSameDay(parseISO(subA_next), tomorrow), "Sub A correctly identified as due tomorrow (1-day advance)");
assert(!isSameDay(parseISO(subA_next), in7Days), "Sub A is NOT identified as due in 7 days");

// Subscription B: Due in 7 days (Nov 10)
const subB_next = calculateNextBillingDate("2026-05-10", "monthly", simToday);
assert(isSameDay(parseISO(subB_next), in7Days), "Sub B correctly identified as due in 7 days (7-day advance)");
assert(!isSameDay(parseISO(subB_next), tomorrow), "Sub B is NOT identified as due tomorrow");

// Subscription C: Weekly due in 7 days (Nov 10)
const subC_next = calculateNextBillingDate("2026-10-27", "weekly", simToday);
assert(isSameDay(parseISO(subC_next), in7Days), "Weekly Sub C correctly identified as due in 7 days");

// Subscription D: Yearly due in 7 days (Nov 10)
const subD_next = calculateNextBillingDate("2024-11-10", "yearly", simToday);
assert(isSameDay(parseISO(subD_next), in7Days), "Yearly Sub D correctly identified as due in 7 days");

// 2. Test Planned Payments for Monthly Report (Nov 2026)
const nov1 = new Date(2026, 10, 1);

// Test monthly recurrence
const monthlyDates = getPlannedPaymentsForMonth("2025-05-15", "monthly", nov1);
assert(monthlyDates.length === 1, "Monthly sub has 1 payment in Nov");
assert(monthlyDates[0].getDate() === 15, "Monthly sub payment date is the 15th");

// Test weekly recurrence
const weeklyDates = getPlannedPaymentsForMonth("2026-10-15", "weekly", nov1);
assert(weeklyDates.length === 4, "Weekly sub has 4 payments in Nov 2026");

// Test bi-weekly recurrence
const biweeklyDates = getPlannedPaymentsForMonth("2026-10-20", "bi-weekly", nov1);
assert(biweeklyDates.length === 2, "Bi-weekly sub has 2 payments in Nov 2026");

// Test yearly recurrence matching month
const yearlyMatching = getPlannedPaymentsForMonth("2024-11-20", "yearly", nov1);
assert(yearlyMatching.length === 1, "Yearly sub matching Nov has 1 payment");

// Test yearly recurrence not matching month
const yearlyNonMatching = getPlannedPaymentsForMonth("2024-03-20", "yearly", nov1);
assert(yearlyNonMatching.length === 0, "Yearly sub not matching Nov has 0 payments");

// Test future sub starting next month
const futureSub = getPlannedPaymentsForMonth("2026-12-01", "monthly", nov1);
assert(futureSub.length === 0, "Sub starting next month has 0 payments this month");

// 3. Test Email Template Generation
const reminder1Day = generateReminderEmail({
    displayName: "Alex",
    daysAdvance: 1,
    targetDate: tomorrow,
    subscriptions: [{ name: "Netflix", price: 15.49, category: "Entertainment" }],
    appUrl: "https://subtrackr-ten.vercel.app",
});
assert(reminder1Day.subject.includes("due tomorrow"), "1-day reminder subject contains 'due tomorrow'");
assert(reminder1Day.subject.includes("$15.49"), "1-day reminder subject includes formatted price");
assert(reminder1Day.html.includes("Netflix"), "1-day reminder html includes subscription name");
assert(reminder1Day.html.includes("https://subtrackr-ten.vercel.app"), "1-day reminder html includes app link");

const reminder7Days = generateReminderEmail({
    displayName: "Alex",
    daysAdvance: 7,
    targetDate: in7Days,
    subscriptions: [{ name: "AWS Cloud", price: 45.00, category: "Software" }],
    appUrl: "https://subtrackr-ten.vercel.app",
});
assert(reminder7Days.subject.includes("due in 7 days"), "7-day reminder subject contains 'due in 7 days'");
assert(reminder7Days.html.includes("Upcoming Payments in 7 Days"), "7-day reminder html includes proper heading");
assert(reminder7Days.html.includes("AWS Cloud"), "7-day reminder html includes subscription name");

const monthlyReport = generateMonthlyReportEmail({
    displayName: "Alex",
    targetMonth: nov1,
    payments: [
        { name: "Gym", price: 10, category: "Health", billingPeriod: "weekly", date: new Date(2026, 10, 5) },
        { name: "Netflix", price: 15.49, category: "Entertainment", billingPeriod: "monthly", date: new Date(2026, 10, 15) },
    ],
    totalActiveSubscriptions: 2,
    appUrl: "https://subtrackr-ten.vercel.app",
});
assert(monthlyReport.subject.includes("Monthly Report: Planned Subscriptions for November 2026"), "Monthly report subject is formatted correctly");
assert(monthlyReport.subject.includes("$25.49"), "Monthly report total includes sum of planned payments");
assert(monthlyReport.html.includes("November 2026 Subscription Report"), "Monthly report html includes title");
assert(monthlyReport.html.includes("Gym"), "Monthly report html includes Gym payment");
assert(monthlyReport.html.includes("Netflix"), "Monthly report html includes Netflix payment");

console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
