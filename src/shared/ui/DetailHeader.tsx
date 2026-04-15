'use client';

import { IconButton } from '@frontend/design-system';
import { ArrowLeft, Share2, Settings } from 'lucide-react';
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
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl,
                });
                return;
            }

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }
        }
    };

    return (
        <div className="fixed left-0 right-0 top-0 z-40">
            <div className="mx-auto max-w-107.5">
                <div className="flex h-[calc(var(--spacing-header-h)+env(safe-area-inset-top))] items-end justify-between bg-white px-4 pb-2 pt-[env(safe-area-inset-top)]">
                    <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        label="뒤로가기"
                        className="text-black"
                        icon={
                            <ArrowLeft
                                size={22}
                                strokeWidth={2}
                                className="text-black"
                            />
                        }
                    />

                    {title && (
                        <span className="text-base font-semibold text-black">
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
                                className="text-black"
                                icon={
                                    <Share2
                                        size={20}
                                        strokeWidth={2}
                                        className="text-black"
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
                                className="text-black"
                                icon={
                                    <Settings
                                        size={20}
                                        strokeWidth={2}
                                        className="text-black"
                                    />
                                }
                            />
                        )}
                        {!showShare && !showSettings && (
                            <div className="h-9 w-9" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
