import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonaDotMarkerBlob } from './PersonaDotMarkerBlob';

const Stage = ({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) => (
    <div className={dark ? 'dark' : ''}>
        <div className="relative flex h-25 w-70 items-center justify-center bg-map-bg">
            <div className="absolute left-1/2 top-1/2">{children}</div>
        </div>
    </div>
);

const meta = {
    title: 'Features/Map/PersonaDotMarkerBlob',
    component: PersonaDotMarkerBlob,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PersonaDotMarkerBlob>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
    name: '민지',
    variant: 'user' as const,
};

export const UserDotIdle: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <PersonaDotMarkerBlob name="민지" variant="user" />
        </Stage>
    ),
};

export const UserDotMoving: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <PersonaDotMarkerBlob name="민지" variant="user" moving />
        </Stage>
    ),
};

export const UserDotExpanded: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <PersonaDotMarkerBlob
                name="민지"
                variant="user"
                profileImageUrl="https://i.pravatar.cc/80?img=5"
                expanded
            />
        </Stage>
    ),
};

export const AiDotIdle: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <PersonaDotMarkerBlob name="GPT Persona" variant="ai" />
        </Stage>
    ),
};

export const AiDotExpanded: Story = {
    args: baseArgs,
    render: () => (
        <Stage>
            <PersonaDotMarkerBlob
                name="GPT Persona"
                variant="ai"
                emoji="🧘"
                expanded
            />
        </Stage>
    ),
};

export const MixedCrowd: Story = {
    args: baseArgs,
    render: () => (
        <div className="relative h-55 w-90 overflow-hidden bg-map-bg">
            {[
                { x: 60, y: 40, v: 'user', name: '민지', img: 'img=5' },
                { x: 120, y: 80, v: 'ai', name: 'GPT', emoji: '💻' },
                { x: 180, y: 50, v: 'user', name: '서연', img: 'img=12' },
                { x: 220, y: 110, v: 'ai', name: 'Claude', emoji: '🎨' },
                { x: 90, y: 140, v: 'user', name: '지훈', img: 'img=14' },
                { x: 260, y: 170, v: 'ai', name: 'Mini', emoji: '🧘' },
                { x: 160, y: 170, v: 'user', name: '수빈', img: 'img=32' },
                { x: 300, y: 60, v: 'user', name: '하연', img: 'img=47' },
                { x: 40, y: 180, v: 'ai', name: 'Agent', emoji: '☕' },
            ].map((d, i) => (
                <div
                    key={i}
                    className="absolute"
                    style={{ left: d.x, top: d.y }}
                >
                    <PersonaDotMarkerBlob
                        name={d.name}
                        variant={d.v as 'user' | 'ai'}
                        emoji={d.emoji}
                        profileImageUrl={
                            d.img
                                ? `https://i.pravatar.cc/80?${d.img}`
                                : undefined
                        }
                    />
                </div>
            ))}
        </div>
    ),
};

export const DarkUserDotExpanded: Story = {
    args: baseArgs,
    render: () => (
        <Stage dark>
            <PersonaDotMarkerBlob
                name="민지"
                variant="user"
                profileImageUrl="https://i.pravatar.cc/80?img=5"
                expanded
            />
        </Stage>
    ),
};

export const DarkAiDotExpanded: Story = {
    args: baseArgs,
    render: () => (
        <Stage dark>
            <PersonaDotMarkerBlob
                name="GPT Persona"
                variant="ai"
                emoji="🧘"
                expanded
            />
        </Stage>
    ),
};
