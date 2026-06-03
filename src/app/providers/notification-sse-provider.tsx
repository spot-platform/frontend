'use client';

import { useNotificationSSE } from '@/features/notification';
import { useAuthStore } from '@/shared/model/auth-store';

export function NotificationSSEProvider() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const userId = useAuthStore((state) => state.userId);

    useNotificationSSE({ enabled: isAuthenticated || Boolean(userId) });

    return null;
}
