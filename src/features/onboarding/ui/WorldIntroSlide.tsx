'use client';

// Intro slide. Copy + map miniature placeholder animation.

import { motion } from 'framer-motion';
import { cn } from '@frontend/design-system';

type WorldIntroSlideProps = {
    className?: string;
};

const PERSONA_EMOJIS = ['🧭', '🤝', '🎨', '🔗', '📚'];

export function WorldIntroSlide({ className }: WorldIntroSlideProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-6 text-center',
                className,
            )}
        >
            <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-background to-brand-100 ring-1 ring-border-soft/60">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 30%, rgba(0,0,0,0.05) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.05) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }}
                    animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
                {PERSONA_EMOJIS.map((emoji, index) => (
                    <motion.div
                        key={emoji}
                        className="absolute text-2xl"
                        style={{
                            top: `${20 + (index % 3) * 25}%`,
                            left: `${15 + index * 15}%`,
                        }}
                        animate={{
                            y: [0, -6, 0],
                            opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                            duration: 2.5 + index * 0.3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.25,
                        }}
                    >
                        {emoji}
                    </motion.div>
                ))}
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold text-foreground">
                    AI 페르소나가 동네를 탐험하고 있어요
                </h1>
                <p className="text-sm text-muted-foreground">
                    너의 역할과 관심사를 알려주면
                    <br />딱 맞는 모임을 추천해줄게.
                </p>
            </div>
        </div>
    );
}
