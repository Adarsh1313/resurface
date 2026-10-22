import { describe, expect, it } from 'vitest';
import {
  buildDigestEmail,
  buildInviteEmail,
  buildReminderEmail,
  buildWaitlistConfirmationEmail,
} from '../src/lib/email-templates';
import { resolvePreferences, preferencesPatchSchema, DEFAULT_PREFERENCES } from '../src/lib/preferences';

const evil = '<script>alert("x")</script>';
const links = {
  open: 'https://api.example.com/v1/actions/open-token',
  review: 'https://api.example.com/v1/actions/review-token',
  snooze: 'https://api.example.com/v1/actions/snooze-token',
};
const bookmark = {
  id: 'b1',
  url: 'https://youtube.com/watch?v=1',
  platform: 'youtube',
  title: `Great video ${evil}`,
  author: `Bob "<b>"`,
  thumbnail_url: 'https://i.ytimg.com/vi/1/hq.jpg?a=1&b=2',
  topics: [{ name: `AI ${evil}` }],
};

describe('email templates', () => {
  it('digest escapes all user content', () => {
    const email = buildDigestEmail({ userName: `Eve ${evil}`, bookmarks: [bookmark], linksFor: () => links });
    expect(email.html).not.toContain('<script>');
    expect(email.html).not.toContain('<b>');
    expect(email.html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(email.html).toContain('Bob &quot;&lt;b&gt;&quot;');
    expect(email.html).toContain('?a=1&amp;b=2');
  });

  it('digest contains action buttons, pill, thumbnail, footer link', () => {
    const email = buildDigestEmail({
      userName: 'Ann',
      bookmarks: [bookmark, { ...bookmark, id: 'b2', platform: 'x', thumbnail_url: null, title: null }],
      linksFor: () => links,
    });
    expect(email.subject).toBe('Your Resurface digest: 2 saves to revisit');
    for (const href of Object.values(links)) expect(email.html).toContain(`href="${href}"`);
    expect(email.html).toContain('Mark reviewed');
    expect(email.html).toContain('Snooze 1 day');
    expect(email.html).toContain('#ff4040');
    expect(email.html).toContain('#0f0f0e');
    expect(email.html).toContain('/dashboard/settings?section=notifications');
    expect(email.html).toContain('<img src="https://i.ytimg.com');
    expect((email.html.match(/<img /g) || []).length).toBe(1); // only bookmark with thumbnail
    expect(email.text).toContain(links.review);
  });

  it('ignores non-http thumbnails', () => {
    const email = buildDigestEmail({
      userName: 'Ann',
      bookmarks: [{ ...bookmark, thumbnail_url: 'javascript:alert(1)' }],
      linksFor: () => links,
    });
    expect(email.html).not.toContain('javascript:');
  });

  it('reminder email uses the shared shell + buttons and escapes', () => {
    const email = buildReminderEmail({ userName: evil, bookmark, links });
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('Snooze 1 day');
    expect(email.html).toContain('<img src=');
    expect(email.subject.startsWith('Reminder: ')).toBe(true);
  });

  it('waitlist + invite emails escape the email address', () => {
    const w = buildWaitlistConfirmationEmail(`a${evil}@x.com`);
    expect(w.html).not.toContain('<script>');
    const i = buildInviteEmail(`a${evil}@x.com`, 'tok&en');
    expect(i.html).not.toContain('<script>');
    expect(i.html).toContain('invite=tok%26en');
  });
});

describe('preferences', () => {
  it('defaults', () => {
    expect(resolvePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(resolvePreferences({})).toEqual({
      digest_email: true,
      reminder_email: true,
      browser_notifications: true,
      product_updates: false,
    });
  });
  it('merges stored booleans and ignores junk', () => {
    expect(resolvePreferences({ digest_email: false, product_updates: 'yes', extra: 1 })).toEqual({
      ...DEFAULT_PREFERENCES,
      digest_email: false,
    });
    expect(resolvePreferences([true])).toEqual(DEFAULT_PREFERENCES);
  });
  it('validates patches', () => {
    expect(preferencesPatchSchema.safeParse({ digest_email: false }).success).toBe(true);
    expect(preferencesPatchSchema.safeParse({ digest_email: 'no' }).success).toBe(false);
    expect(preferencesPatchSchema.safeParse({ other: true }).success).toBe(false);
  });
});
