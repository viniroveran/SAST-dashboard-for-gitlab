'use client';

import {useState, ChangeEvent} from 'react';
import {Button} from '@heroui/react';
import Head from 'next/head';
import SeverityCounters from '@/app/components/SeverityCounters';
import VulnerabilityTable from '@/app/components/VulnerabilityTable';
import {SastReport} from '@/app/types/vulnerability';

export default function Home() {
  const [report, setReport] = useState<SastReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError("Nenhum arquivo selecionado.");
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
          throw new Error("O arquivo JSON não parece ser um relatório de vulnerabilidades SAST válido.");
        }

        setReport(parsedReport);
      } catch (parseError: any) {
        setError(`Erro ao processar o arquivo: ${parseError.message}`);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Erro ao ler o arquivo.");
      setLoading(false);
      setReport(null);
    };

    reader.readAsText(file);
  };

  return (
    <>
      <Head>
        <title>SAST Vulnerability Dashboard</title>
        <meta name="description" content="Dashboard para relatórios SAST do GitLab"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <div className="mb-8 flex flex-col items-center">
        <input
          id="file-upload"
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          onPress={() => document.getElementById('file-upload')?.click()}
          variant="primary"
          size="lg"
          isDisabled={loading}
        >
          {fileName ? `Arquivo: ${fileName}` : 'Carregar Relatório SAST (JSON)'}
        </Button>
        {loading && <p className="mt-4 text-blue-500 dark:text-blue-400">Carregando...</p>}
        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {report && report.vulnerabilities.length > 0 && (
        <>
          <SeverityCounters vulnerabilities={report.vulnerabilities}/>

          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6 mt-10">
            Detalhes das Vulnerabilidades
          </h2>
          <VulnerabilityTable vulnerabilities={report.vulnerabilities}/>
        </>
      )}

      {report && report.vulnerabilities.length === 0 && (
        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300 text-xl">
          <p>Nenhuma vulnerabilidade encontrada neste relatório.</p>
        </div>
      )}

      {!report && !loading && !error && (
        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-700 dark:text-gray-300 text-xl">
          <p>Por favor, carregue um relatório SAST para começar.</p>
        </div>
      )}
    </>
  );
}