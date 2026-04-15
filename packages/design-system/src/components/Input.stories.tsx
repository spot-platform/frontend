import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Mail } from 'lucide-react';
import { Input } from './Input';

const meta = {
    title: 'Design System/Input',
    component: Input,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="w-80 p-4">
                <Story />
            </div>
        ),
    ],
    args: {
        label: '이메일',
        placeholder: 'you@example.com',
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAdornment: Story = {
    args: {
        startAdornment: <Mail size={18} />,
    },
};

export const Error: Story = {
    args: {
        error: '이메일 형식을 확인해 주세요.',
        value: 'hello',
    },
};
