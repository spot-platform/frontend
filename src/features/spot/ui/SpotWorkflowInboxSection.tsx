import Link from 'next/link';
import {
    IconChevronRight,
    IconClipboardCheck,
    IconReceipt,
    IconThumbUp,
} from '@tabler/icons-react';
import { getSpotWorkflowInboxItems, MOCK_SPOT_WORKFLOWS } from '../model/mock';

const WORKFLOW_ICON_MAP = {
    vote: IconThumbUp,
    approval: IconClipboardCheck,
    settlement: IconReceipt,
} as const;

export function SpotWorkflowInboxSection() {
    const workflowItems = getSpotWorkflowInboxItems();

    return (
        <div className="mx-4 rounded-2xl border border-gray-100 bg-white px-4 py-4">
            <div className="mb-3">
                <p className="text-sm font-bold text-gray-900">운영 인박스</p>
                <p className="mt-1 text-xs text-gray-400">
                    투표, 호스트 승인, 정산 승인까지 지금 확인할 단계만
                    모아봤어요.
                </p>
            </div>

            <div className="flex flex-col gap-2.5">
                {workflowItems.map((item) => {
                    const workflow = MOCK_SPOT_WORKFLOWS[item.spotId];
                    const Icon = WORKFLOW_ICON_MAP[item.icon];

                    return (
                        <Link
                            key={item.spotId}
                            href={`/spot/${item.spotId}`}
                            className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 transition-colors active:bg-gray-100"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-800/8">
                                    <Icon className="h-4 w-4 text-brand-800" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {item.label}
                                    </p>
                                    <p className="truncate text-xs text-gray-400">
                                        {item.description} ·{' '}
                                        {workflow.progressLabel}
                                    </p>
                                </div>
                            </div>
                            <IconChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
