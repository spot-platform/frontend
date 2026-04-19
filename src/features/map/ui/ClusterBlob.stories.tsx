import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect, useState } from 'react';
import type { ActivityCluster, PersonaRef } from '../model/types';
import { ClusterBlob, type AbsorbingDot } from './ClusterBlob';

const ABSORPTION_SEEDS: AbsorbingDot[] = [
    { id: 'a', fromX: -1, fromY: -0.9, progress: 0 },
    { id: 'b', fromX: 1.1, fromY: -0.6, progress: 0 },
    { id: 'c', fromX: -0.9, fromY: 0.9, progress: 0 },
    { id: 'd', fromX: 0.8, fromY: 1, progress: 0 },
    { id: 'e', fromX: 1.2, fromY: 0.2, progress: 0 },
];

function makePersonas(count: number): PersonaRef[] {
    const pool: PersonaRef[] = [
        { id: 'p1', emoji: '🏃', name: '민지' },
        { id: 'p2', emoji: '🧘', name: '서연' },
        { id: 'p3', emoji: '💻', name: '지훈' },
        { id: 'p4', emoji: '🥾', name: '현우' },
        { id: 'p5', emoji: '🎨', name: '수빈' },
        { id: 'p6', emoji: '🎵', name: '하연' },
        { id: 'p7', emoji: '☕', name: '도윤' },
        { id: 'p8', emoji: '📚', name: '예린' },
    ];
    return pool.slice(0, count);
}

function makeCluster(
    personas: PersonaRef[],
    overrides: Partial<ActivityCluster> = {},
): ActivityCluster {
    return {
        id: 'cluster-blob-story',
        centerCoord: { lat: 37.2636, lng: 127.0286 },
        category: '요가',
        intent: 'offer',
        personas,
        ...overrides,
    };
}

const Stage = ({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) => (
    <div className={dark ? 'dark' : ''}>
        <div className="relative flex h-[280px] w-[360px] items-center justify-center bg-map-bg">
            <div className="absolute left-1/2 top-1/2">{children}</div>
        </div>
    </div>
);

const meta = {
    title: 'Features/Map/ClusterBlob',
    component: ClusterBlob,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ClusterBlob>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
    cluster: makeCluster(makePersonas(0)),
    selected: false,
    onSelectAction: () => {},
};

export const LightIdle3: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <ClusterBlob
                cluster={makeCluster(makePersonas(3))}
                selected={false}
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const LightSelected5: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <ClusterBlob
                cluster={makeCluster(makePersonas(5), { category: '코딩' })}
                selected
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const LightSelectedPulse8: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <ClusterBlob
                cluster={makeCluster(makePersonas(8), {
                    category: '등산',
                    isPulse: true,
                })}
                selected
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const DarkIdle3: Story = {
    args: baseArgs,
    render: () => (
        <Stage dark>
            <ClusterBlob
                cluster={makeCluster(makePersonas(3))}
                selected={false}
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const DarkSelectedPulse8: Story = {
    args: baseArgs,
    render: () => (
        <Stage dark>
            <ClusterBlob
                cluster={makeCluster(makePersonas(8), {
                    category: '등산',
                    isPulse: true,
                })}
                selected
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

type AbsorptionDemoProps = { dark?: boolean };

function AbsorptionDemo({ dark }: AbsorptionDemoProps) {
    const [absorbing, setAbsorbing] =
        useState<AbsorbingDot[]>(ABSORPTION_SEEDS);
    const [tick, setTick] = useState(0);
    const [absorbedCount, setAbsorbedCount] = useState(0);

    useEffect(() => {
        const start = performance.now();
        const duration = 1600;
        let raf = 0;
        const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = t * t * (3 - 2 * t);
            setAbsorbing(
                ABSORPTION_SEEDS.map((dot, i) => ({
                    ...dot,
                    progress: Math.min(1, Math.max(0, eased - i * 0.04)),
                })),
            );
            if (t < 1) {
                raf = requestAnimationFrame(step);
            } else {
                setAbsorbedCount((c) => c + ABSORPTION_SEEDS.length);
            }
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [tick]);

    const cluster = makeCluster(makePersonas(3 + absorbedCount), {
        category: '요가',
    });

    return (
        <div className={dark ? 'dark' : ''}>
            <div className="relative flex h-[360px] w-[420px] flex-col items-center justify-center gap-3 bg-map-bg">
                <div className="relative h-[280px] w-full">
                    <div className="absolute left-1/2 top-1/2">
                        <ClusterBlob
                            cluster={cluster}
                            selected
                            onSelectAction={() => {}}
                            absorbing={absorbing.filter((d) => d.progress < 1)}
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setAbsorbing(
                            ABSORPTION_SEEDS.map((d) => ({
                                ...d,
                                progress: 0,
                            })),
                        );
                        setTick((n) => n + 1);
                    }}
                    className="rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background shadow"
                >
                    흡수 재생
                </button>
            </div>
        </div>
    );
}

export const AbsorptionLight: Story = {
    args: baseArgs,
    render: () => <AbsorptionDemo />,
};

export const AbsorptionDark: Story = {
    args: baseArgs,
    render: () => <AbsorptionDemo dark />,
};
