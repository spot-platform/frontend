import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MyLocationMarker } from './MyLocationMarker';

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
    title: 'Features/Map/MyLocationMarker',
    component: MyLocationMarker,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MyLocationMarker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
    args: {},
    render: () => (
        <Stage>
            <MyLocationMarker />
        </Stage>
    ),
};

export const Dark: Story = {
    args: {},
    render: () => (
        <Stage dark>
            <MyLocationMarker />
        </Stage>
    ),
};
