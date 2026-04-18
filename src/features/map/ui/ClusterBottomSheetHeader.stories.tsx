import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ClusterBottomSheetHeader } from './ClusterBottomSheetHeader';

const Stage = ({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) => (
    <div className={dark ? 'dark' : ''}>
        <div className="relative h-[240px] w-[390px] bg-map-bg">{children}</div>
    </div>
);

const meta = {
    title: 'Features/Map/ClusterBottomSheetHeader',
    component: ClusterBottomSheetHeader,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ClusterBottomSheetHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightEmpty: Story = {
    args: { counts: { total: 0, offer: 0, request: 0 } },
    render: () => (
        <Stage>
            <ClusterBottomSheetHeader
                counts={{ total: 0, offer: 0, request: 0 }}
            />
        </Stage>
    ),
};

export const LightSmall: Story = {
    args: { counts: { total: 0, offer: 0, request: 0 } },
    render: () => (
        <Stage>
            <ClusterBottomSheetHeader
                counts={{ total: 5, offer: 3, request: 2 }}
            />
        </Stage>
    ),
};

export const LightLarge: Story = {
    args: { counts: { total: 0, offer: 0, request: 0 } },
    render: () => (
        <Stage>
            <ClusterBottomSheetHeader
                counts={{ total: 100, offer: 72, request: 28 }}
                radiusKm={2}
            />
        </Stage>
    ),
};

export const DarkEmpty: Story = {
    args: { counts: { total: 0, offer: 0, request: 0 } },
    render: () => (
        <Stage dark>
            <ClusterBottomSheetHeader
                counts={{ total: 0, offer: 0, request: 0 }}
            />
        </Stage>
    ),
};

export const DarkSmall: Story = {
    args: { counts: { total: 0, offer: 0, request: 0 } },
    render: () => (
        <Stage dark>
            <ClusterBottomSheetHeader
                counts={{ total: 5, offer: 3, request: 2 }}
            />
        </Stage>
    ),
};

export const DarkLarge: Story = {
    args: { counts: { total: 0, offer: 0, request: 0 } },
    render: () => (
        <Stage dark>
            <ClusterBottomSheetHeader
                counts={{ total: 100, offer: 72, request: 28 }}
                radiusKm={2}
            />
        </Stage>
    ),
};
