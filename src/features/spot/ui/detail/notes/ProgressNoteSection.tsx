import { IconNote } from '@tabler/icons-react';
import { SectionCard } from '../SectionCard';
import type { ProgressNote } from '@/entities/spot/types';

interface ProgressNoteSectionProps {
    notes: ProgressNote[];
}

export function ProgressNoteSection({ notes }: ProgressNoteSectionProps) {
    const latest = notes[notes.length - 1];

    return (
        <SectionCard
            title="진행 노트"
            manageModal="note"
            manageLabel="노트 보기"
        >
            {!latest ? (
                <p className="text-xs text-muted-foreground">
                    아직 노트가 없어요
                </p>
            ) : (
                <div className="flex gap-2">
                    <IconNote
                        size={14}
                        className="mt-0.5 shrink-0 text-border-strong"
                    />
                    <div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
                            {latest.content}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                            {latest.authorNickname} · {notes.length}개 노트
                        </p>
                    </div>
                </div>
            )}
        </SectionCard>
    );
}
