/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Resend } from "resend";
import { addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { calculateNextBillingDate, getPlannedPaymentsForMonth } from "@/lib/date-utils";
import { generateReminderEmail, generateMonthlyReportEmail } from "@/lib/email-templates";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "SubTrackr <onboarding@resend.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://subtrackr-ten.vercel.app";

// Force dynamic to ensure it runs every time (not cached)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get("authorization");
    const secretParam = searchParams.get("secret");

    // 1. Verify Cron Secret
    const isAuthorized =
        (process.env.CRON_SECRET &&
            (authHeader === `Bearer ${process.env.CRON_SECRET}` || secretParam === process.env.CRON_SECRET)) ||
        (!process.env.CRON_SECRET && process.env.NODE_ENV !== "production");

    if (!isAuthorized) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const testDate = searchParams.get("testDate");
        const now = testDate ? parseISO(testDate) : new Date();
        const today = startOfDay(now);
        const tomorrow = addDays(today, 1);
        const in7Days = addDays(today, 7);
        const isFirstDayOfMonth = today.getDate() === 1 || searchParams.get("forceMonthly") === "true";

        const usersSnapshot = await adminDb.collection("users").get();
        const results = [];
        const errors = [];

        // 2. Iterate through all users
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();

            // Skip if notifications are disabled or no email
            if (userData.notificationsEnabled === false || !userData.email) {
                continue;
            }

            const userId = userDoc.id;
            const subsSnapshot = await adminDb
                .collection("subscriptions")
                .where("userId", "==", userId)
                .get();

            const subs = subsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as any[];

            const userResult: {
                email: string;
                reminders1Day?: number;
                reminders7Days?: number;
                monthlyReport?: number;
            } = { email: userData.email };

            // 3. Check for subscriptions due tomorrow (1 day in advance)
            const dueTomorrow = subs.filter(sub => {
                const effectiveDate = calculateNextBillingDate(sub.startDate, sub.billingPeriod, now);
                return isSameDay(parseISO(effectiveDate), tomorrow);
            });

            if (dueTomorrow.length > 0) {
                const { subject, html } = generateReminderEmail({
                    displayName: userData.displayName || "there",
                    daysAdvance: 1,
                    targetDate: tomorrow,
                    subscriptions: dueTomorrow,
                    appUrl,
                });

                const { error } = await resend.emails.send({
                    from: fromEmail,
                    to: [userData.email],
                    subject,
                    html,
                });

                if (error) {
                    console.error("Failed to send 1-day reminder to", userData.email, error);
                    errors.push({ email: userData.email, type: "1-day", error });
                } else {
                    userResult.reminders1Day = dueTomorrow.length;
                }
            }

            // 4. Check for subscriptions due in 7 days (7 days in advance)
            const dueIn7Days = subs.filter(sub => {
                const effectiveDate = calculateNextBillingDate(sub.startDate, sub.billingPeriod, now);
                return isSameDay(parseISO(effectiveDate), in7Days);
            });

            if (dueIn7Days.length > 0) {
                const { subject, html } = generateReminderEmail({
                    displayName: userData.displayName || "there",
                    daysAdvance: 7,
                    targetDate: in7Days,
                    subscriptions: dueIn7Days,
                    appUrl,
                });

                const { error } = await resend.emails.send({
                    from: fromEmail,
                    to: [userData.email],
                    subject,
                    html,
                });

                if (error) {
                    console.error("Failed to send 7-day reminder to", userData.email, error);
                    errors.push({ email: userData.email, type: "7-day", error });
                } else {
                    userResult.reminders7Days = dueIn7Days.length;
                }
            }

            // 5. Monthly Report (Sent on the 1st day of every month or via forceMonthly)
            if (isFirstDayOfMonth && subs.length > 0) {
                const monthlyPayments = subs.flatMap(sub => {
                    const dates = getPlannedPaymentsForMonth(sub.startDate, sub.billingPeriod, today);
                    return dates.map(date => ({
                        name: sub.name,
                        price: Number(sub.price) || 0,
                        category: sub.category,
                        billingPeriod: sub.billingPeriod,
                        manageUrl: sub.manageUrl,
                        date,
                    }));
                }).sort((a, b) => a.date.getTime() - b.date.getTime());

                const { subject, html } = generateMonthlyReportEmail({
                    displayName: userData.displayName || "there",
                    targetMonth: today,
                    payments: monthlyPayments,
                    totalActiveSubscriptions: subs.length,
                    appUrl,
                });

                const { error } = await resend.emails.send({
                    from: fromEmail,
                    to: [userData.email],
                    subject,
                    html,
                });

                if (error) {
                    console.error("Failed to send monthly report to", userData.email, error);
                    errors.push({ email: userData.email, type: "monthly", error });
                } else {
                    userResult.monthlyReport = monthlyPayments.length;
                }
            }

            if (userResult.reminders1Day || userResult.reminders7Days || userResult.monthlyReport !== undefined) {
                results.push(userResult);
            }
        }

        return NextResponse.json({
            success: true,
            date: today.toISOString(),
            isFirstDayOfMonth,
            sent: results,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: unknown) {
        console.error("Cron job error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
