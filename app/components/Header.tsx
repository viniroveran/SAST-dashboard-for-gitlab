'use client';

import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-8 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          SAST Vulnerability Dashboard
        </h1>
        <ThemeSwitcher />
      </div>
    </header>
  );
}