import { NextRequest, NextResponse } from 'next/server';

import { saveReport, type ReportKind, type ReportSummary } from '@/app/lib/store';

// The shared body of every report webhook: token check, payload field, storage, Discord.

export interface WebhookConfig<T> {
  kind: ReportKind;
  /** The payload field holding the report ("sastReport", "trivyReport"…). */
  field: string;
  /** Page the report is viewed on, under NEXT_PUBLIC_BASE_URL ("/reports"). */
  viewPath: string;
  /** Discord embed title, given the repo label. */
  title: (repoName: string) => string;
  summarize: (report: T) => ReportSummary;
}

// Discord embed lines in this order, whatever case the scanner uses ("High" or "HIGH").
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info', 'unknown'];

function describe(summary: ReportSummary): string {
  const byLowercase: Record<string, number> = {};
  for (const [severity, count] of Object.entries(summary.severities)) {
    byLowercase[severity.toLowerCase()] = (byLowercase[severity.toLowerCase()] ?? 0) + count;
  }

  let description = `**Total Vulnerabilities:** ${summary.total}\n`;
  for (const severity of SEVERITY_ORDER) {
    if (byLowercase[severity]) {
      description += `**${severity[0].toUpperCase()}${severity.slice(1)}:** ${byLowercase[severity]}\n`;
    }
  }
  return description;
}

async function notifyDiscord(title: string, summary: ReportSummary, id: string, viewUrl: string): Promise<void> {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.');
    return;
  }

  const message = {
    username: 'SAST Dashboard Bot',
    avatar_url: 'https://dumbledore.dev/assets/img/logo.png',
    embeds: [
      {
        title,
        description: describe(summary),
        url: viewUrl,
        color: 16711680,
        fields: [
          { name: 'Report ID', value: id, inline: true },
          { name: 'View Report', value: `[Click Here](${viewUrl})`, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Vulnerabilities Dashboard' },
      },
    ],
  };

  try {
    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      console.error(`Failed to send Discord notification: ${response.status} ${response.statusText} - ${await response.text()}`);
    }
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}

export function reportWebhook<T>(config: WebhookConfig<T>) {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    if (request.headers.get('x-gitlab-token') !== process.env.GITLAB_WEBHOOK_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Body is not valid JSON.' }, { status: 400 });
    }

    const repoName = body.repoName;
    const report = body[config.field] as T | undefined;
    if (typeof repoName !== 'string' || !repoName || !report || typeof report !== 'object') {
      return NextResponse.json({ message: `Missing repoName or ${config.field} in payload.` }, { status: 400 });
    }

    try {
      const summary = config.summarize(report);
      const entry = await saveReport(config.kind, repoName, report, summary);
      const viewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${config.viewPath}/${entry.id}`;

      await notifyDiscord(config.title(repoName), summary, entry.id, viewUrl);

      return NextResponse.json(
        { message: 'Report received and stored successfully.', reportId: entry.id, viewUrl },
        { status: 201 }
      );
    } catch (error) {
      console.error(`Error storing ${config.kind} report:`, error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  };
}
