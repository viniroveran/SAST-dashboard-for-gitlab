'use client';

import React from 'react';
import {SeverityCountersProps} from "@/app/types/vulnerability";
import {Card as HeroUICard} from "@heroui/react";
import {
  ShieldExclamation,
  TriangleExclamationFill,
  TriangleExclamation,
  CircleExclamation,
  ShieldCheck,
  Shield
} from "@gravity-ui/icons";

const SeverityCounters: React.FC<SeverityCountersProps> = ({vulnerabilities}) => {
  const fixedSeveritiesOrder = ['Critical', 'High', 'Medium', 'Low', 'Info'];

  const severityCounts = vulnerabilities.reduce((acc, vul) => {
    const severity = vul.severity || 'Unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-600 text-gray-900';
      case 'High':
        return 'bg-orange-600 text-gray-900';
      case 'Medium':
        return 'bg-yellow-500 text-gray-900';
      case 'Low':
        return 'bg-green-500 text-gray-900';
      case 'Info':
        return 'bg-blue-500 text-gray-900';
      default:
        return 'bg-gray-500 text-gray-900';
    }
  };
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <TriangleExclamationFill className="size-6 text-gray-900"/>;
      case 'High':
        return <TriangleExclamation className="size-6 text-gray-900"/>;
      case 'Medium':
        return <CircleExclamation className="size-6 text-gray-900"/>;
      case 'Low':
        return <ShieldExclamation className="size-6 text-gray-900"/>;
      case 'Info':
        return <ShieldCheck className="size-6 text-gray-900"/>;
      default:
        return <Shield className="size-6 text-gray-900"/>;
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4 mb-8 w-full content-center">
      {fixedSeveritiesOrder.map((severity) => (
        <HeroUICard
          key={severity}
          className={`p-4 shadow-md flex flex-col items-center justify-center ${getSeverityColor(severity)}`}
        >
          {getSeverityIcon(severity)}
          <HeroUICard.Header className="!p-0 !pb-2">
            <HeroUICard.Title className="text-4xl font-bold text-center text-gray-900">
              {severityCounts[severity] || 0}
            </HeroUICard.Title>
            <HeroUICard.Description className="text-xl font-bold !text-inherit pt-3">
              {severity}
            </HeroUICard.Description>
          </HeroUICard.Header>
        </HeroUICard>
      ))}
    </div>
  );
};

export default SeverityCounters;