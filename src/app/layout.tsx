import type { Metadata } from 'next';
import { NotificationSSEProvider } from '@/app/providers/notification-sse-provider';
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
    icons: {
        icon: [
            {
                url: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                url: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        apple: [
            {
                url: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
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
                    <QueryProvider>
                        <NotificationSSEProvider />
                        {children}
                    </QueryProvider>
                </ThemeProvider>
                <PwaUpdatePrompt />
            </body>
        </html>
    );
}
