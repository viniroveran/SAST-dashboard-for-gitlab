import './globals.css';
import { ThemeProviders } from './providers/ThemeProviders';
import { Header } from './components/Header'; // Importe o Header
import { Footer } from './components/Footer'; // Importe o Footer

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <ThemeProviders>
      {/* Estrutura principal do layout: flex column para Header, Main e Footer */}
      <div className="min-h-screen flex flex-col">
        <Header /> {/* Header fixo no topo */}

        {/* Conteúdo principal: ocupa o espaço restante e permite scroll se necessário */}
        <main className="flex-grow container mx-auto p-8">
          {children} {/* Aqui será renderizado o conteúdo da sua página (app/page.tsx) */}
        </main>

        <Footer /> {/* Footer fixo na parte inferior */}
      </div>
    </ThemeProviders>
    </body>
    </html>
  );
}