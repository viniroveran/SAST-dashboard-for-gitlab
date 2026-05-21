import './globals.css';
import { ThemeProviders } from './providers/ThemeProviders';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export const metadata = {
  title: 'SAST Vulnerability Dashboard',
  description: 'Dashboard for GitLab SAST reports',
  icons: {
    icon: '/favicon.ico',
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

        <main className="flex-grow container mx-auto p-8">
          {children}
        </main>

        <Footer />
      </div>
    </ThemeProviders>
    </body>
    </html>
  );
}