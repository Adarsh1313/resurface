import { escapeHtml, escapeHtmlAttribute } from './html';
import { getPublicAppUrl, notificationSettingsUrl } from './urls';

/**
 * One shared, email-client-safe (table-based, inline-styled) Resurface shell
 * used by every outgoing email. All user-controlled content MUST go through
 * escapeHtml / escapeHtmlAttribute before reaching these helpers' raw-HTML slots.
 */

export const BRAND = {
  bg: '#0f0f0e',
  card: '#161614',
  cardInner: '#1e1e1b',
  text: '#f0ede8',
  muted: '#9b9690',
  faint: '#5e5b57',
  teal: '#2dd4bf',
  tealInk: '#042f2e',
  amber: '#fbbf24',
  border: 'rgba(255,255,255,0.10)',
  hairline: 'rgba(255,255,255,0.06)',
  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface ShellOptions {
  /** Hidden preview text shown by inbox clients. Plain text; escaped here. */
  preheader?: string;
  /** Small label in the header bar. Plain text; escaped here. */
  eyebrow?: string;
  /** Pre-rendered (already escaped) body HTML. */
  bodyHtml: string;
  /** Plain-text footer reason, escaped here. */
  footerNote?: string;
  /** Include the "manage notifications" link (default true). */
  manageLink?: boolean;
}

export function renderShell(opts: ShellOptions): string {
  const b = BRAND;
  const manage = opts.manageLink !== false;
  const footerNote = opts.footerNote ? escapeHtml(opts.footerNote) : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Resurface</title>
</head>
<body style="margin:0;padding:0;background:${b.bg};color:${b.text};font-family:${b.font};-webkit-text-size-adjust:100%;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${b.bg};font-size:1px;line-height:1px;">${escapeHtml(opts.preheader)}</div>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${b.bg}" style="background:${b.bg};">
<tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:100%;max-width:560px;">
    <tr><td style="padding:0 4px 18px 4px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:${b.font};font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${b.text};">
            <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${b.teal};margin-right:8px;vertical-align:middle;"></span><a href="${escapeHtmlAttribute(getPublicAppUrl())}" style="color:${b.text};text-decoration:none;vertical-align:middle;">Resurface</a>
          </td>
          ${opts.eyebrow ? `<td align="right" style="font-family:${b.font};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${b.amber};">${escapeHtml(opts.eyebrow)}</td>` : ''}
        </tr>
      </table>
    </td></tr>
    <tr><td bgcolor="${b.card}" style="background:${b.card};border:1px solid ${b.border};border-radius:12px;padding:28px 24px;">
${opts.bodyHtml}
    </td></tr>
    <tr><td style="padding:18px 4px 0 4px;font-family:${b.font};font-size:12px;line-height:1.6;color:${b.faint};">
      ${footerNote}${footerNote && manage ? '<br>' : ''}${manage ? `<a href="${escapeHtmlAttribute(notificationSettingsUrl())}" style="color:${b.muted};text-decoration:underline;">Manage email notifications</a>` : ''}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Building blocks ──────────────────────────────────────────────────────

export function heading(text: string): string {
  return `<h1 style="margin:0 0 12px 0;font-family:${BRAND.font};font-size:24px;line-height:1.2;font-weight:650;color:${BRAND.text};">${escapeHtml(text)}</h1>`;
}

export function paragraph(text: string, opts: { muted?: boolean } = {}): string {
  return `<p style="margin:0 0 16px 0;font-family:${BRAND.font};font-size:15px;line-height:1.6;color:${opts.muted === false ? BRAND.text : BRAND.muted};">${escapeHtml(text)}</p>`;
}

export function primaryButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px 0;"><tr><td bgcolor="${BRAND.teal}" style="background:${BRAND.teal};border-radius:8px;"><a href="${escapeHtmlAttribute(href)}" style="display:inline-block;padding:12px 18px;font-family:${BRAND.font};font-size:14px;font-weight:700;color:${BRAND.tealInk};text-decoration:none;">${escapeHtml(label)}</a></td></tr></table>`;
}

function smallButton(label: string, href: string, variant: 'primary' | 'ghost'): string {
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? BRAND.teal : 'transparent';
  const color = isPrimary ? BRAND.tealInk : BRAND.text;
  const border = isPrimary ? BRAND.teal : BRAND.border;
  return `<td style="padding:0 8px 8px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td ${isPrimary ? `bgcolor="${BRAND.teal}" ` : ''}style="background:${bg};border:1px solid ${border};border-radius:7px;"><a href="${escapeHtmlAttribute(href)}" style="display:inline-block;padding:8px 14px;font-family:${BRAND.font};font-size:13px;font-weight:600;color:${color};text-decoration:none;white-space:nowrap;">${escapeHtml(label)}</a></td></tr></table></td>`;
}

export function platformPill(platform: string): string {
  const isYouTube = platform === 'youtube';
  const isX = platform === 'x';
  const label = isYouTube ? 'YouTube' : isX ? 'X' : platform || 'Link';
  const bg = isYouTube ? '#ff4040' : isX ? '#000000' : BRAND.cardInner;
  const border = isX ? 'rgba(255,255,255,0.25)' : bg;
  return `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${bg};border:1px solid ${border};color:#ffffff;font-family:${BRAND.font};font-size:11px;font-weight:700;letter-spacing:0.02em;">${escapeHtml(label)}</span>`;
}

function topicChip(name: string): string {
  return `<span style="display:inline-block;margin:0 6px 4px 0;padding:2px 8px;border-radius:999px;background:rgba(251,191,36,0.10);border:1px solid rgba(251,191,36,0.30);color:${BRAND.amber};font-family:${BRAND.font};font-size:11px;font-weight:600;">${escapeHtml(name)}</span>`;
}

export interface EmailBookmark {
  id: string;
  url: string;
  platform: string;
  title: string | null;
  author: string | null;
  thumbnail_url?: string | null;
  topics?: { name: string }[];
}

export interface BookmarkLinks {
  open: string;
  review: string;
  snooze: string;
}

function isHttpUrl(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

export function bookmarkCard(b: EmailBookmark, links: BookmarkLinks): string {
  const title = b.title || b.url;
  const topics = (b.topics || []).slice(0, 4);
  const thumb = isHttpUrl(b.thumbnail_url)
    ? `<tr><td style="padding:0;"><a href="${escapeHtmlAttribute(links.open)}" style="text-decoration:none;"><img src="${escapeHtmlAttribute(b.thumbnail_url)}" width="510" alt="" style="display:block;width:100%;max-width:510px;height:auto;border:0;border-radius:10px 10px 0 0;"></a></td></tr>`
    : '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${BRAND.cardInner}" style="background:${BRAND.cardInner};border:1px solid ${BRAND.hairline};border-radius:10px;margin:0 0 14px 0;">
${thumb}
<tr><td style="padding:16px 18px 10px 18px;">
  <div style="margin:0 0 10px 0;">${platformPill(b.platform)}</div>
  <a href="${escapeHtmlAttribute(links.open)}" style="display:block;font-family:${BRAND.font};font-size:16px;font-weight:600;line-height:1.4;color:${BRAND.text};text-decoration:none;margin:0 0 4px 0;">${escapeHtml(title)}</a>
  ${b.author ? `<div style="font-family:${BRAND.font};font-size:13px;color:${BRAND.muted};margin:0 0 8px 0;">by ${escapeHtml(b.author)}</div>` : ''}
  ${topics.length ? `<div style="margin:6px 0 4px 0;">${topics.map((t) => topicChip(t.name)).join('')}</div>` : ''}
</td></tr>
<tr><td style="padding:4px 18px 10px 18px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    ${smallButton('Open', links.open, 'primary')}
    ${smallButton('Mark reviewed', links.review, 'ghost')}
    ${smallButton('Snooze 1 day', links.snooze, 'ghost')}
  </tr></table>
</td></tr>
</table>`;
}

function bookmarkText(b: EmailBookmark, links: BookmarkLinks, index?: number): string {
  const prefix = index !== undefined ? `${index + 1}. ` : '';
  const platform = b.platform === 'youtube' ? 'YouTube' : b.platform === 'x' ? 'X' : b.platform;
  return [
    `${prefix}${b.title || b.url} [${platform}]${b.author ? ` by ${b.author}` : ''}`,
    `   Open: ${links.open}`,
    `   Mark reviewed: ${links.review}`,
    `   Snooze 1 day: ${links.snooze}`,
  ].join('\n');
}

function textFooter(): string {
  return `\n--\nManage email notifications: ${notificationSettingsUrl()}`;
}

// ─── Emails ───────────────────────────────────────────────────────────────

export function buildDigestEmail(params: {
  userName: string;
  bookmarks: EmailBookmark[];
  linksFor: (b: EmailBookmark) => BookmarkLinks;
}): RenderedEmail {
  const { bookmarks } = params;
  const n = bookmarks.length;
  const plural = n === 1 ? 'save' : 'saves';
  const dashboardUrl = `${getPublicAppUrl()}/dashboard`;
  const cards = bookmarks.map((b) => bookmarkCard(b, params.linksFor(b))).join('\n');
  const bodyHtml = [
    heading(`Hey ${params.userName}, ${n} ${plural} worth a second look`),
    paragraph(
      'Here are the saves waiting for you. Open one, mark it reviewed, or snooze it for a day — each button works straight from this email.',
    ),
    cards,
    `<div style="padding-top:6px;">${primaryButton('Open your dashboard', dashboardUrl)}</div>`,
  ].join('\n');

  return {
    subject: `Your Resurface digest: ${n} ${plural} to revisit`,
    html: renderShell({
      preheader: bookmarks
        .map((b) => b.title || b.url)
        .slice(0, 3)
        .join(' · '),
      eyebrow: 'Digest',
      bodyHtml,
      footerNote: 'You are receiving this because digest emails are on for your Resurface account.',
    }),
    text: [
      `Hey ${params.userName}, ${n} ${plural} worth a second look:`,
      '',
      ...bookmarks.map((b, i) => bookmarkText(b, params.linksFor(b), i) + '\n'),
      `Open your dashboard: ${dashboardUrl}`,
      textFooter(),
    ].join('\n'),
  };
}

export function buildReminderEmail(params: {
  userName: string;
  bookmark: EmailBookmark;
  links: BookmarkLinks;
}): RenderedEmail {
  const { bookmark: b } = params;
  const title = b.title || b.url;
  const bodyHtml = [
    heading(`Hey ${params.userName}, time to revisit this`),
    paragraph('You asked Resurface to remind you about this save. Here it is.'),
    bookmarkCard(b, params.links),
    `<p style="margin:8px 0 0 0;font-family:${BRAND.font};font-size:13px;line-height:1.6;color:${BRAND.faint};">Done with it? Mark it reviewed and it will stop showing up in your digests.</p>`,
  ].join('\n');
  return {
    subject: `Reminder: ${title.slice(0, 70)}`,
    html: renderShell({
      preheader: title,
      eyebrow: 'Reminder',
      bodyHtml,
      footerNote: 'You are receiving this because you set a reminder on Resurface.',
    }),
    text: [
      `Hey ${params.userName}, you asked Resurface to remind you about this save:`,
      '',
      bookmarkText(b, params.links),
      textFooter(),
    ].join('\n'),
  };
}

export function buildWaitlistConfirmationEmail(email: string): RenderedEmail {
  const appUrl = getPublicAppUrl();
  const bodyHtml = [
    heading("You're on the Resurface waitlist."),
    paragraph(
      "Thanks for joining. We're building Resurface to help people actually revisit the X and YouTube saves they meant to come back to.",
    ),
    paragraph(
      "The private beta is rolling out manually so we can learn from early users closely. When your invite is ready, we'll send setup steps for the dashboard and Chrome extension.",
    ),
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 18px 0;"><tr><td style="padding:14px 16px;border-radius:8px;background:rgba(45,212,191,0.08);border:1px solid rgba(45,212,191,0.20);font-family:${BRAND.font};font-size:14px;line-height:1.55;color:#d7fffa;">You joined with <strong>${escapeHtml(email)}</strong>. Keep an eye on this inbox for the private beta invite.</td></tr></table>`,
    primaryButton('Visit Resurface', appUrl),
  ].join('\n');
  return {
    subject: "You're on the Resurface waitlist",
    html: renderShell({
      preheader: "Thanks for joining — we'll email you when your invite is ready.",
      eyebrow: 'Waitlist',
      bodyHtml,
      footerNote:
        'You received this because you joined the Resurface waitlist. If this was not you, you can ignore this email.',
      manageLink: false,
    }),
    text: [
      "You're on the Resurface waitlist.",
      '',
      "Thanks for joining. We're building Resurface to help people actually revisit the X and YouTube saves they meant to come back to.",
      '',
      "The private beta is rolling out manually so we can learn from early users closely. When your invite is ready, we'll send setup steps for the dashboard and Chrome extension.",
      '',
      `You joined with ${email}.`,
      `Visit Resurface: ${appUrl}`,
    ].join('\n'),
  };
}

export function buildInviteEmail(email: string, token: string): RenderedEmail {
  const inviteUrl = `${getPublicAppUrl()}/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const bodyHtml = [
    heading('Your Resurface beta invite is ready.'),
    paragraph('Thanks for joining early. You can now create your account and try the private beta dashboard.'),
    paragraph(
      'After signup, use the onboarding page to install the Chrome extension or add a bookmark manually.',
    ),
    primaryButton('Create your account', inviteUrl),
  ].join('\n');
  return {
    subject: 'Your Resurface beta invite is ready',
    html: renderShell({
      preheader: 'Create your account and start resurfacing your saves.',
      eyebrow: 'Private beta',
      bodyHtml,
      footerNote: `This private beta invite was sent to ${email}.`,
      manageLink: false,
    }),
    text: [
      'Your Resurface beta invite is ready.',
      '',
      'Thanks for joining early. You can now create your account and try the private beta dashboard.',
      '',
      `Create your account: ${inviteUrl}`,
    ].join('\n'),
  };
}
