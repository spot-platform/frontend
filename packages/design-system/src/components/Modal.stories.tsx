import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

const meta = {
    title: 'Design System/Modal',
    component: Modal,
    tags: ['autodocs'],
    render: (args) => {
        const [open, setOpen] = useState(false);

        return (
            <div className="p-4">
                <Button onClick={() => setOpen(true)}>모달 열기</Button>
                <Modal {...args} open={open} onClose={() => setOpen(false)}>
                    <div className="rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-gray-600">
                        팀이 합의한 다음 단계를 안내하거나, 중요한 확인 액션을
                        묶어 보여줄 수 있습니다.
                    </div>
                </Modal>
            </div>
        );
    },
    args: {
        open: false,
        onClose: () => {},
        title: '공유 전에 확인할 내용',
        description:
            '문맥을 한 번 더 정리하면 참여자가 더 빠르게 이해할 수 있어요.',
    },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
