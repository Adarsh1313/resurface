function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** Public URL of the Next.js web app (used for links in emails and redirects). */
export function getPublicAppUrl(): string {
  return stripTrailingSlash(
    process.env.PUBLIC_APP_URL || process.env.WEB_APP_URL || 'http://localhost:3000',
  );
}

/**
 * Public URL of this API (used for signed action links in emails).
 * Render injects RENDER_EXTERNAL_URL automatically, so production needs no extra config.
 */
export function getPublicApiUrl(): string {
  return stripTrailingSlash(
    process.env.PUBLIC_API_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `http://localhost:${process.env.PORT || 4000}`,
  );
}

export function notificationSettingsUrl(): string {
  return `${getPublicAppUrl()}/dashboard/settings?section=notifications`;
}
