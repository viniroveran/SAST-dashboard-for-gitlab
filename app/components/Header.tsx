'use client';

import React from 'react';

export function Header() {
  return (
    <header className="bg-linear-to-b from-gray-700 to-gray-900 shadow-md rounded-2xl py-4 px-8 m-4">
      <div className="container mx-auto flex justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-200">
          SAST Vulnerability Dashboard
        </h1>
      </div>
    </header>
  );
}