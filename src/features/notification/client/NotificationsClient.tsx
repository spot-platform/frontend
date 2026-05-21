'use client';

import { Button } from '@frontend/design-system';
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
} from '@/features/notification';

function formatNotificationTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function NotificationsClient() {
    const notifications = useNotifications();
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();
    const items = notifications.data?.data ?? [];
    const unreadCount = items.filter((item) => !item.isRead).length;

    return (
        <div className="flex flex-col gap-4 px-4">
            <section className="flex items-center justify-between gap-3 rounded-2xl border border-border-soft bg-white p-4">
                <div>
                    <h2 className="text-sm font-semibold text-text-secondary">
                        알림
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        읽지 않은 알림 {unreadCount}개
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={unreadCount === 0 || markAllRead.isPending}
                    onClick={() => markAllRead.mutate()}
                >
                    모두 읽음
                </Button>
            </section>

            <section>
                <h2 className="sr-only">알림 목록</h2>
                {notifications.isLoading ? (
                    <p className="rounded-2xl bg-white p-4 text-sm text-muted-foreground">
                        알림을 불러오는 중이에요.
                    </p>
                ) : notifications.isError ? (
                    <p className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
                        알림을 불러오지 못했어요.
                    </p>
                ) : items.length === 0 ? (
                    <p className="rounded-2xl bg-white p-4 text-sm text-muted-foreground">
                        아직 받은 알림이 없어요.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="rounded-2xl border border-border-soft bg-white p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">
                                            {item.message}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {formatNotificationTime(
                                                item.createdAt,
                                            )}
                                        </p>
                                    </div>
                                    {!item.isRead && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={markRead.isPending}
                                            onClick={() =>
                                                markRead.mutate(item.id)
                                            }
                                        >
                                            읽음
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
