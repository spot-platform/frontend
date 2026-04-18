import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { IconBriefcase } from '@tabler/icons-react';
import { useState, type ComponentProps } from 'react';
import { Dropdown } from './Dropdown';

function StatefulDropdownStory(props: ComponentProps<typeof Dropdown>) {
    const [value, setValue] = useState(
        typeof props.value === 'string' ? props.value : '',
    );

    return (
        <Dropdown
            {...props}
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    );
}

const meta = {
    title: 'Design System/Dropdown',
    component: Dropdown,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="w-80 p-4">
                <Story />
            </div>
        ),
    ],
    args: {
        label: '카테고리',
        placeholder: '카테고리를 선택해 주세요',
        options: [
            { label: '교육', value: 'education' },
            { label: '운동', value: 'fitness' },
            { label: '공예', value: 'craft' },
        ],
    },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => <StatefulDropdownStory {...args} />,
};

export const WithHint: Story = {
    render: (args) => <StatefulDropdownStory {...args} />,
    args: {
        hint: '검색과 필터에서 같은 톤으로 재사용할 수 있어요.',
    },
};

export const WithLeadingAdornment: Story = {
    render: (args) => <StatefulDropdownStory {...args} />,
    args: {
        label: '전문 분야',
        leadingAdornment: <IconBriefcase size={16} />,
        hint: '아이콘이 있는 입력 그룹에도 같은 밀도를 유지해요.',
    },
};

export const Error: Story = {
    render: (args) => <StatefulDropdownStory {...args} />,
    args: {
        error: '카테고리를 선택해 주세요.',
        value: '',
    },
};

export const Disabled: Story = {
    render: (args) => <StatefulDropdownStory {...args} />,
    args: {
        value: 'education',
        disabled: true,
        hint: '비활성 상태에서도 화살표와 텍스트 밀도가 유지돼요.',
    },
};

export const CapsuleControl: Story = {
    render: (args) => <StatefulDropdownStory {...args} />,
    args: {
        'aria-label': '채팅 컨텍스트 전환',
        options: [
            { label: '개인 채팅', value: 'personal' },
            { label: '운동 크루 촬영 모임', value: 'spot-1' },
            { label: '브랜드 협업 스팟', value: 'spot-2' },
        ],
        value: 'spot-1',
        controlClassName:
            'overflow-hidden rounded-full border border-border-soft bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_8px_20px_-16px_rgba(15,23,42,0.4)] transition-[border-color,box-shadow,background-color] duration-200 hover:border-border-strong focus-within:border-border-strong focus-within:ring-4 focus-within:ring-border-soft',
        className:
            'h-10 rounded-full border-transparent bg-transparent pl-4 pr-10 text-[15px] font-semibold tracking-[-0.02em] text-foreground shadow-none overflow-hidden text-ellipsis whitespace-nowrap focus:border-transparent focus:ring-0 hover:border-transparent hover:bg-transparent',
        indicatorClassName:
            'right-3 text-muted-foreground peer-hover:text-text-secondary peer-focus-visible:text-text-secondary',
    },
};
