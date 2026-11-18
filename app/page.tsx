'use client';

import { ChangeEvent, Suspense, useRef, useState } from 'react';
import { FileJson, Loader2, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import EmptyState from '@/app/components/EmptyState';
import SastReportExplorer from '@/app/components/SastReportExplorer';
import { SastReport } from '@/app/types/vulnerability';

// Scratch viewer: parses a gl-sast-report.json client-side, nothing is stored.
export default function Home() {
  const [report, setReport] = useState<SastReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('No file selected.');
      setReport(null);
      setFileName(null);
      return;
    }

    setLoading(true);
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedReport: SastReport = JSON.parse(content);

        if (!parsedReport.vulnerabilities || !Array.isArray(parsedReport.vulnerabilities)) {
          throw new Error('The JSON file does not appear to be a valid SAST vulnerability report.');
        }

        setReport(parsedReport);
      } catch (parseError: unknown) {
        setError(`Error processing file: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file.');
      setLoading(false);
      setReport(null);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">SAST report viewer</CardTitle>
          <CardDescription>
            Open a GitLab <code className="font-mono">gl-sast-report.json</code> to inspect it locally. Nothing is
            uploaded or stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <input ref={inputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          <Button size="lg" onClick={() => inputRef.current?.click()} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Upload />}
            {fileName ? 'Choose another file' : 'Upload SAST Report (JSON)'}
          </Button>
          {fileName && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileJson className="size-4" />
              {fileName}
            </span>
          )}
        </CardContent>
        {error && <CardContent className="text-sm text-destructive">{error}</CardContent>}
      </Card>

      {report && report.vulnerabilities.length > 0 && (
        // The explorer reads ?severity= from the URL, which needs a Suspense boundary on a static page.
        <Suspense>
          <SastReportExplorer vulnerabilities={report.vulnerabilities} />
        </Suspense>
      )}

      {report && report.vulnerabilities.length === 0 && (
        <EmptyState icon={ShieldCheck}>No vulnerabilities found in this report.</EmptyState>
      )}
    </div>
  );
}
