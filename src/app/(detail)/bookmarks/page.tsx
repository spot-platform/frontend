import type { Metadata } from 'next';
import { DetailHeader, DetailPageShell } from '@/shared/ui';

export const metadata: Metadata = { title: '저장됨' };

export default function BookmarksPage() {
    return (
        <>
            <DetailHeader title="저장됨" />
            <DetailPageShell topInset="sm" bottomInset="lg">
                <div className="flex flex-col gap-4 px-4">
                    <section>
                        <h2 className="text-sm font-semibold text-text-secondary">
                            저장 목록
                        </h2>
                        <ul className="mt-1 text-sm text-muted-foreground">
                            <li>저장한 게시물</li>
                            <li>저장한 스팟</li>
                        </ul>
                    </section>
                    <section>
                        <p className="text-xs text-muted-foreground">
                            첫 저장 콘텐츠가 없을 때 보여줄 안내 영역
                        </p>
                    </section>
                </div>
            </DetailPageShell>
        </>
    );
}
