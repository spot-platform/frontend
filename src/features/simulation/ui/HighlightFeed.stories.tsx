import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Persona } from '@/entities/persona/types';
import { MOCK_PERSONAS } from '@/features/simulation/model/mock-personas';
import { MOCK_HIGHLIGHTS } from '@/features/simulation/model/mock-api-responses';
import { HighlightFeed } from './HighlightFeed';

const personaLookup: Record<string, Persona> = MOCK_PERSONAS.reduce(
    (acc, p) => {
        acc[p.id] = p;
        return acc;
    },
    {} as Record<string, Persona>,
);

const meta = {
    title: 'Features/Simulation/HighlightFeed',
    component: HighlightFeed,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="max-w-md bg-canvas p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof HighlightFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        clips: MOCK_HIGHLIGHTS,
        personas: personaLookup,
    },
};

export const WithoutPersonas: Story = {
    args: {
        clips: MOCK_HIGHLIGHTS,
    },
};

export const Empty: Story = {
    args: {
        clips: [],
    },
};

export const EmptyCustomMessage: Story = {
    args: {
        clips: [],
        emptyMessage: '시뮬레이션을 시작하면 하이라이트가 여기 쌓여요.',
    },
};
