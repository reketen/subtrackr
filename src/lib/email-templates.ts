import { format } from "date-fns";

export interface SubscriptionNotificationItem {
    name: string;
    price: number;
    category?: string;
    manageUrl?: string;
}

export interface PlannedMonthlyPaymentItem extends SubscriptionNotificationItem {
    billingPeriod: string;
    date: Date;
}

export function generateReminderEmail({
    displayName,
    daysAdvance,
    targetDate,
    subscriptions,
    appUrl,
}: {
    displayName: string;
    daysAdvance: 1 | 7;
    targetDate: Date;
    subscriptions: SubscriptionNotificationItem[];
    appUrl: string;
}) {
    const isTomorrow = daysAdvance === 1;
    const formattedDate = format(targetDate, "EEEE, MMMM d, yyyy");
    const totalAmount = subscriptions.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

    const subject = isTomorrow
        ? `Payment Reminder: ${subscriptions.length} subscription${subscriptions.length > 1 ? "s" : ""} due tomorrow ($${totalAmount.toFixed(2)})`
        : `Payment Reminder: ${subscriptions.length} subscription${subscriptions.length > 1 ? "s" : ""} due in 7 days ($${totalAmount.toFixed(2)})`;

    const title = isTomorrow ? "Upcoming Payments for Tomorrow" : "Upcoming Payments in 7 Days";
    const badgeText = isTomorrow ? "Due Tomorrow" : "Due in 7 Days";
    const badgeBg = isTomorrow ? "#f59e0b" : "#6366f1";
    const leadText = isTomorrow
        ? `The following subscriptions are scheduled for renewal tomorrow, <strong>${formattedDate}</strong>:`
        : `Giving you an early heads-up: The following subscriptions are scheduled for renewal in 7 days on <strong>${formattedDate}</strong>:`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1f2937;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; vertical-align: middle;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 36px; height: 36px; background-color: #4f46e5; border-radius: 10px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 800; font-size: 18px;">S</td>
                          <td style="padding-left: 12px; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">SubTrackr</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 20px; background-color: ${badgeBg}; color: #ffffff;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px;">
                ${title}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Hello ${displayName || "there"},<br>
                ${leadText}
              </p>

              <!-- Subscriptions List -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border-collapse: separate; border-spacing: 0 8px;">
                ${subscriptions.map(sub => `
                  <tr>
                    <td style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px 18px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <div style="font-weight: 600; font-size: 15px; color: #f8fafc;">${sub.name}</div>
                            ${sub.category ? `<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px;">${sub.category}</div>` : ""}
                          </td>
                          <td align="right" style="vertical-align: middle;">
                            <span style="font-size: 16px; font-weight: 700; color: #38bdf8;">$${(Number(sub.price) || 0).toFixed(2)}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                `).join("")}
              </table>

              <!-- Total Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
                <tr>
                  <td style="font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                    Total Due
                  </td>
                  <td align="right" style="font-size: 20px; font-weight: 800; color: #10b981;">
                    $${totalAmount.toFixed(2)}
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                      Manage Subscriptions &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d131f; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                You are receiving this notification because you have email reminders enabled in SubTrackr.
              </p>
              <p style="margin: 0; font-size: 12px; color: #475569;">
                SubTrackr &bull; Smart Subscription Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return { subject, html };
}

export function generateMonthlyReportEmail({
    displayName,
    targetMonth,
    payments,
    totalActiveSubscriptions,
    appUrl,
}: {
    displayName: string;
    targetMonth: Date;
    payments: PlannedMonthlyPaymentItem[];
    totalActiveSubscriptions: number;
    appUrl: string;
}) {
    const monthName = format(targetMonth, "MMMM yyyy");
    const totalDue = payments.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

    const subject = payments.length > 0
        ? `Monthly Report: Planned Subscriptions for ${monthName} ($${totalDue.toFixed(2)})`
        : `Monthly Report: Planned Subscriptions for ${monthName}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Subscription Report - ${monthName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #1f2937;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; vertical-align: middle;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 36px; height: 36px; background-color: #4f46e5; border-radius: 10px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: 800; font-size: 18px;">S</td>
                          <td style="padding-left: 12px; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">SubTrackr</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 20px; background-color: #10b981; color: #ffffff;">
                      Monthly Forecast
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px;">
                ${monthName} Subscription Report
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Hello ${displayName || "there"},<br>
                Here is your complete subscription forecast and all planned payments for the month of <strong>${monthName}</strong>:
              </p>

              <!-- Stats Highlights -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td width="48%" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 6px;">Total Due This Month</div>
                    <div style="font-size: 24px; font-weight: 800; color: #10b981;">$${totalDue.toFixed(2)}</div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 6px;">Planned Payments</div>
                    <div style="font-size: 24px; font-weight: 800; color: #f8fafc;">${payments.length}</div>
                  </td>
                </tr>
              </table>

              <!-- Scheduled Payments Schedule -->
              <h2 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: #cbd5e1;">
                Planned Payment Schedule (${payments.length})
              </h2>

              ${payments.length > 0 ? `
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px; border-collapse: separate; border-spacing: 0 8px;">
                  ${payments.map(p => `
                    <tr>
                      <td style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px 18px;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td width="32%" style="vertical-align: middle;">
                              <div style="font-size: 13px; font-weight: 700; color: #818cf8;">
                                ${format(p.date, "MMM d, yyyy")}
                              </div>
                              <div style="font-size: 11px; color: #64748b;">${format(p.date, "EEEE")}</div>
                            </td>
                            <td style="vertical-align: middle; padding-left: 8px;">
                              <div style="font-weight: 600; font-size: 14px; color: #f8fafc;">${p.name}</div>
                              <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
                                ${p.category || "General"} &bull; ${p.billingPeriod}
                              </div>
                            </td>
                            <td align="right" style="vertical-align: middle;">
                              <span style="font-size: 15px; font-weight: 700; color: #38bdf8;">$${(Number(p.price) || 0).toFixed(2)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  `).join("")}
                </table>
              ` : `
                <div style="background-color: #0f172a; border: 1px dashed #334155; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
                  <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                    You have no subscription payments due in ${monthName}.
                  </p>
                </div>
              `}

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                      Open SubTrackr Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d131f; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                You have ${totalActiveSubscriptions} active subscription${totalActiveSubscriptions === 1 ? "" : "s"} tracked in SubTrackr.
              </p>
              <p style="margin: 0; font-size: 12px; color: #475569;">
                SubTrackr &bull; Smart Subscription Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return { subject, html };
}
