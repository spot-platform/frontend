import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonaDotMarker } from './PersonaDotMarker';

const Stage = ({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) => (
    <div className={dark ? 'dark' : ''}>
        <div className="relative flex h-[120px] w-[200px] items-center justify-center bg-map-bg">
            <div className="absolute left-1/2 top-1/2">{children}</div>
        </div>
    </div>
);

const meta = {
    title: 'Features/MapV3/PersonaDotMarker',
    component: PersonaDotMarker,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PersonaDotMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightMoving: Story = {
    args: {
        persona: { id: 'default', emoji: '📍', name: 'default' },
    },
    render: () => (
        <Stage>
            <PersonaDotMarker
                persona={{ id: 'p1', emoji: '📚', name: '수빈' }}
                moving
            />
        </Stage>
    ),
};

export const LightIdle: Story = {
    args: {
        persona: { id: 'default', emoji: '📍', name: 'default' },
    },
    render: () => (
        <Stage>
            <PersonaDotMarker
                persona={{ id: 'p2', emoji: '🎵', name: '하연' }}
            />
        </Stage>
    ),
};

export const DarkMoving: Story = {
    args: {
        persona: { id: 'default', emoji: '📍', name: 'default' },
    },
    render: () => (
        <Stage dark>
            <PersonaDotMarker
                persona={{ id: 'p3', emoji: '🤝', name: '현우' }}
                moving
            />
        </Stage>
    ),
};

export const DarkIdle: Story = {
    args: {
        persona: { id: 'default', emoji: '📍', name: 'default' },
    },
    render: () => (
        <Stage dark>
            <PersonaDotMarker
                persona={{ id: 'p4', emoji: '🎨', name: '서연' }}
            />
        </Stage>
    ),
};
