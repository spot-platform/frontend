'use client';

import { useRouter } from 'next/navigation';
import { LayoutList, MapPin, Plus, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SPRING = { type: 'spring', stiffness: 320, damping: 30 } as const;

interface PostCompleteNavProps {
    spotId?: string;
}

export function PostCompleteNav({ spotId }: PostCompleteNavProps) {
    const router = useRouter();

    const handleGoToSpot = () => {
        if (spotId) {
            router.push(`/spot/${spotId}`);
        } else {
            router.push('/spot');
        }
    };

    const expandedContent = (
        <div className="pb-2">
            <p className="mb-3 text-center text-sm font-medium text-white/50">
                새로운 스팟이 탄생했어요! 🎉
            </p>
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleGoToSpot}
                    className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left transition-colors active:bg-white/20"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
                        <span className="text-lg">🗺️</span>
                    </div>
                    <div>
                        <p className="font-semibold text-white">
                            스팟 보러가기
                        </p>
                        <p className="text-xs text-white/50">
                            생성된 스팟의 상세 페이지로 이동해요
                        </p>
                    </div>
                </button>
                <button
                    onClick={async () => {
                        const url = spotId
                            ? `${window.location.origin}/spot/${spotId}`
                            : window.location.origin;
                        if (navigator.share) {
                            await navigator.share({ title: '새 스팟!', url });
                        } else {
                            await navigator.clipboard.writeText(url);
                        }
                    }}
                    className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left transition-colors active:bg-white/20"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
                        <span className="text-lg">🔗</span>
                    </div>
                    <div>
                        <p className="font-semibold text-white">공유하기</p>
                        <p className="text-xs text-white/50">
                            서포터닝의 멋진 재능을 공유해요
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );

    const defaultContent = (
        <>
            {[
                { href: '/feed', label: '피드', Icon: LayoutList },
                { href: '/spot', label: '스팟', Icon: MapPin },
            ].map(({ href, label, Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className="flex flex-1 flex-col items-center gap-1 pb-7 pt-4"
                >
                    <Icon
                        size={22}
                        strokeWidth={1.5}
                        className="text-nav-inactive"
                    />
                    <span className="text-[11px] font-medium leading-none text-nav-inactive">
                        {label}
                    </span>
                </Link>
            ))}

            {/* 중앙 + 버튼 (45도 고정 = 확장 상태) */}
            <div className="flex flex-1 flex-col items-center pb-5 pt-2">
                <motion.div
                    className="-mt-6 flex h-13 w-13 items-center justify-center rounded-full bg-accent shadow-lg"
                    animate={{ rotate: 45 }}
                >
                    <Plus size={28} strokeWidth={2.5} className="text-white" />
                </motion.div>
            </div>

            {[
                { href: '/chat', label: '채팅', Icon: MessageCircle },
                { href: '/my', label: '마이', Icon: User },
            ].map(({ href, label, Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className="flex flex-1 flex-col items-center gap-1 pb-7 pt-4"
                >
                    <Icon
                        size={22}
                        strokeWidth={1.5}
                        className="text-nav-inactive"
                    />
                    <span className="text-[11px] font-medium leading-none text-nav-inactive">
                        {label}
                    </span>
                </Link>
            ))}
        </>
    );

    return (
        <>
            {/* backdrop */}
            <AnimatePresence>
                <motion.div
                    key="backdrop"
                    className="fixed inset-0 z-40 bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            </AnimatePresence>

            <div className="fixed bottom-1 left-1 right-1 z-50">
                <div className="mx-auto max-w-107.5">
                    <motion.div
                        className="overflow-hidden rounded-[22px] border-2 border-[#3b4954] bg-[#1e2938]"
                        initial={{ borderRadius: 28 }}
                        animate={{ borderRadius: 22 }}
                        transition={SPRING}
                    >
                        {/* 확장 콘텐츠 */}
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            transition={SPRING}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pt-4">{expandedContent}</div>
                        </motion.div>

                        {/* 기본 콘텐츠 */}
                        <div className="flex items-end">{defaultContent}</div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
