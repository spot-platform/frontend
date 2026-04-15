'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getFeaturedAdminPosts } from '@/features/admin-post';

export interface HotSpotItem {
    id: string;
    adminPostId: string;
    category: string;
    title: string;
    subtitle: string;
    imageUrl?: string;
}

const MOCK_HOT_SPOTS: HotSpotItem[] = getFeaturedAdminPosts(3).map((post) => ({
    id: post.id,
    adminPostId: post.id,
    category: post.hotSpot.category,
    title: post.hotSpot.title,
    subtitle: post.hotSpot.subtitle,
    imageUrl: post.hotSpot.imageUrl,
}));

interface HotSpotBannerProps {
    items?: HotSpotItem[];
}

function BannerCard({ item }: { item: HotSpotItem }) {
    return (
        <div className="relative h-full w-full overflow-hidden rounded-xl">
            {item.imageUrl ? (
                <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 430px"
                    priority
                />
            ) : (
                <div className="h-full w-full bg-linear-to-b from-nav-inactive to-[#35373c]" />
            )}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-linear-to-t from-black/55 to-transparent p-4 text-white">
                <p className="text-xs font-light tracking-wide text-white/80">
                    {item.category}
                </p>
                <h2 className="mt-0.5 text-2xl font-bold leading-tight">
                    {item.title}
                </h2>
                <p className="mt-0.5 text-sm text-white/90">{item.subtitle}</p>
            </div>
        </div>
    );
}

const GAP_PX = 5;

export function HotSpotBanner({ items = MOCK_HOT_SPOTS }: HotSpotBannerProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const isDragging = useRef(false);

    if (items.length === 0) {
        return null;
    }

    function handlePrev() {
        setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    }

    function handleNext() {
        setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }

    function getOffset(index: number) {
        let offset = index - activeIndex;
        if (offset > items.length / 2) offset -= items.length;
        if (offset < -items.length / 2) offset += items.length;
        return offset;
    }

    return (
        <div className="flex flex-col gap-3">
            {/* px-10: 양옆 40px 패딩 → peek 카드가 그 안에서 보임, overflow-hidden으로 레이아웃 보호 */}
            <div className="overflow-hidden px-10">
                <div className="relative h-48">
                    {items.map((item, index) => {
                        const offset = getOffset(index);
                        const isActive = offset === 0;
                        const isVisible = Math.abs(offset) <= 1;

                        return (
                            <motion.div
                                key={item.id}
                                className={`absolute top-0 h-full w-full ${isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                                animate={{
                                    x: `calc(${offset * 100}% + ${offset * GAP_PX}px)`,
                                    scale: isActive ? 1 : 0.9,
                                    opacity: isVisible
                                        ? isActive
                                            ? 1
                                            : 0.55
                                        : 0,
                                    zIndex: isActive ? 10 : 1,
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeInOut',
                                }}
                                {...(isActive && {
                                    drag: 'x' as const,
                                    dragConstraints: { left: 0, right: 0 },
                                    dragElastic: 0.2,
                                    onDragStart: () => {
                                        isDragging.current = true;
                                    },
                                    onDragEnd: (
                                        _e:
                                            | MouseEvent
                                            | TouchEvent
                                            | PointerEvent,
                                        info: { offset: { x: number } },
                                    ) => {
                                        if (info.offset.x < -50) handleNext();
                                        else if (info.offset.x > 50)
                                            handlePrev();
                                        // click 이벤트보다 늦게 false로 복원
                                        setTimeout(() => {
                                            isDragging.current = false;
                                        }, 0);
                                    },
                                })}
                                onClick={() => {
                                    if (isDragging.current) return;
                                    if (offset === 0)
                                        router.push(
                                            `/admin-post/${item.adminPostId}`,
                                        );
                                    else if (offset === -1) handlePrev();
                                    else if (offset === 1) handleNext();
                                }}
                            >
                                <BannerCard item={item} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 인디케이터 */}
            <div className="flex items-center justify-center gap-1">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        aria-label={`슬라이드 ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                            i === activeIndex
                                ? 'w-4 bg-gray-700'
                                : 'w-1.5 bg-gray-300'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
