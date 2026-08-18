import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDb } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ContainerScanReport } from '@/app/types/containerScan';

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

    return NextResponse.json({ success: true, id: entry.id }, { status: 200 });
  } catch (error) {
    console.error('Container scan webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}