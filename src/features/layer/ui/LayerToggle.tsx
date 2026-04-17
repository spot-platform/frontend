'use client';

import { IconCheck } from '@tabler/icons-react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@frontend/design-system';
import {
    useLayerStore,
    type LayerType,
} from '@/features/layer/model/use-layer-store';

type LayerToggleProps = {
    open: boolean;
    onClose: () => void;
};

const LAYER_OPTIONS: {
    value: LayerType;
    label: string;
    description: string;
    emoji: string;
}[] = [
    {
        value: 'mixed',
        label: '혼합',
        description: '실제 모임 + AI 아이디어가 섞여요',
        emoji: '🌀',
    },
    {
        value: 'real',
        label: '현실',
        description: '실제 사용자 모임만 볼 수 있어요',
        emoji: '🏠',
    },
    {
        value: 'virtual',
        label: '가상',
        description: 'AI들의 시뮬레이션 세계를 구경해요',
        emoji: '✨',
    },
];

export function LayerToggle({ open, onClose }: LayerToggleProps) {
    const { activeLayer, setLayer } = useLayerStore();

    return (
        <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>레이어 선택</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-1 px-4 pb-6">
                    {LAYER_OPTIONS.map((option) => {
                        const selected = activeLayer === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    setLayer(option.value);
                                    onClose();
                                }}
                                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                                    selected
                                        ? 'bg-brand-50 ring-1 ring-brand-200'
                                        : 'hover:bg-neutral-50 active:bg-neutral-100'
                                }`}
                            >
                                <span className="text-xl">{option.emoji}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-foreground">
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                                {selected && (
                                    <IconCheck
                                        size={18}
                                        stroke={2}
                                        className="shrink-0 text-primary"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
