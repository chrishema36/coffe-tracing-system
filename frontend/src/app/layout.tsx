import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'CoffeeTrace • SLR Enterprise Coffee Lineage & Attribution Platform',
  description: 'Enterprise Coffee Traceability, Multi-Tier Recursive Merging & Farmer Percentage Attribution Platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-gray-100 font-sans flex min-h-screen antialiased selection:bg-amberAccent selection:text-gray-950">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Navbar />
            <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
