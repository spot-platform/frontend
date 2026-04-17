'use client';

import { motion } from 'framer-motion';
import { IconSparkles } from '@tabler/icons-react';
import { Chip } from '@frontend/design-system';
import { PostCompleteNav } from './PostCompleteNav';

type CompletePageClientProps = {
    spotId?: string;
};

export function CompletePageClient({ spotId }: CompletePageClientProps) {
    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center px-8 pb-48 text-center">
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
                    className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10"
                >
                    <IconSparkles
                        size={44}
                        className="text-accent"
                        stroke={1.5}
                    />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-xl font-bold text-gray-900"
                >
                    새로운 스팟이 탄생했어요!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-3 text-sm leading-relaxed text-gray-500"
                >
                    서포터닝의 멋진 재능을 공유할
                    <br />
                    준비가 끝났습니다.
                </motion.p>
            </main>

            <PostCompleteNav spotId={spotId} />
        </>
    );
}
