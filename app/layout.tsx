import './globals.css';
import { Metadata } from 'next';
import { ThemeProviders } from './providers/ThemeProviders';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Vulnerabilities Dashboard',
  description: 'Dashboard for GitLab SAST and Trivy reports',
  icons: {
    icon: '/dumbledore.ico',
  },
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
    <ThemeProviders>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="grow container mx-auto p-8">
          {children}
        </main>

        <Footer />
      </div>
    </ThemeProviders>
    </body>
    </html>
  );
}