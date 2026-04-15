import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Chip } from './Chip';

function StoryChip({
    children,
    selected = false,
    tone = 'neutral',
}: {
    children: string;
    selected?: boolean;
    tone?: 'neutral' | 'brand';
}) {
    return (
        <Chip selected={selected} tone={tone}>
            {children}
        </Chip>
    );
}

const meta = {
    title: 'Design System/Chip',
    component: StoryChip,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="flex flex-wrap gap-3 p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof StoryChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
    args: {
        children: '음악',
    },
};

export const Selected: Story = {
    args: {
        children: '교육',
        selected: true,
        tone: 'brand',
    },
};
