import React from 'react';
import {SeverityCountersProps} from "@/app/types/vulnerability";

const SeverityCounters: React.FC<SeverityCountersProps> = ({ vulnerabilities }) => {
  const severityCounts = vulnerabilities.reduce((acc, vul) => {
    const severity = vul.severity || 'Unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSeverities = Object.keys(severityCounts).sort((a, b) => {
    const order = { 'Critical': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Info': 5, 'Unknown': 6 };
    return (order[a as keyof typeof order] || 99) - (order[b as keyof typeof order] || 99);
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-400';
      case 'Low': return 'bg-blue-400';
      case 'Info': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {sortedSeverities.map((severity) => (
        <div
          key={severity}
          className={`p-4 rounded-lg shadow-md text-white flex flex-col items-center justify-center ${getSeverityColor(severity)}`}
        >
          <span className="text-3xl font-bold">{severityCounts[severity]}</span>
          <span className="text-lg">{severity}</span>
        </div>
      ))}
    </div>
  );
};

export default SeverityCounters;