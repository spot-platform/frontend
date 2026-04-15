import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChatHeaderContextSelect } from './ChatHeaderContextSelect';

const options = [
    { label: '개인 채팅', value: 'personal' },
    { label: '운동 크루 촬영 모임', value: 'spot-1' },
    { label: '브랜드 협업 스팟 with a much longer title', value: 'spot-2' },
];

const meta = {
    title: 'Features/Chat/ChatHeaderContextSelect',
    component: ChatHeaderContextSelect,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="w-80 bg-white p-4">
                <Story />
            </div>
        ),
    ],
    args: {
        value: 'spot-1',
        options,
        onChange: () => undefined,
    },
} satisfies Meta<typeof ChatHeaderContextSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Personal: Story = {
    args: {
        value: 'personal',
    },
};
