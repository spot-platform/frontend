'use client';

import { IconButton, Input } from '@frontend/design-system';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onBack?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export function SearchBar({
    value,
    onChange,
    placeholder = '검색어를 입력하세요',
    autoFocus = true,
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (autoFocus) {
            const timer = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        }
    }, [autoFocus]);

    return (
        <div className="flex items-center gap-2 px-4 py-2.5">
            <div
                className={`relative flex flex-1 items-center rounded-full transition-colors duration-150 ${
                    isFocused ? 'bg-gray-200' : 'bg-gray-100'
                }`}
            >
                <Input
                    ref={inputRef}
                    type="search"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder=""
                    autoComplete="off"
                    spellCheck={false}
                    endAdornment={
                        <AnimatePresence initial={false}>
                            {value ? (
                                <motion.span
                                    key="clear"
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.7 }}
                                    transition={{ duration: 0.12 }}
                                    className="inline-flex"
                                >
                                    <IconButton
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            onChange('');
                                            inputRef.current?.focus();
                                        }}
                                        label="검색어 지우기"
                                        className="h-5 w-5 rounded-full bg-gray-400 text-white hover:bg-gray-500 focus-visible:ring-2 focus-visible:ring-gray-300"
                                        icon={
                                            <IconX
                                                size={12}
                                                stroke={2.5}
                                                className="text-current"
                                            />
                                        }
                                    />
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                    }
                    className="h-11 rounded-full border-transparent bg-transparent pl-4 pr-11 text-sm text-gray-900 focus:border-transparent focus:ring-0 [&::-webkit-search-cancel-button]:hidden"
                    aria-label="검색"
                />

                <AnimatePresence>
                    {!value && (
                        <motion.span
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none"
                            aria-hidden
                        >
                            {placeholder}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
