import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MapBottomStack, MapBottomStackPeek } from './MapBottomStack';

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
