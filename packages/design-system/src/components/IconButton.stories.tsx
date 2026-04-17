import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { IconHeart, IconSearch } from '@tabler/icons-react';
import { IconButton } from './IconButton';

const meta = {
    title: 'Design System/IconButton',
    component: IconButton,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="flex gap-3 p-4">
                <Story />
            </div>
        ),
    ],
    args: {
        icon: <IconHeart size={18} />,
        label: '좋아요',
    },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};

export const Primary: Story = {
    args: {
        variant: 'primary',
        icon: <IconSearch size={18} />,
        label: '검색',
    },
};
