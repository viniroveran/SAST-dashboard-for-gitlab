import React from 'react';

export function Footer() {
  return (
    <footer className="bg-yellow-700 shadow-md py-2 px-8 mt-8 text-center text-black text-lg">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Dumbledore Dev. All rights reserved.</p>
      </div>
    </footer>
  );
}