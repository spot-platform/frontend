'use client';

import { IconButton } from '@frontend/design-system';
import { IconArrowLeft, IconShare, IconSettings } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

interface DetailHeaderProps {
    title?: string;
    showShare?: boolean;
    showSettings?: boolean;
    onShare?: () => void | Promise<void>;
    onSettings?: () => void;
}

export function DetailHeader({
    title,
    showShare = false,
    showSettings = false,
    onShare,
    onSettings,
}: DetailHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleShare = async () => {
        if (onShare) {
            await onShare();
            return;
        }

        const shareUrl = `${window.location.origin}${pathname}`;
        const shareTitle = title ?? document.title;

        try {
            if (navigator.share) {
                await navigator.share({ title: shareTitle, url: shareUrl });
                return;
            }
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError')
                return;
        }
    };

    return (
        <div className="fixed left-0 right-0 top-0 z-40">
            <div className="mx-auto max-w-lg">
                <div className="flex h-[calc(var(--spacing-header-h)+env(safe-area-inset-top))] items-end justify-between bg-background px-4 pb-2 pt-[env(safe-area-inset-top)]">
                    <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        label="뒤로가기"
                        icon={
                            <IconArrowLeft
                                size={20}
                                stroke={2}
                                className="text-foreground"
                            />
                        }
                    />

                    {title && (
                        <span className="text-base font-semibold text-foreground">
                            {title}
                        </span>
                    )}

                    <div className="flex items-center gap-1">
                        {showShare && (
                            <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={handleShare}
                                label="공유"
                                icon={
                                    <IconShare
                                        size={18}
                                        stroke={2}
                                        className="text-foreground"
                                    />
                                }
                            />
                        )}
                        {showSettings && (
                            <IconButton
                                variant="ghost"
                                size="sm"
                                onClick={onSettings}
                                label="설정"
                                icon={
                                    <IconSettings
                                        size={18}
                                        stroke={2}
                                        className="text-foreground"
                                    />
                                }
                            />
                        )}
                        {!showShare && !showSettings && (
                            <div className="h-8 w-8" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
