import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

const meta = {
    title: 'Design System/Button',
    component: Button,
    tags: ['autodocs'],
    args: {
        children: '계속하기',
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: '보조 액션',
    },
};

export const WithIcon: Story = {
    args: {
        endIcon: <ArrowRight size={16} />,
        children: '다음 단계',
    },
};
