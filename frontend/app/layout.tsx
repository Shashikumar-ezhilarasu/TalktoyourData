import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataLens — Ask your data anything.',
  description: 'AI-driven analytics with a refined terminal aesthetic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="dot-grid min-h-screen">
        {children}
      </body>
    </html>
  );
}
