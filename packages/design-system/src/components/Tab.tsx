'use client';

import { LayoutGroup, motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '../lib/cn';

export interface TabOption<T extends string> {
    label: string;
    value: T;
}

type TabSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<TabSize, string> = {
    sm: 'pb-2 pt-1 text-xs',
    md: 'pb-2.5 pt-1.5 text-sm',
    lg: 'pb-3 pt-2 text-base',
};

export interface TabProps<T extends string> {
    options: readonly TabOption<T>[];
    value: T;
    onChange: (value: T) => void;
    size?: TabSize;
    className?: string;
    groupId?: string;
}

export function Tab<T extends string>({
    options,
    value,
    onChange,
    size = 'sm',
    className,
    groupId,
}: TabProps<T>) {
    const generatedGroupId = useId();
    const layoutGroupId = groupId ?? generatedGroupId;
    const indicatorLayoutId = `${layoutGroupId}-indicator`;

    return (
        <LayoutGroup id={layoutGroupId}>
            <div className={cn('flex items-center', className)}>
                {options.map((option) => {
                    const isActive = option.value === value;

                    return (
                        <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'relative flex flex-1 flex-col items-center whitespace-nowrap px-4 font-sans tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100',
                                sizeStyles[size],
                                isActive
                                    ? 'font-bold text-gray-900'
                                    : 'font-medium text-gray-400',
                            )}
                        >
                            {option.label}
                            {isActive && (
                                <motion.div
                                    layoutId={indicatorLayoutId}
                                    className="absolute bottom-0 h-0.5 w-full rounded-full bg-gray-900"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 30,
                                    }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </LayoutGroup>
    );
}
