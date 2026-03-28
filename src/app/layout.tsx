import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
    title: {
        template: '%s | Spot',
        default: 'Spot — Share Your Seat',
    },
    description: 'Find and share spots in your city',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
