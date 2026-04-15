import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Tab } from './Tab';

const options = [
    { label: 'Offer', value: 'offer' },
    { label: 'Request', value: 'request' },
    { label: 'Rent', value: 'rent' },
] as const;

const meta = {
    title: 'Design System/Tab',
    component: Tab,
    tags: ['autodocs'],
    render: (args) => {
        const [value, setValue] = useState('offer');

        return <Tab {...args} value={value} onChange={setValue} />;
    },
    args: {
        options,
        value: 'offer',
        onChange: () => {},
    },
} satisfies Meta<typeof Tab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
    args: {
        size: 'lg',
    },
};

export const MultipleGroups: Story = {
    render: () => {
        const [primaryValue, setPrimaryValue] = useState('offer');
        const [secondaryValue, setSecondaryValue] = useState('rent');

        return (
            <div className="flex w-80 flex-col gap-6 bg-white p-6">
                <Tab
                    options={options}
                    value={primaryValue}
                    onChange={setPrimaryValue}
                />
                <Tab
                    options={options}
                    value={secondaryValue}
                    onChange={setSecondaryValue}
                />
            </div>
        );
    },
};
