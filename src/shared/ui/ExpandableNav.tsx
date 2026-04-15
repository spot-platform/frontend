'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BaseNavProps {
    expandable?: false;
    defaultContent: ReactNode;
}

interface ExpandableNavProps {
    expandable: true;
    defaultContent: ReactNode;
    expandedContent: ReactNode;
    expanded: boolean;
    onExpandChange: (expanded: boolean) => void;
}

type Props = BaseNavProps | ExpandableNavProps;

const SPRING = { type: 'spring', stiffness: 320, damping: 30 } as const;

export function ExpandableNav(props: Props) {
    const isExpandable = props.expandable === true;
    const expanded = isExpandable
        ? (props as ExpandableNavProps).expanded
        : false;
    const onExpandChange = isExpandable
        ? (props as ExpandableNavProps).onExpandChange
        : undefined;
    const navRef = useRef<HTMLDivElement>(null);

    // onExpandChange를 ref로 감싸서 리스너 재등록 없이 최신 참조 유지
    const onExpandChangeRef = useRef(onExpandChange);
    useEffect(() => {
        onExpandChangeRef.current = onExpandChange;
    });

    // 외부 클릭 / 터치 / 휠 → 닫기
    // expanded가 true가 된 시점에 한 번만 등록, false가 될 때 해제
    useEffect(() => {
        if (!expanded) return;

        const handleClick = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                onExpandChangeRef.current?.(false);
            }
        };
        const handleOutsideMove = (e: TouchEvent | WheelEvent) => {
            if (navRef.current?.contains(e.target as Node)) return;
            onExpandChangeRef.current?.(false);
        };

        // setTimeout으로 등록 클릭(토글 버튼)이 즉시 닫히는 것을 방지
        const id = setTimeout(() => {
            document.addEventListener('click', handleClick);
            document.addEventListener('touchmove', handleOutsideMove, {
                passive: true,
            });
            document.addEventListener('wheel', handleOutsideMove, {
                passive: true,
            });
        }, 50);

        return () => {
            clearTimeout(id);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('touchmove', handleOutsideMove);
            document.removeEventListener('wheel', handleOutsideMove);
        };
    }, [expanded]); // onExpandChange 제외 — ref로 처리

    return (
        <>
            {/* 반투명 backdrop */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-40 bg-black/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>

            <div ref={navRef} className="fixed bottom-1 left-1 right-1 z-50">
                <div className="mx-auto max-w-107.5">
                    <div className="flex flex-col overflow-hidden rounded-[28px] border-2 border-[#3b4954] bg-[#1e2938]">
                        {/* 확장 콘텐츠 */}
                        <AnimatePresence initial={false}>
                            {isExpandable && expanded && (
                                <motion.div
                                    key="expanded"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={SPRING}
                                    className="min-h-0 overflow-hidden"
                                >
                                    <div className="max-h-[calc(80dvh-5rem)] overflow-y-auto overscroll-contain px-4 pt-4">
                                        {
                                            (props as ExpandableNavProps)
                                                .expandedContent
                                        }
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 기본 콘텐츠 */}
                        <div className="flex shrink-0 items-center">
                            {props.defaultContent}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
