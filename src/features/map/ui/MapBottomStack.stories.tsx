import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { MapBottomStack, MapBottomStackPeek } from './MapBottomStack';
import { PersonaInfoCard } from './PersonaInfoCard';

const MapStage = ({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) => (
    <div className={dark ? 'dark' : ''}>
        <div className="relative h-[640px] w-[400px] overflow-hidden bg-map-bg">
            <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground/60">
                (map canvas)
            </div>
            {children}
        </div>
    </div>
);

const meta = {
    title: 'Features/Map/MapBottomStack',
    component: MapBottomStack,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MapBottomStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PeekOnly: Story = {
    render: () => (
        <MapStage>
            <MapBottomStack
                peek={<MapBottomStackPeek count={12} />}
                onPeekClickAction={() => {}}
            />
        </MapStage>
    ),
};

export const WithUserCard: Story = {
    render: () => (
        <MapStage>
            <MapBottomStack
                peek={<MapBottomStackPeek count={12} />}
                onPeekClickAction={() => {}}
            >
                <PersonaInfoCard
                    key="p1"
                    name="민지"
                    variant="user"
                    profileImageUrl="https://i.pravatar.cc/80?img=5"
                    role="서포터"
                    tags={['요가', '필라테스']}
                />
            </MapBottomStack>
        </MapStage>
    ),
};

export const WithAiCard: Story = {
    render: () => (
        <MapStage>
            <MapBottomStack
                peek={<MapBottomStackPeek count={12} />}
                onPeekClickAction={() => {}}
            >
                <PersonaInfoCard
                    key="p1"
                    name="GPT Persona"
                    variant="ai"
                    emoji="🧘"
                    role="AI 페르소나"
                    tags={['요가', '명상']}
                />
            </MapBottomStack>
        </MapStage>
    ),
};

export const StackedMultiple: Story = {
    render: () => (
        <MapStage>
            <MapBottomStack
                peek={<MapBottomStackPeek count={12} />}
                onPeekClickAction={() => {}}
            >
                <PersonaInfoCard
                    key="p1"
                    name="민지"
                    variant="user"
                    profileImageUrl="https://i.pravatar.cc/80?img=5"
                    role="서포터"
                    tags={['요가']}
                />
                <PersonaInfoCard
                    key="p2"
                    name="GPT Persona"
                    variant="ai"
                    emoji="💻"
                    role="AI"
                    tags={['코딩', '스터디']}
                />
            </MapBottomStack>
        </MapStage>
    ),
};

function InteractiveStack() {
    const [cards, setCards] = useState<
        Array<{ id: string; name: string; variant: 'user' | 'ai' }>
    >([]);
    const samples = [
        { id: 'a', name: '민지', variant: 'user' as const },
        { id: 'b', name: 'GPT', variant: 'ai' as const },
        { id: 'c', name: '서연', variant: 'user' as const },
        { id: 'd', name: 'Claude', variant: 'ai' as const },
    ];

    return (
        <MapStage>
            <div className="absolute left-3 top-3 z-50 flex flex-col gap-1 pointer-events-auto">
                {samples.map((s) => {
                    const exists = cards.find((c) => c.id === s.id);
                    return (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                                setCards((prev) =>
                                    exists
                                        ? prev.filter((c) => c.id !== s.id)
                                        : [...prev, s],
                                )
                            }
                            className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-bold text-background shadow"
                        >
                            {exists ? '− ' : '+ '}
                            {s.name}
                        </button>
                    );
                })}
            </div>
            <MapBottomStack
                peek={<MapBottomStackPeek count={12} />}
                onPeekClickAction={() => {}}
            >
                {cards.map((c) => (
                    <PersonaInfoCard
                        key={c.id}
                        name={c.name}
                        variant={c.variant}
                        emoji={c.variant === 'ai' ? '🤖' : undefined}
                        profileImageUrl={
                            c.variant === 'user'
                                ? `https://i.pravatar.cc/80?u=${c.id}`
                                : undefined
                        }
                        role={c.variant === 'ai' ? 'AI' : '서포터'}
                        onCloseAction={() =>
                            setCards((prev) =>
                                prev.filter((x) => x.id !== c.id),
                            )
                        }
                    />
                ))}
            </MapBottomStack>
        </MapStage>
    );
}

export const InteractivePushPop: Story = {
    render: () => <InteractiveStack />,
};

export const DarkStacked: Story = {
    render: () => (
        <MapStage dark>
            <MapBottomStack
                peek={<MapBottomStackPeek count={12} />}
                onPeekClickAction={() => {}}
            >
                <PersonaInfoCard
                    key="p1"
                    name="민지"
                    variant="user"
                    profileImageUrl="https://i.pravatar.cc/80?img=5"
                    role="서포터"
                    tags={['요가']}
                />
                <PersonaInfoCard
                    key="p2"
                    name="GPT Persona"
                    variant="ai"
                    emoji="💻"
                    role="AI"
                    tags={['코딩']}
                />
            </MapBottomStack>
        </MapStage>
    ),
};
