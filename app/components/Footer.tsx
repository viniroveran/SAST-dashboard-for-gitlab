import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 py-4 px-8 mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Dumbledore Dev. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}