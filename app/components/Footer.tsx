'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 rounded-3xl shadow-md py-2 px-8 m-4 text-center text-md font-bold text-gray-500">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Dumbledore Dev. All rights reserved.</p>
      </div>
    </footer>
  );
}