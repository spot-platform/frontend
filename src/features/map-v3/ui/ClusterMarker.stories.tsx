import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ActivityCluster, PersonaRef } from '../model/types';
import { ClusterMarker } from './ClusterMarker';

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
        id: 'cluster-story',
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
        <div className="relative flex h-[240px] w-[320px] items-center justify-center bg-map-bg">
            <div className="absolute left-1/2 top-1/2">{children}</div>
        </div>
    </div>
);

const meta = {
    title: 'Features/MapV3/ClusterMarker',
    component: ClusterMarker,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ClusterMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightIdle3: Story = {
    args: {
        cluster: makeCluster(makePersonas(0)),
        selected: false,
        onSelectAction: () => {},
    },
    render: () => (
        <Stage>
            <ClusterMarker
                cluster={makeCluster(makePersonas(3))}
                selected={false}
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const LightSelected5: Story = {
    args: {
        cluster: makeCluster(makePersonas(0)),
        selected: false,
        onSelectAction: () => {},
    },
    render: () => (
        <Stage>
            <ClusterMarker
                cluster={makeCluster(makePersonas(5), { category: '코딩' })}
                selected
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const LightSelectedPulse8: Story = {
    args: {
        cluster: makeCluster(makePersonas(0)),
        selected: false,
        onSelectAction: () => {},
    },
    render: () => (
        <Stage>
            <ClusterMarker
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
    args: {
        cluster: makeCluster(makePersonas(0)),
        selected: false,
        onSelectAction: () => {},
    },
    render: () => (
        <Stage dark>
            <ClusterMarker
                cluster={makeCluster(makePersonas(3))}
                selected={false}
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const DarkSelected5: Story = {
    args: {
        cluster: makeCluster(makePersonas(0)),
        selected: false,
        onSelectAction: () => {},
    },
    render: () => (
        <Stage dark>
            <ClusterMarker
                cluster={makeCluster(makePersonas(5), { category: '코딩' })}
                selected
                onSelectAction={() => {}}
            />
        </Stage>
    ),
};

export const DarkSelectedPulse8: Story = {
    args: {
        cluster: makeCluster(makePersonas(0)),
        selected: false,
        onSelectAction: () => {},
    },
    render: () => (
        <Stage dark>
            <ClusterMarker
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
