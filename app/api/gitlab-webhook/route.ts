import {NextRequest, NextResponse} from 'next/server';
import {v4 as uuidv4} from 'uuid';
import db, {initializeDb} from '@/app/lib/db';

export async function POST(req: NextRequest) {
  const gitlabToken = req.headers.get('x-gitlab-token');
  if (gitlabToken !== process.env.GITLAB_WEBHOOK_SECRET) {
    return NextResponse.json({message: 'Unauthorized'}, {status: 401});
  }

  try {
    await initializeDb();

    const {repoName, sastReport} = await req.json();

    if (!repoName || !sastReport) {
      return NextResponse.json({message: 'Missing repoName or sastReport in payload.'}, {status: 400});
    }

    const uniqueId = uuidv4();
    const creationDate = Date.now();

    db.data.reports.push({
      id: uniqueId,
      timestamp: creationDate,
      repoName: repoName,
      data: sastReport,
    });
    await db.write();

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (discordWebhookUrl) {
      const viewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reports/${uniqueId}`;

      const severityCounts: Record<string, number> = sastReport.vulnerabilities.reduce((acc: Record<string, number>, vul: any) => {
        const severity = vul.severity || 'Unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});

      const totalVulnerabilities = sastReport.vulnerabilities.length;

      let description = `**Total Vulnerabilities:** ${totalVulnerabilities}\n`;
      if (severityCounts.Critical) description += `**Critical:** ${severityCounts.Critical}\n`;
      if (severityCounts.High) description += `**High:** ${severityCounts.High}\n`;
      if (severityCounts.Medium) description += `**Medium:** ${severityCounts.Medium}\n`;
      if (severityCounts.Low) description += `**Low:** ${severityCounts.Low}\n`;
      if (severityCounts.Info) description += `**Info:** ${severityCounts.Info}\n`;
      if (severityCounts.Unknown) description += `**Unknown:** ${severityCounts.Unknown}\n`;


      const discordMessage = {
        username: "SAST Dashboard Bot",
        avatar_url: "https://dumbledore.dev/assets/img/logo.png",
        embeds: [
          {
            title: `🚨 New SAST Report for ${repoName}`,
            description: description,
            url: viewUrl,
            color: 16711680,
            fields: [
              {
                name: "Report ID",
                value: uniqueId,
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
              text: "SAST Vulnerability Dashboard"
            }
          }
        ]
      };

      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discordMessage),
        });
        console.log('Discord notification sent successfully.');
      } catch (discordError) {
        console.error('Failed to send Discord notification:', discordError);
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.');
    }

    return NextResponse.json({
      message: 'SAST report received and stored successfully.',
      reportId: uniqueId,
      viewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/reports/${uniqueId}`,
    }, {status: 200});
  } catch (error) {
    console.error('Error processing GitLab webhook:', error);
    return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
  }
}

export async function GET() {
  return NextResponse.json({message: 'Method Not Allowed'}, {status: 405});
}

export async function PUT() {
  return NextResponse.json({message: 'Method Not Allowed'}, {status: 405});
}

export async function DELETE() {
  return NextResponse.json({message: 'Method Not Allowed'}, {status: 405});
}