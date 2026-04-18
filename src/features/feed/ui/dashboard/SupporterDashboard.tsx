// 내 피드 목록 + 각 항목의 AttractivenessCard + (선택) ConversionHintsCard.

import type {
    AttractivenessReport,
    ConversionHints,
} from '@/entities/spot/simulation-types';
import { AttractivenessCard } from './AttractivenessCard';
import { ConversionHintsCard } from './ConversionHintsCard';

type SupporterDashboardReport = {
    feedId: string;
    feedTitle: string;
    report: AttractivenessReport;
    hints?: ConversionHints;
};

type SupporterDashboardProps = {
    reports: Array<SupporterDashboardReport>;
};

export function SupporterDashboard({ reports }: SupporterDashboardProps) {
    if (reports.length === 0) {
        return (
            <section className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border-soft bg-card px-6 py-12 text-center">
                <h2 className="text-base font-semibold text-text-secondary">
                    분석할 피드가 아직 없어요
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                    피드를 하나라도 등록하면 매력도 리포트가 생성됩니다.
                </p>
            </section>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {reports.map(({ feedId, feedTitle, report, hints }) => (
                <article key={feedId} className="flex flex-col gap-3">
                    <AttractivenessCard report={report} title={feedTitle} />
                    {hints && <ConversionHintsCard hints={hints} />}
                </article>
            ))}
        </div>
    );
}
