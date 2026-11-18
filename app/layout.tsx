import './globals.css';
import { Metadata } from 'next';
import { ThemeProviders } from './providers/ThemeProviders';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export const metadata: Metadata = {
  title: 'Vulnerabilities Dashboard',
  description: 'Dashboard for GitLab SAST and Trivy reports',
  icons: {
    icon: '/dumbledore.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-7xl grow px-4 py-8 sm:px-6">{children}</main>
            <Footer />
          </div>
        </ThemeProviders>
      </body>
    </html>
  );
}
