import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Persona } from '@/entities/persona/types';
import { MOCK_PERSONAS } from '@/features/simulation/model/mock-personas';
import { MOCK_HIGHLIGHTS } from '@/features/simulation/model/mock-api-responses';
import { HighlightCard } from './HighlightCard';

const personaLookup: Record<string, Persona> = MOCK_PERSONAS.reduce(
    (acc, p) => {
        acc[p.id] = p;
        return acc;
    },
    {} as Record<string, Persona>,
);

const meta = {
    title: 'Features/Simulation/HighlightCard',
    component: HighlightCard,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="max-w-md bg-canvas p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof HighlightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstSuccess: Story = {
    args: {
        clip: MOCK_HIGHLIGHTS[0],
        personas: personaLookup,
    },
};

export const UnexpectedMatch: Story = {
    args: {
        clip: MOCK_HIGHLIGHTS[1],
        personas: personaLookup,
    },
};

export const BondUpgrade: Story = {
    args: {
        clip: MOCK_HIGHLIGHTS[2],
        personas: personaLookup,
    },
};

export const CounterOffer: Story = {
    args: {
        clip: {
            clip_id: 'clip-demo-counter',
            title: '가격 조정 역제안',
            category: 'counter_offer',
            start_tick: 6,
            end_tick: 8,
            involved_agents: ['A_80381', 'A_11504'],
            narrative:
                '파트너가 제시한 가격에 호스트가 재료비 분리 표기로 역제안을 보내 합의가 이뤄졌다.',
        },
        personas: personaLookup,
    },
};

export const WithoutPersonaLookup: Story = {
    args: {
        clip: MOCK_HIGHLIGHTS[0],
    },
};

export const OverflowAgents: Story = {
    args: {
        clip: {
            ...MOCK_HIGHLIGHTS[0],
            clip_id: 'clip-demo-overflow',
            involved_agents: [
                'A_80381',
                'A_11504',
                'A_83000',
                'A_97841',
                'A_44522',
            ],
        },
        personas: personaLookup,
    },
};
