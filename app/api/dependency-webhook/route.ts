import { NextRequest, NextResponse } from 'next/server';
import db, { initializeDb } from '@/app/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { TrivyReport } from '@/app/types/trivy';

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-gitlab-token');
  if (token !== process.env.GITLAB_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { repoName, trivyReport }: { repoName: string; trivyReport: TrivyReport } = body;

    if (!repoName || !trivyReport) {
      return NextResponse.json({ error: 'Missing repoName or trivyReport' }, { status: 422 });
    }

    await initializeDb();
    await db.read();

    const entry = {
      id: uuidv4(),
      repoName,
      timestamp: new Date().toISOString(),
      data: trivyReport,
    };

    db.data.trivyReports.push(entry);
    await db.write();

    return NextResponse.json({ success: true, id: entry.id, viewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dependency-scan/${entry.id}`, }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}