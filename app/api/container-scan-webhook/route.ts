import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDb } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ContainerScanReport, ContainerVulnerability } from '@/app/types/containerScan';

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-gitlab-token');
  if (token !== process.env.GITLAB_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initializeDb();

    const body = await request.json();
    const { repoName, containerScanReport } = body as {
      repoName: string;
      containerScanReport: ContainerScanReport;
    };

    if (!repoName || !containerScanReport) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = {
      id: uuidv4(),
      repoName,
      timestamp: new Date().toISOString(),
      data: containerScanReport,
    };

    db.data!.containerScanReports.push(entry);
    await db.write();

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (discordWebhookUrl) {
      const viewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/container-scan/${entry.id}`;

      const allVulnerabilities: ContainerVulnerability[] = (containerScanReport.Results || [])
        .flatMap((result) => result.Vulnerabilities || []);

      const severityCounts: Record<string, number> = allVulnerabilities.reduce((acc: Record<string, number>, vul) => {
        const severity = vul.Severity || 'UNKNOWN';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});

      const totalVulnerabilities = allVulnerabilities.length;

      let description = `**Total Vulnerabilities:** ${totalVulnerabilities}\n`;
      if (severityCounts.CRITICAL) description += `**Critical:** ${severityCounts.CRITICAL}\n`;
      if (severityCounts.HIGH) description += `**High:** ${severityCounts.HIGH}\n`;
      if (severityCounts.MEDIUM) description += `**Medium:** ${severityCounts.MEDIUM}\n`;
      if (severityCounts.LOW) description += `**Low:** ${severityCounts.LOW}\n`;
      if (severityCounts.UNKNOWN) description += `**Unknown:** ${severityCounts.UNKNOWN}\n`;

      const discordMessage = {
        username: "SAST Dashboard Bot",
        avatar_url: "https://dumbledore.dev/assets/img/logo.png",
        embeds: [
          {
            title: `🐳 New Container Scan Report for ${repoName}`,
            description: description,
            url: viewUrl,
            color: 16711680,
            fields: [
              {
                name: "Report ID",
                value: entry.id,
                inline: true
              },
              {
                name: "View Report",
                value: `[Click Here](${viewUrl})`,
                inline: true
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "Vulnerabilities Dashboard"
            }
          }
        ]
      };

      try {
        const discordResponse = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discordMessage),
        });

        if (discordResponse.ok) {
          console.log('Discord notification sent successfully.');
        } else {
          const errorBody = await discordResponse.text();
          console.error(`Failed to send Discord notification: ${discordResponse.status} ${discordResponse.statusText} - ${errorBody}`);
        }
      } catch (discordError) {
        console.error('Failed to send Discord notification:', discordError);
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.');
    }

    return NextResponse.json({ success: true, id: entry.id }, { status: 200 });
  } catch (error) {
    console.error('Container scan webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
