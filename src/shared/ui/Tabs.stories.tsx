import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Tabs } from './Tabs';

const meta = {
    title: 'Shared/UI/Tabs',
    component: Tabs,
    decorators: [
        (Story) => (
            <div className="bg-white p-8">
                <Story />
            </div>
        ),
    ],
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        active: {
            control: 'text',
        },
    },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const offerTabs = [
    { value: 'OFFER', label: 'Offer' },
    { value: 'REQUEST', label: 'Request' },
    { value: 'RENT', label: 'Rent' },
] as const;

export const Default: Story = {
    args: {
        tabs: offerTabs as unknown as { value: string; label: string }[],
        active: 'OFFER',
        onChange: () => {},
        size: 'md',
    },
};

export const SmallSize: Story = {
    args: {
        tabs: offerTabs as unknown as { value: string; label: string }[],
        active: 'OFFER',
        onChange: () => {},
        size: 'sm',
    },
};

export const LargeSize: Story = {
    args: {
        tabs: offerTabs as unknown as { value: string; label: string }[],
        active: 'OFFER',
        onChange: () => {},
        size: 'lg',
    },
};

export const TwoTabs: Story = {
    args: {
        tabs: [
            { value: 'BUY', label: 'Buy' },
            { value: 'SELL', label: 'Sell' },
        ],
        active: 'BUY',
        onChange: () => {},
        size: 'md',
    },
};

export const AllTabsInteractive: Story = {
    render: (args) => {
        const [active, setActive] = useState('OFFER');
        return (
            <Tabs
                {...args}
                tabs={
                    offerTabs as unknown as { value: string; label: string }[]
                }
                active={active}
                onChange={setActive}
            />
        );
    },
    args: {
        tabs: offerTabs as unknown as { value: string; label: string }[],
        active: 'OFFER',
        onChange: () => {},
        size: 'md',
    },
};

export const RequestActive: Story = {
    args: {
        tabs: offerTabs as unknown as { value: string; label: string }[],
        active: 'REQUEST',
        onChange: () => {},
        size: 'md',
    },
};

export const RentActive: Story = {
    args: {
        tabs: offerTabs as unknown as { value: string; label: string }[],
        active: 'RENT',
        onChange: () => {},
        size: 'md',
    },
};
