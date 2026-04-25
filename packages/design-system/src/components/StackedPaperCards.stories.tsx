import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Button } from './Button';
import {
    StackedPaperCards,
    type StackedPaperCardItem,
} from './StackedPaperCards';

const baseCards: StackedPaperCardItem[] = [
    {
        id: 'stay',
        eyebrow: 'Planner',
        title: 'Sunday repair circle',
        subtitle: 'Shared tools, quick triage, and a clear pickup window.',
        meta: 'Arrives first',
        tone: 'neutral',
    },
    {
        id: 'swap',
        eyebrow: 'Offer',
        title: 'Three-seat cooking table',
        subtitle:
            'Ingredients are set, the timing is short, and the notes stay visible.',
        meta: 'Settles second',
        tone: 'brand',
    },
    {
        id: 'match',
        eyebrow: 'Request',
        title: 'Language exchange hour',
        subtitle:
            'Portrait paper, soft edge, and a tighter overlap for the final pile.',
        meta: 'Top card',
        tone: 'accent',
    },
];

const denseCards: StackedPaperCardItem[] = [
    ...baseCards,
    {
        id: 'notes',
        eyebrow: 'Brief',
        title: 'Morning walking route',
        subtitle: 'A quieter card to deepen the stack without stealing focus.',
        meta: 'Layer four',
        tone: 'neutral',
    },
    {
        id: 'share',
        eyebrow: 'Invite',
        title: 'Garden swap list',
        subtitle:
            'A smaller rotation keeps the pile believable on mobile previews.',
        meta: 'Layer five',
        tone: 'brand',
    },
];

function StoryStage({
    children,
    dark = false,
}: {
    children: ReactNode;
    dark?: boolean;
}) {
    return (
        <div className={dark ? 'dark' : ''}>
            <div className="relative flex min-h-[42rem] w-[24rem] items-end justify-center overflow-hidden rounded-[2rem] border border-border-soft/70 bg-[linear-gradient(180deg,var(--color-background)_0%,var(--color-canvas)_100%)] px-6 pb-6 pt-10 shadow-lg">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-5 bottom-3 h-28 rounded-[1.75rem] border border-border-soft/60 bg-panel/70 shadow-sm"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-8 bottom-2 h-24 rounded-full bg-foreground/8 blur-3xl"
                />

                <div className="relative z-10">{children}</div>
            </div>
        </div>
    );
}

function StoryFrame({
    args,
    dark = false,
    helperText,
}: {
    args: ComponentProps<typeof StackedPaperCards>;
    dark?: boolean;
    helperText?: string;
}) {
    const [replayKey, setReplayKey] = useState(0);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setReplayKey((value) => value + 1)}
                >
                    다시 재생
                </Button>
                {helperText && (
                    <p className="max-w-xs text-center text-xs leading-5 text-muted-foreground">
                        {helperText}
                    </p>
                )}
            </div>

            <StoryStage dark={dark}>
                <StackedPaperCards
                    key={`${dark ? 'dark' : 'light'}-${replayKey}-${args.cards.length}-${args.overlap}-${args.rotation}-${args.dropDistance}-${args.defaultFocused ? 'focused' : 'teaser'}`}
                    {...args}
                />
            </StoryStage>
        </div>
    );
}

const meta = {
    title: 'Design System/StackedPaperCards',
    component: StackedPaperCards,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        cards: { control: false },
        className: { control: false },
        cardClassName: { control: false },
        overlap: {
            control: { type: 'range', min: 12, max: 28, step: 1 },
        },
        rotation: {
            control: { type: 'range', min: 1.2, max: 4.5, step: 0.1 },
        },
        dropDistance: {
            control: { type: 'range', min: 48, max: 180, step: 6 },
        },
        defaultFocused: {
            control: 'boolean',
        },
    },
    render: (args) => (
        <StoryFrame
            args={args}
            helperText="맨 위 teaser 카드를 클릭하거나 위로 끌면 다음 카드가 raised area 에 한 장씩 쌓입니다. 아래로 한 번 끌거나 ArrowDown 을 누르면 올린 카드가 모두 teaser pile 로 돌아갑니다."
        />
    ),
    args: {
        cards: baseCards,
        overlap: 18,
        rotation: 2.8,
        dropDistance: 132,
        defaultFocused: false,
    },
} satisfies Meta<typeof StackedPaperCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BottomTeaser: Story = {
    name: 'Bottom teaser',
};

export const SwipeUpFocus: Story = {
    name: 'Progressive raise',
    render: (args) => (
        <StoryFrame
            args={args}
            helperText="같은 타겟에서 위로 반복 입력하면 포커스가 새 active 카드로 이어지고, 다음 teaser 카드가 계속 승격되며 raised stack 위에 새 카드가 겹쳐집니다."
        />
    ),
    args: {
        cards: denseCards,
        overlap: 15,
        rotation: 2.4,
        dropDistance: 144,
    },
};

export const FocusedStart: Story = {
    name: 'Focused start',
    render: (args) => (
        <StoryFrame
            args={args}
            helperText="defaultFocused 는 호환용으로 첫 승격 단계만 미리 시작합니다. 여기서 다시 위로 올리면 다음 teaser 카드가 이어서 쌓입니다."
        />
    ),
    args: {
        cards: baseCards,
        defaultFocused: true,
    },
};

export const DensePile: Story = {
    render: (args) => (
        <StoryFrame
            args={args}
            helperText="카드 수가 늘어나도 올린 묶음은 위쪽에 누적되고, 한 번의 downward action 으로 전체가 함께 접힙니다."
        />
    ),
    args: {
        cards: denseCards,
        overlap: 16,
        rotation: 2.4,
        dropDistance: 144,
    },
};

export const DarkSurface: Story = {
    render: (args) => (
        <StoryFrame
            args={args}
            dark
            helperText="다크 서피스에서도 multi-step raise 와 one-shot collapse 비율이 그대로 유지됩니다."
        />
    ),
    args: {
        cards: denseCards,
        overlap: 17,
        rotation: 2.2,
        dropDistance: 120,
        defaultFocused: true,
    },
};
