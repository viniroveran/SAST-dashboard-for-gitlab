'use client';

import React from 'react';

export function Header() {
  return (
    <header className="bg-gray-800 shadow-md rounded-3xl m-4 p-1">
      <div className="container mx-auto flex justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-500">
          Vulnerabilities Dashboard
        </h1>
      </div>
    </header>
  );
}