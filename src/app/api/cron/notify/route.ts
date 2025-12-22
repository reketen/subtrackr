/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Resend } from "resend";
import { addDays, format, startOfDay, isSameDay, parseISO } from "date-fns";
import { calculateNextBillingDate } from "@/lib/date-utils";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Force dynamic to ensure it runs every time (not cached)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Verify Cron Secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const results = [];

        // 2. Iterate through all users
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();

            // Skip if notifications are disabled or no email
            if (userData.notificationsEnabled === false || !userData.email) {
                continue;
            }

            const userId = userDoc.id;
            const subsRef = collection(db, "subscriptions");
            const q = query(subsRef, where("userId", "==", userId));
            const subsSnapshot = await getDocs(q);

            const tomorrow = addDays(startOfDay(new Date()), 1);

            // 3. Check for subscriptions due tomorrow
            const dueSubscriptions = subsSnapshot.docs
                .map(doc => {
                    const data = doc.data() as any;
                    // Calculate dynamic next billing date
                    const effectiveDate = calculateNextBillingDate(data.startDate, data.billingPeriod);
                    return { ...data, effectiveDate };
                })
                .filter(sub => {
                    const nextDate = parseISO(sub.effectiveDate);
                    return isSameDay(nextDate, tomorrow);
                });

            if (dueSubscriptions.length > 0) {
                // 4. Send Email
                const emailContent = `
                    <h1>Upcoming Payments for Tomorrow</h1>
                    <p>Hello ${userData.displayName || 'there'},</p>
                    <p>You have the following subscriptions due tomorrow (${format(tomorrow, 'MMM d, yyyy')}):</p>
                    <ul>
                        ${dueSubscriptions.map((sub: any) => `
                            <li><strong>${sub.name}</strong>: $${sub.price}</li>
                        `).join('')}
                    </ul>
                    <p>Total: $${dueSubscriptions.reduce((acc: number, sub: any) => acc + sub.price, 0).toFixed(2)}</p>
                    <p><a href="https://subtrackr.app">Manage Subscriptions</a></p>
                `;

                const { error } = await resend.emails.send({
                    from: 'SubTrackr <onboarding@resend.dev>',
                    to: [userData.email],
                    subject: `Payment Reminder: ${dueSubscriptions.length} subscriptions due tomorrow`,
                    html: emailContent,
                });

                if (error) {
                    console.error("Failed to send email to", userData.email, error);
                } else {
                    results.push({ email: userData.email, count: dueSubscriptions.length });
                }
            }
        }

        return NextResponse.json({ success: true, sent: results });
    } catch (error: unknown) {
        console.error("Cron job error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
