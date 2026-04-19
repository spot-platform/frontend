'use client';

import { motion } from 'framer-motion';
import { IconSparkles } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Chip } from '@frontend/design-system';
import { DetailPageShell } from '@/shared/ui';

type CompletePageClientProps = {
    mySpotId?: string;
};

const AUTO_REDIRECT_MS = 2200;

export function CompletePageClient({ mySpotId }: CompletePageClientProps) {
    const router = useRouter();

    // 일정 시간 후 자동으로 맵에서 새 스팟을 강조 표시하며 이동.
    useEffect(() => {
        if (!mySpotId) return;
        const timer = setTimeout(() => {
            router.push(`/map?sim=swarm&cluster=mine-${mySpotId}&sheet=peek`);
        }, AUTO_REDIRECT_MS);
        return () => clearTimeout(timer);
    }, [mySpotId, router]);

    const goToMap = () => {
        if (mySpotId) {
            router.push(`/map?sim=swarm&cluster=mine-${mySpotId}&sheet=peek`);
        } else {
            router.push('/map');
        }
    };

    return (
        <DetailPageShell
            px="lg"
            bottomInset="md"
            className="items-center justify-center text-center"
        >
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-4"
            >
                <Chip selected tone="brand">
                    스팟 생성 완료
                </Chip>
            </motion.div>

            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
            >
                <IconSparkles size={44} className="text-primary" stroke={1.5} />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-bold text-foreground"
            >
                당신의 모임이 지도에 올라왔어요
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
            >
                잠시 후 지도에서 당신의 모임을
                <br />
                확인할 수 있어요.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex w-full max-w-xs flex-col gap-2"
            >
                <Button size="lg" onClick={goToMap}>
                    지도에서 바로 보기
                </Button>
                <button
                    type="button"
                    onClick={() => router.push('/my')}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                    나중에 보기
                </button>
            </motion.div>
        </DetailPageShell>
    );
}
