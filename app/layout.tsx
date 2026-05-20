import './globals.css';
import { ThemeProviders } from './providers/ThemeProviders'; // Importe o novo provider

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body>
    <ThemeProviders> {/* Envolva com o ThemeProviders */}
      {children}
    </ThemeProviders>
    </body>
    </html>
  );
}