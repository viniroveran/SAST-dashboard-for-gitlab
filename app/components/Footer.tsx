'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-linear-to-t from-gray-700 to-gray-900 rounded-2xl shadow-md py-2 px-8 m-4 text-center text-md">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Dumbledore Dev. All rights reserved.</p>
      </div>
    </footer>
  );
}