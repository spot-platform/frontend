import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FitnessScoreBadge } from './FitnessScoreBadge';

const Stage = ({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) => (
    <div className={dark ? 'dark' : ''}>
        <div className="bg-canvas p-4">{children}</div>
    </div>
);

const meta = {
    title: 'Features/Feed/Preference/FitnessScoreBadge',
    component: FitnessScoreBadge,
    tags: ['autodocs'],
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
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const LowMd: Story = {
    args: { score: 0.2, size: 'md', showLabel: true },
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const MidSm: Story = {
    args: { score: 0.5, size: 'sm' },
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const MidMd: Story = {
    args: { score: 0.5, size: 'md', showLabel: true },
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const HighSm: Story = {
    args: { score: 0.75, size: 'sm' },
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const HighMd: Story = {
    args: { score: 0.75, size: 'md', showLabel: true },
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const TopSm: Story = {
    args: { score: 0.95, size: 'sm' },
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const TopMd: Story = {
    args: { score: 0.95, size: 'md', showLabel: true },
    render: (args) => (
        <Stage>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const DarkLowSm: Story = {
    args: { score: 0.2, size: 'sm' },
    render: (args) => (
        <Stage dark>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const DarkMidMd: Story = {
    args: { score: 0.5, size: 'md', showLabel: true },
    render: (args) => (
        <Stage dark>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const DarkHighMd: Story = {
    args: { score: 0.75, size: 'md', showLabel: true },
    render: (args) => (
        <Stage dark>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};

export const DarkTopMd: Story = {
    args: { score: 0.95, size: 'md', showLabel: true },
    render: (args) => (
        <Stage dark>
            <FitnessScoreBadge {...args} />
        </Stage>
    ),
};
