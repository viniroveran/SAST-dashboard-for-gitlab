/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx,mdx}', // Adicione esta linha para os estilos da HeroUI
    ],
    theme: {
        extend: {},
    },
    darkMode: "class", // Habilita o dark mode baseado na classe 'dark' no HTML
    plugins: [], // A HeroUI não usa um plugin Tailwind como a NextUI
};