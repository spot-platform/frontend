import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChatHeaderContextSelect } from './ChatHeaderContextSelect';

const options = [
    { label: '개인 채팅', value: 'personal' },
    { label: '운동 크루 촬영 모임', value: 'spot-1' },
    { label: '브랜드 협업 스팟 with a much longer title', value: 'spot-2' },
];

function Stage({
    dark,
    children,
}: {
    dark?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={dark ? 'dark' : ''}>
            <div className="w-80 bg-card p-4">{children}</div>
        </div>
    );
}

const meta = {
    title: 'Features/Chat/ChatHeaderContextSelect',
    component: ChatHeaderContextSelect,
    tags: ['autodocs'],
    args: {
        value: 'spot-1',
        options,
        onChange: () => undefined,
    },
} satisfies Meta<typeof ChatHeaderContextSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => (
        <Stage>
            <ChatHeaderContextSelect {...args} />
        </Stage>
    ),
};

export const Personal: Story = {
    args: {
        value: 'personal',
    },
    render: (args) => (
        <Stage>
            <ChatHeaderContextSelect {...args} />
        </Stage>
    ),
};

export const DarkDefault: Story = {
    render: (args) => (
        <Stage dark>
            <ChatHeaderContextSelect {...args} />
        </Stage>
    ),
};

export const DarkPersonal: Story = {
    args: {
        value: 'personal',
    },
    render: (args) => (
        <Stage dark>
            <ChatHeaderContextSelect {...args} />
        </Stage>
    ),
};
