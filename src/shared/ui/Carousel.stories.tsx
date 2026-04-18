import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Carousel } from './Carousel';

const meta = {
    title: 'Shared/UI/Carousel',
    component: Carousel,
    decorators: [
        (Story) => (
            <div className="bg-card py-6 max-w-sm mx-auto">
                <Story />
            </div>
        ),
    ],
    parameters: { layout: 'centered' },
    argTypes: {
        cardWidth: { control: 'radio', options: ['full', 'peek'] },
    },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

// 샘플 카드 콘텐츠들
function SampleCard({ label, color }: { label: string; color: string }) {
    return (
        <div
            className={`flex h-40 items-center justify-center rounded-xl text-primary-foreground font-bold text-lg ${color}`}
        >
            {label}
        </div>
    );
}

function FeedStyleCard({
    title,
    sub,
    pct,
}: {
    title: string;
    sub: string;
    pct: number;
}) {
    return (
        <div className="rounded-xl border border-border-soft bg-card p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground line-clamp-2">
                {title}
            </p>
            <p className="text-xs text-muted-foreground">{sub}</p>
            <div className="mt-auto">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{pct}% 달성</span>
                    <span className="font-bold text-primary">
                        {100 - pct}% 남음
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function PollStyleCard({
    question,
    options,
}: {
    question: string;
    options: string[];
}) {
    return (
        <div className="rounded-xl border border-border-soft bg-card p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">{question}</p>
            <div className="flex flex-col gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        className="rounded-lg border border-border-soft py-2 text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

// 스토리

export const Default: Story = {
    args: {
        cardWidth: 'peek',
        children: [
            <SampleCard key="1" label="카드 1" color="bg-teal-700" />,
            <SampleCard key="2" label="카드 2" color="bg-gray-700" />,
            <SampleCard key="3" label="카드 3" color="bg-emerald-700" />,
        ],
    },
};

export const FullWidth: Story = {
    args: {
        cardWidth: 'full',
        children: [
            <SampleCard key="1" label="전체 너비 카드 1" color="bg-teal-700" />,
            <SampleCard key="2" label="전체 너비 카드 2" color="bg-gray-700" />,
            <SampleCard
                key="3"
                label="전체 너비 카드 3"
                color="bg-emerald-700"
            />,
        ],
    },
};

export const FeedCards: Story = {
    args: {
        cardWidth: 'peek',
        children: [
            <FeedStyleCard
                key="1"
                title="홈카페 클래스 — 원두 선택부터 라떼 아트까지"
                sub="마포구 합정동 · 건강한삶"
                pct={91}
            />,
            <FeedStyleCard
                key="2"
                title="기초 우쿨렐레 배워요 — 악보 못 봐도 괜찮아요"
                sub="송파구 잠실동 · 차한잔"
                pct={28}
            />,
            <FeedStyleCard
                key="3"
                title="필라테스 소모임 — 매주 토요일 오전"
                sub="강서구 방화동 · 위스키러버"
                pct={73}
            />,
        ],
    },
};

export const PollCards: Story = {
    args: {
        cardWidth: 'peek',
        children: [
            <PollStyleCard
                key="p1"
                question="홈카페 클래스 열리면 참여할래요?"
                options={['네, 꼭!', '관심만 있어요', '아니요']}
            />,
            <PollStyleCard
                key="p2"
                question="기타 배우고 싶은데 악기가 없어서 못하고 있나요?"
                options={[
                    '네, 그게 문제예요',
                    '빌리면 될 것 같아요',
                    '악기 있어요',
                ]}
            />,
            <PollStyleCard
                key="p3"
                question="또래 강사한테 배운다면 얼마까지 낼 수 있어요?"
                options={['1만원 이하', '1~3만원', '3만원 이상도 OK']}
            />,
        ],
    },
};
