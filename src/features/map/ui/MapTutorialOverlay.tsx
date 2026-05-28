'use client';

import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react';

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
    deck: 'left-5 right-5 top-[calc(env(safe-area-inset-top)+5rem)] sm:left-1/2 sm:right-auto sm:top-[calc(env(safe-area-inset-top)+3rem)] sm:w-[420px] sm:-translate-x-1/2',
    card: 'left-5 right-5 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:left-1/2 sm:right-auto sm:w-[460px] sm:-translate-x-1/2',
    controls:
        'left-5 right-5 bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:left-6 sm:right-auto sm:w-[420px]',
};

const spotlightScopeClassNameByStep: Record<MapTutorialStep['id'], string> = {
    markers:
        'left-1/2 top-[29dvh] h-[17rem] w-[23rem] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 sm:h-[20rem] sm:w-[28rem]',
    deck: 'left-1/2 bottom-[1.5rem] h-[18rem] w-[28rem] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 sm:bottom-[1rem] sm:h-[14rem] sm:w-[36rem]',
    card: 'left-1/2 top-[32dvh] h-[18rem] w-[24rem] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 sm:h-[14rem] sm:w-[30rem]',
    controls:
        'right-[0.5rem] top-[calc(env(safe-area-inset-top)+7.5rem)] h-[20rem] w-[7.5rem] sm:right-[1rem] sm:h-[22rem] sm:w-[8.5rem]',
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
        title: '관심 있는 피드는 카드 제스처로 빠르게 정리해요.',
        description:
            '올라온 카드를 왼쪽으로 밀면 저장 흐름을 체험할 수 있어요. 피드를 살펴보다가 마음에 드는 활동을 빠르게 남겨보세요.',
        hint: '카드를 왼쪽으로 스와이프',
    },
    {
        id: 'controls',
        eyebrow: '빠른 버튼',
        title: '오른쪽 버튼으로 맵을 빠르게 조정할 수 있어요.',
        description:
            '피드 타입 전환, 내 위치 이동, 목록 보기, 레이어 전환을 오른쪽 버튼에서 바로 사용할 수 있어요. 필요할 때 지도를 이동하지 않고 원하는 보기로 바꿔보세요.',
        hint: '필터 · 위치 · 목록 · 레이어',
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
                className={`absolute rounded-[999px] shadow-[0_0_0_9999px_rgba(0,0,0,0.66)] ${spotlightScopeClassNameByStep[step.id]}`}
            />

            <section
                className={`pointer-events-auto absolute rounded-[1.75rem] bg-black/55 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/15 backdrop-blur-xl ${panelClassNameByStep[step.id]}`}
            >
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
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
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
                        aria-label="튜토리얼 닫기"
                    >
                        <IconX size={17} stroke={2} />
                    </button>
                </div>

                <p
                    id="map-tutorial-description"
                    className="text-sm leading-6 text-white/85"
                >
                    {step.description}
                </p>

                {showSelectedMarker && (
                    <div className="mt-4 border-l-2 border-white/60 pl-3">
                        <p className="text-sm font-bold text-white">
                            {selectedMarker.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-white/85">
                            {selectedMarker.description}
                        </p>
                    </div>
                )}

                <div className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm">
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
                                        : 'w-1.5 bg-white/35'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onClose('skip')}
                            className="rounded-full px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/15 hover:text-white"
                        >
                            스킵
                        </button>
                        {!isFirst && (
                            <button
                                type="button"
                                onClick={() => onStepChange(safeIndex - 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-transform active:scale-95"
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
                                className="inline-flex h-9 items-center gap-1 rounded-full bg-white px-4 text-sm font-semibold text-black transition-transform active:scale-95"
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
