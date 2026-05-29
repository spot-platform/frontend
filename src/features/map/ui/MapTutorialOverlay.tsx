'use client';

import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';
import type { CSSProperties } from 'react';

export type MapTutorialStep = {
    id: 'markers' | 'deck' | 'card' | 'controls';
    eyebrow: string;
    title: string;
    description: string;
    hint: string;
};

export type MapTutorialMarkerInfo = {
    id: string;
    label: string;
    description: string;
};

const panelClassNameByStep: Record<MapTutorialStep['id'], string> = {
    markers:
        'left-5 right-5 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:bottom-auto sm:left-auto sm:right-6 sm:top-[calc(env(safe-area-inset-top)+5rem)] sm:w-[360px]',
    deck: 'left-5 right-5 top-[calc(env(safe-area-inset-top)+4.5rem)] sm:left-1/2 sm:right-auto sm:top-[calc(env(safe-area-inset-top)+3rem)] sm:w-[420px] sm:-translate-x-1/2',
    card: 'left-5 right-5 bottom-[calc(env(safe-area-inset-bottom)+1rem)] sm:left-1/2 sm:right-auto sm:w-[460px] sm:-translate-x-1/2',
    controls:
        'left-5 right-5 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:left-6 sm:right-auto sm:w-[420px]',
};

const spotlightScopeStyleByStep: Record<
    MapTutorialStep['id'],
    Pick<CSSProperties, 'height' | 'left' | 'top' | 'transform' | 'width'>
> = {
    markers: {
        left: '50%',
        top: '29dvh',
        width: 'min(30rem, calc(100vw - 1rem))',
        height: 'min(20rem, 34dvh)',
        transform: 'translate(-50%, -50%)',
    },
    deck: {
        left: '50%',
        top: 'calc(100dvh - 7.25rem)',
        width: 'min(42rem, calc(100vw - 0.75rem))',
        height: 'min(19.5rem, 29dvh)',
        transform: 'translate(-50%, -50%)',
    },
    card: {
        left: '50%',
        top: '35dvh',
        width: 'min(34rem, calc(100vw - 0.75rem))',
        height: 'min(21rem, 36dvh)',
        transform: 'translate(-50%, -50%)',
    },
    controls: {
        left: 'calc(100vw - 5.75rem)',
        top: 'calc(env(safe-area-inset-top) + 16.75rem)',
        width: '10.5rem',
        height: '22rem',
        transform: 'translate(-50%, -50%)',
    },
};

const gestureCueStyleByStep: Partial<
    Record<
        MapTutorialStep['id'],
        Pick<CSSProperties, 'left' | 'top' | 'transform'>
    >
> = {
    deck: {
        left: '50%',
        top: 'calc(100dvh - 7.25rem)',
        transform: 'translate(-50%, -50%)',
    },
    card: {
        left: '50%',
        top: '35dvh',
        transform: 'translate(-50%, -50%)',
    },
};

export const MAP_TUTORIAL_STEPS: MapTutorialStep[] = [
    {
        id: 'markers',
        eyebrow: '맵 마커',
        title: '지도 위 마커를 누르면 주변 활동을 바로 볼 수 있어요.',
        description:
            '반짝이는 핫스팟, AI가 추천한 피드, 다른 사용자가 올린 피드가 서로 다른 모양으로 표시돼요. 궁금한 마커를 눌러 어떤 활동인지 확인해보세요.',
        hint: '궁금한 마커를 탭해보기',
    },
    {
        id: 'deck',
        eyebrow: '카드 덱',
        title: '아래 카드 덱에서 가까운 피드를 넘겨볼 수 있어요.',
        description:
            '지금 위치와 지도 범위에 맞는 피드가 카드로 정리돼요. 덱을 탭하거나 위로 밀면 첫 번째 피드가 올라와요.',
        hint: '카드 덱을 탭하거나 위로 스와이프',
    },
    {
        id: 'card',
        eyebrow: '카드 제스처',
        title: '궁금한 피드는 좌우 제스처로 디테일을 열 수 있어요.',
        description:
            '올라온 카드를 왼쪽이나 오른쪽으로 밀면 디테일 보기 제스처를 익힐 수 있어요. 튜토리얼에서는 실제 페이지로 이동하지 않고 다음 안내로 넘어가요.',
        hint: '카드를 좌우로 스와이프',
    },
    {
        id: 'controls',
        eyebrow: '빠른 버튼',
        title: '오른쪽 버튼으로 맵을 빠르게 조정할 수 있어요.',
        description:
            '도움말 다시 보기, 피드 타입 전환, 내 위치 이동, 목록 보기, 레이어 전환을 오른쪽 버튼에서 바로 사용할 수 있어요. 필요할 때 지도를 이동하지 않고 원하는 보기로 바꿔보세요.',
        hint: '도움말 · 필터 · 위치 · 목록 · 레이어',
    },
];

export function MapTutorialOverlay({
    open,
    stepIndex,
    steps = MAP_TUTORIAL_STEPS,
    selectedMarker,
    onStepChange,
    onClose,
}: {
    open: boolean;
    stepIndex: number;
    steps?: MapTutorialStep[];
    selectedMarker?: MapTutorialMarkerInfo | null;
    onStepChange: (stepIndex: number) => void;
    onClose: (reason: 'skip' | 'done') => void;
}) {
    if (!open || steps.length === 0) return null;

    const safeIndex = Math.min(Math.max(stepIndex, 0), steps.length - 1);
    const step = steps[safeIndex];
    const isFirst = safeIndex === 0;
    const isLast = safeIndex === steps.length - 1;
    const showSelectedMarker = step.id === 'markers' && selectedMarker;
    const gestureCueStyle = gestureCueStyleByStep[step.id];

    return (
        <div
            className="pointer-events-none fixed inset-0 z-[80]"
            role="region"
            aria-label="맵 튜토리얼"
            aria-labelledby="map-tutorial-title"
            aria-describedby="map-tutorial-description"
        >
            <div
                aria-hidden
                className="absolute inset-0 animate-[map-tutorial-full-dim_680ms_ease-out_forwards] bg-black/58 backdrop-blur-[2px]"
            />

            <div
                aria-hidden
                data-map-tutorial-spotlight
                className="absolute animate-[map-tutorial-spotlight-reveal_680ms_180ms_ease-out_both] rounded-[999px] shadow-[0_0_0_9999px_rgba(0,0,0,0.58)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={spotlightScopeStyleByStep[step.id]}
            />

            {gestureCueStyle && (
                <div
                    aria-hidden
                    className="absolute z-[5] animate-[map-tutorial-spotlight-reveal_680ms_260ms_ease-out_both]"
                    style={gestureCueStyle}
                >
                    <GestureCue
                        direction={step.id === 'deck' ? 'up' : 'right'}
                    />
                </div>
            )}

            <style>{`
                @keyframes map-tutorial-full-dim {
                    0% { opacity: 1; }
                    45% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes map-tutorial-spotlight-reveal {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}</style>

            <section
                className={`pointer-events-auto absolute rounded-[1.75rem] border border-brand-100/80 bg-white/92 p-4 text-foreground shadow-[0_20px_60px_rgba(15,23,42,0.18)] ring-1 ring-black/5 backdrop-blur-xl ${panelClassNameByStep[step.id]}`}
            >
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                            {step.eyebrow}
                        </p>
                        <h2
                            id="map-tutorial-title"
                            className="mt-1 text-lg font-bold leading-snug"
                        >
                            {step.title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => onClose('skip')}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-brand-50 hover:text-primary"
                        aria-label="튜토리얼 닫기"
                    >
                        <IconX size={17} stroke={2} />
                    </button>
                </div>

                <p
                    id="map-tutorial-description"
                    className="text-sm leading-6 text-text-secondary"
                >
                    {step.description}
                </p>

                {showSelectedMarker && (
                    <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/70 px-3 py-2">
                        <p className="text-sm font-bold text-foreground">
                            {selectedMarker.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">
                            {selectedMarker.description}
                        </p>
                    </div>
                )}

                <div className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-primary ring-1 ring-brand-100">
                    {showSelectedMarker ? '다른 마커도 눌러보세요' : step.hint}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5" aria-hidden>
                        {steps.map((item, index) => (
                            <span
                                key={item.id}
                                className={`h-1.5 rounded-full transition-all ${
                                    index === safeIndex
                                        ? 'w-5 bg-primary'
                                        : 'w-1.5 bg-border-soft'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onClose('skip')}
                            className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            스킵
                        </button>
                        {!isFirst && (
                            <button
                                type="button"
                                onClick={() => onStepChange(safeIndex - 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-transform active:scale-95"
                                aria-label="이전 도움말"
                            >
                                <IconChevronLeft size={18} stroke={2} />
                            </button>
                        )}
                        {step.id !== 'deck' && step.id !== 'card' && (
                            <button
                                type="button"
                                onClick={() =>
                                    isLast
                                        ? onClose('done')
                                        : onStepChange(safeIndex + 1)
                                }
                                className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-95"
                            >
                                {isLast ? '시작하기' : '다음'}
                                {!isLast && (
                                    <IconChevronRight size={17} stroke={2} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function GestureCue({ direction }: { direction: 'up' | 'right' }) {
    const isUp = direction === 'up';

    return (
        <div
            className={`pointer-events-none relative ${
                isUp ? 'h-28 w-14' : 'h-14 w-52'
            }`}
        >
            <span
                className={`absolute h-12 w-12 ${
                    isUp
                        ? 'left-1/2 bottom-3 -translate-x-1/2 animate-[map-tutorial-dot-up_1.25s_ease-in-out_infinite]'
                        : 'left-3 top-1/2 -translate-y-1/2 animate-[map-tutorial-dot-right_1.45s_ease-in-out_infinite]'
                }`}
            >
                <span className="absolute inset-0 rounded-full bg-white/72 shadow-[0_8px_28px_rgba(15,23,42,0.18)] ring-1 ring-primary/15 backdrop-blur-sm" />
                <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_22px_rgba(20,184,166,0.5)]" />
            </span>
            <style>{`
                @keyframes map-tutorial-dot-up {
                    0% { transform: translate(-50%, 0); opacity: 0.95; }
                    72% { transform: translate(-50%, -4.2rem); opacity: 0.95; }
                    100% { transform: translate(-50%, -4.2rem); opacity: 0; }
                }
                @keyframes map-tutorial-dot-right {
                    0% { transform: translate(0, -50%); opacity: 0.95; }
                    72% { transform: translate(10rem, -50%); opacity: 0.95; }
                    100% { transform: translate(10rem, -50%); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
