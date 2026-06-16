import type { Metadata } from 'next';
import './globals.css';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata: Metadata = {
  title: 'Boaz Leleina - Distributed Systems & Backend Engineer',
  description: 'Distributed systems and backend engineering. Available for remote roles.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
