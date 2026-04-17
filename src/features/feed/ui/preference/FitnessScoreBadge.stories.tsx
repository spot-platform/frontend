import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FitnessScoreBadge } from './FitnessScoreBadge';

const meta = {
    title: 'Features/Feed/Preference/FitnessScoreBadge',
    component: FitnessScoreBadge,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="bg-canvas p-4">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        score: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
        size: { control: 'inline-radio', options: ['sm', 'md'] },
        showLabel: { control: 'boolean' },
    },
} satisfies Meta<typeof FitnessScoreBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LowSm: Story = {
    args: { score: 0.2, size: 'sm' },
};

export const LowMd: Story = {
    args: { score: 0.2, size: 'md', showLabel: true },
};

export const MidSm: Story = {
    args: { score: 0.5, size: 'sm' },
};

export const MidMd: Story = {
    args: { score: 0.5, size: 'md', showLabel: true },
};

export const HighSm: Story = {
    args: { score: 0.75, size: 'sm' },
};

export const HighMd: Story = {
    args: { score: 0.75, size: 'md', showLabel: true },
};

export const TopSm: Story = {
    args: { score: 0.95, size: 'sm' },
};

export const TopMd: Story = {
    args: { score: 0.95, size: 'md', showLabel: true },
};
