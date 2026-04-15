import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Textarea } from './Textarea';

const meta = {
    title: 'Design System/Textarea',
    component: Textarea,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="w-96 p-4">
                <Story />
            </div>
        ),
    ],
    args: {
        label: '설명',
        rows: 5,
        placeholder: '구체적인 맥락과 기대하는 흐름을 적어 주세요.',
    },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
    args: {
        hint: '최대 500자까지 입력할 수 있어요.',
    },
};
