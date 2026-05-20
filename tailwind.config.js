module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        pre: {
                            backgroundColor: '#1f2933', // bg-gray-800
                            color: '#e5e7eb',           // text-gray-200
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            borderWidth: '1px',
                            borderColor: '#374151',     // gray-700
                            fontSize: '0.875rem',
                        },
                        code: {
                            backgroundColor: 'rgba(31,41,55,0.7)', // gray-800 com opacidade
                            color: '#e5e7eb',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.875em',
                        },
                    },
                },
                invert: {
                    css: {
                        pre: {
                            backgroundColor: '#111827', // gray-900
                            color: '#e5e7eb',           // text-gray-200
                            borderColor: '#4b5563',     // gray-600
                        },
                        code: {
                            backgroundColor: 'rgba(17,24,39,0.8)',
                            color: '#e5e7eb',
                        },
                    },
                },
            },
        },
    },
    darkMode: 'class',
    plugins: [
        require('@tailwindcss/typography'),
    ],
};