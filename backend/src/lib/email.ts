interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wrapLines(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const rawLine of text.split('\n')) {
    if (rawLine.length <= maxWidth) {
      lines.push(rawLine);
    } else {
      let remaining = rawLine;
      while (remaining.length > maxWidth) {
        let breakAt = remaining.lastIndexOf(' ', maxWidth);
        if (breakAt <= 0) breakAt = maxWidth;
        lines.push(remaining.slice(0, breakAt));
        remaining = remaining.slice(breakAt).trimStart();
      }
      if (remaining) lines.push(remaining);
    }
  }
  return lines;
}

function logToConsole(message: EmailMessage) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const preview = message.text || stripHtml(message.html);
  const truncated = preview.length > 500 ? preview.slice(0, 497) + '...' : preview;
  const contentWidth = 50;
  const border = '─'.repeat(contentWidth + 2);
  const pad = (str: string) => `│  ${str}${''.padEnd(Math.max(0, contentWidth - str.length))}│`;
  const previewLines = wrapLines(truncated, contentWidth - 2);
  const output = [
    `┌${border}┐`,
    pad('📧 EMAIL'),
    `├${border}┤`,
    pad(`To:      ${message.to}`),
    pad(`Subject: ${message.subject}`),
    pad(`Time:    ${timestamp}`),
    `├${border}┤`,
    ...previewLines.map((line) => pad(line)),
    `└${border}┘`,
  ];
  console.log('\n' + output.join('\n') + '\n');
}

export async function sendEmail(message: EmailMessage): Promise<{ success: true; messageId: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'Resurface <onboarding@resend.dev>';

  // Always log for observability during dev.
  logToConsole(message);

  if (!apiKey) {
    return { success: true, messageId: 'console-' + Date.now() };
  }

  // Send via Resend (https://resend.com/docs/api-reference/emails/send-email)
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text || stripHtml(message.html),
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Resend API error ${resp.status}: ${body}`);
  }

  const data = (await resp.json()) as { id: string };
  console.log(`  ✓ Resend delivered (id=${data.id})\n`);
  return { success: true, messageId: data.id };
}
