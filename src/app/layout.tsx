import type { Metadata } from 'next';
import { QueryProvider } from '@/app/providers/query-provider';
import { ThemeProvider } from '@/app/providers/theme-provider';
import { PwaUpdatePrompt } from '@/shared/ui/pwa-update-prompt';
import './globals.css';

export const metadata: Metadata = {
    title: {
        template: '%s | Spot',
        default: 'Spot — Share Your Seat',
    },
    description: 'Find and share spots in your city',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Spot',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                <ThemeProvider>
                    <QueryProvider>{children}</QueryProvider>
                </ThemeProvider>
                <PwaUpdatePrompt />
            </body>
        </html>
    );
}
