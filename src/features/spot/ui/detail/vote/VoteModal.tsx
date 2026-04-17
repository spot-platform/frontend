'use client';

import { Button, IconButton, Input } from '@frontend/design-system';
import { useState } from 'react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { BottomSheet } from '@/shared/ui';
import { VoteOptionBar } from './VoteOptionBar';
import {
    useCreateVote,
    useCastVote,
    useSpotVotes,
} from '../../../model/use-vote';
import type { SpotVote } from '@/entities/spot/types';

type VoteModalProps =
    | {
          mode: 'create';
          open: boolean;
          onClose: () => void;
          spotId: string;
      }
    | {
          mode: 'cast';
          open: boolean;
          onClose: () => void;
          spotId: string;
          voteId: string;
          currentUserId: string;
      };

function CreateVoteForm({
    spotId,
    onClose,
}: {
    spotId: string;
    onClose: () => void;
}) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [multiSelect, setMultiSelect] = useState(false);
    const { mutate: createVote, isPending } = useCreateVote(spotId);

    function handleAddOption() {
        if (options.length < 6) setOptions((prev) => [...prev, '']);
    }

    function handleRemoveOption(idx: number) {
        if (options.length <= 2) return;
        setOptions((prev) => prev.filter((_, i) => i !== idx));
    }

    function handleSubmit() {
        const validOptions = options.filter((o) => o.trim());
        if (!question.trim() || validOptions.length < 2) return;
        createVote(
            { question: question.trim(), options: validOptions, multiSelect },
            { onSuccess: onClose },
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    질문
                </label>
                <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="투표 질문을 입력하세요"
                    className="h-12 rounded-xl"
                />
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    선택지
                </label>
                <div className="flex flex-col gap-2">
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Input
                                value={opt}
                                onChange={(e) => {
                                    const next = [...options];
                                    next[idx] = e.target.value;
                                    setOptions(next);
                                }}
                                placeholder={`선택지 ${idx + 1}`}
                                className="h-10 flex-1 rounded-xl"
                            />
                            {options.length > 2 && (
                                <IconButton
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveOption(idx)}
                                    label={`선택지 ${idx + 1} 삭제`}
                                    className="text-gray-400"
                                    icon={<IconX size={16} />}
                                />
                            )}
                        </div>
                    ))}
                    {options.length < 6 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleAddOption}
                            startIcon={<IconPlus size={14} />}
                            className="justify-start border-dashed text-xs text-gray-500"
                        >
                            선택지 추가
                        </Button>
                    )}
                </div>
            </div>

            <label className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={multiSelect}
                    onChange={(e) => setMultiSelect(e.target.checked)}
                    className="accent-brand-800"
                />
                <span className="text-sm text-gray-600">복수 선택 허용</span>
            </label>

            <Button onClick={handleSubmit} disabled={isPending} fullWidth>
                투표 만들기
            </Button>
        </div>
    );
}

function CastVoteForm({
    vote,
    spotId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentUserId: _currentUserId,
    onClose,
}: {
    vote: SpotVote;
    spotId: string;
    currentUserId: string;
    onClose: () => void;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const { mutate: castVote, isPending } = useCastVote(spotId);
    const totalVotes = vote.options.reduce(
        (sum, o) => sum + o.voterIds.length,
        0,
    );

    function handleSelect(optId: string) {
        if (vote.multiSelect) {
            setSelected((prev) =>
                prev.includes(optId)
                    ? prev.filter((id) => id !== optId)
                    : [...prev, optId],
            );
        } else {
            setSelected([optId]);
        }
    }

    function handleSubmit() {
        if (selected.length === 0) return;
        castVote(
            { voteId: vote.id, optionIds: selected },
            { onSuccess: onClose },
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-gray-700">
                {vote.question}
            </p>
            <div className="flex flex-col gap-2">
                {vote.options.map((opt) => (
                    <VoteOptionBar
                        key={opt.id}
                        option={opt}
                        totalVotes={totalVotes}
                        selected={selected.includes(opt.id)}
                        onSelect={() => handleSelect(opt.id)}
                    />
                ))}
            </div>
            <Button
                onClick={handleSubmit}
                disabled={isPending || selected.length === 0}
                fullWidth
            >
                투표하기
            </Button>
        </div>
    );
}

export function VoteModal(props: VoteModalProps) {
    const title = props.mode === 'create' ? '새 투표 만들기' : '투표하기';
    const { data: votesData } = useSpotVotes(props.spotId);
    const vote =
        props.mode === 'cast'
            ? votesData?.data?.find((v) => v.id === props.voteId)
            : undefined;

    return (
        <BottomSheet
            open={props.open}
            onClose={props.onClose}
            title={title}
            snapPoint="full"
        >
            {props.mode === 'create' ? (
                <CreateVoteForm spotId={props.spotId} onClose={props.onClose} />
            ) : vote ? (
                <CastVoteForm
                    vote={vote}
                    spotId={props.spotId}
                    currentUserId={props.currentUserId}
                    onClose={props.onClose}
                />
            ) : (
                <p className="text-sm text-gray-400">투표를 불러오는 중...</p>
            )}
        </BottomSheet>
    );
}
