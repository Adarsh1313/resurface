import prisma from '../lib/prisma';
import { sendEmail } from '../lib/email';

function buildReminderHtml(params: {
  userName: string;
  title: string;
  author: string | null;
  platform: string;
  url: string;
}): string {
  const { userName, title, author, platform, url } = params;
  const platformLabel = platform === 'x' ? 'X (Twitter)' : platform === 'youtube' ? 'YouTube' : platform;
  const safeTitle = title || url;

  // Brand palette mirrors the Resurface Design tokens used in the dashboard.
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#0f0f0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;color:#f0ede8;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0f0f0e;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#161614;border:1px solid rgba(255,255,255,0.10);border-radius:12px;overflow:hidden;">
          <tr><td style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="font-size:13px;font-weight:500;color:#f0ede8;letter-spacing:-0.01em;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2dd4bf;margin-right:8px;vertical-align:middle;"></span>
                  Reminder from Resurface
                </td>
                <td align="right" style="font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#5e5b57;">
                  Resurface
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:24px;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#9b9690;">Hey ${userName},</p>
            <p style="margin:0 0 20px 0;font-size:14px;color:#9b9690;line-height:1.5;">
              You asked me to ping you about this — here it is.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#1e1e1b;border:1px solid rgba(255,255,255,0.06);border-radius:10px;">
              <tr><td style="padding:16px 18px;">
                <div style="font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#5e5b57;margin-bottom:8px;">
                  ${platformLabel}
                </div>
                <div style="font-size:15px;font-weight:500;color:#f0ede8;line-height:1.4;margin-bottom:6px;">
                  ${safeTitle}
                </div>
                ${author ? `<div style="font-size:12px;color:#9b9690;">by ${author}</div>` : ''}
              </td></tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
              <tr><td style="border-radius:8px;background:#2dd4bf;">
                <a href="${url}" style="display:inline-block;padding:10px 18px;font-size:13px;font-weight:500;color:#042f2e;text-decoration:none;letter-spacing:-0.01em;">
                  Open the save →
                </a>
              </td></tr>
            </table>
            <p style="margin:24px 0 0 0;font-size:12px;color:#5e5b57;line-height:1.5;">
              Done with it? Mark it reviewed in the dashboard and it'll stop nagging you.
            </p>
          </td></tr>
          <tr><td style="padding:14px 24px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#5e5b57;">
            You're receiving this because you set a reminder on Resurface.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`.trim();
}

/**
 * Find all bookmarks whose reminder is due, email the user, mark sent.
 * Idempotent — only processes reminder_sent=false rows and flips the flag.
 */
export async function processDueReminders(): Promise<{ sent: number; errors: number }> {
  const now = new Date();
  let sent = 0;
  let errors = 0;

  const due = await prisma.bookmark.findMany({
    where: {
      reminder_at: { lte: now, not: null },
      reminder_sent: false,
      deleted_at: null,
    },
    include: { user: true },
    take: 100,
  });

  for (const b of due as any[]) {
    try {
      const html = buildReminderHtml({
        userName: b.user.name || b.user.email.split('@')[0],
        title: b.title || b.url,
        author: b.author,
        platform: b.platform,
        url: b.url,
      });
      await sendEmail({
        to: b.user.email,
        subject: `Reminder: ${(b.title || b.url).slice(0, 70)}`,
        html,
      });
      await prisma.bookmark.update({
        where: { id: b.id },
        data: { reminder_sent: true },
      });
      sent++;
    } catch (err) {
      errors++;
      console.error(`[reminders] failed for bookmark ${b.id}:`, err);
    }
  }

  if (sent > 0 || errors > 0) {
    console.log(`[reminders] processed: sent=${sent} errors=${errors}`);
  }
  return { sent, errors };
}
