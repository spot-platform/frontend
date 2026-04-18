import { IconSquareCheck } from '@tabler/icons-react';
import { SectionCard } from '../SectionCard';
import type { SpotChecklist } from '@/entities/spot/types';

interface ChecklistSectionProps {
    checklist?: SpotChecklist | null;
}

export function ChecklistSection({ checklist }: ChecklistSectionProps) {
    const items = checklist?.items ?? [];
    const completed = items.filter((i) => i.completed).length;
    const preview = items.slice(0, 3);

    return (
        <SectionCard title="체크리스트" manageModal="checklist">
            {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    체크리스트가 없어요
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {/* 완료 요약 */}
                    <div className="flex items-center gap-2">
                        <IconSquareCheck size={14} className="text-brand-800" />
                        <span className="text-xs font-semibold text-text-secondary">
                            {completed}/{items.length} 완료
                        </span>
                    </div>
                    {/* 진행 바 */}
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-brand-800 transition-all"
                            style={{
                                width: `${items.length > 0 ? (completed / items.length) * 100 : 0}%`,
                            }}
                        />
                    </div>
                    {/* 미리보기 */}
                    <div className="mt-1 flex flex-col gap-1">
                        {preview.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        item.completed
                                            ? 'bg-brand-800'
                                            : 'bg-border-soft'
                                    }`}
                                />
                                <span
                                    className={`text-xs ${
                                        item.completed
                                            ? 'text-muted-foreground line-through'
                                            : 'text-text-secondary'
                                    }`}
                                >
                                    {item.text}
                                </span>
                            </div>
                        ))}
                        {items.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{items.length - 3}개 더
                            </span>
                        )}
                    </div>
                </div>
            )}
        </SectionCard>
    );
}
