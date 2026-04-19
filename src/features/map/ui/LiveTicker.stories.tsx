import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { TickerEvent } from '../model/ticker-adapter';
import { LiveTicker } from './LiveTicker';

const sampleEvent: TickerEvent = {
    id: 'evt-1',
    personaEmoji: '📚',
    personaName: '수빈',
    predicate: '코딩 모임으로 이동 중',
    timestamp: Date.now(),
};

const Stage = ({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) => (
    <div className={dark ? 'dark' : ''}>
        <div className="relative h-[180px] w-[390px] bg-map-bg">{children}</div>
    </div>
);

const meta = {
    title: 'Features/Map/LiveTicker',
    component: LiveTicker,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LiveTicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightWithEvent: Story = {
    args: { event: null },
    render: () => (
        <Stage>
            <LiveTicker
                event={sampleEvent}
                className="absolute bottom-[102px] left-3 right-3"
            />
        </Stage>
    ),
};

export const LightLiveBadge: Story = {
    args: { event: null },
    render: () => (
        <Stage>
            <LiveTicker
                event={sampleEvent}
                sseActive
                className="absolute bottom-[102px] left-3 right-3"
            />
        </Stage>
    ),
};

export const LightNullEvent: Story = {
    args: { event: null },
    render: () => (
        <Stage>
            <LiveTicker
                event={null}
                className="absolute bottom-[102px] left-3 right-3"
            />
            <div className="absolute bottom-[110px] left-3 right-3 text-center text-[11px] text-muted-foreground">
                (event=null — 렌더 없음)
            </div>
        </Stage>
    ),
};

export const DarkWithEvent: Story = {
    args: { event: null },
    render: () => (
        <Stage dark>
            <LiveTicker
                event={sampleEvent}
                className="absolute bottom-[102px] left-3 right-3"
            />
        </Stage>
    ),
};

export const DarkLiveBadge: Story = {
    args: { event: null },
    render: () => (
        <Stage dark>
            <LiveTicker
                event={sampleEvent}
                sseActive
                className="absolute bottom-[102px] left-3 right-3"
            />
        </Stage>
    ),
};
