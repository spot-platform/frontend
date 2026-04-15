import { Button } from '@frontend/design-system';

type DummyLoginCardProps = {
    isPending: boolean;
    onClick: () => void;
};

export function DummyLoginCard({ isPending, onClick }: DummyLoginCardProps) {
    return (
        <div className="relative rounded-lg border border-dashed border-brand-200 bg-brand-50/70 p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase">
                        Dev only
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                        더미 유저로 바로 확인하기
                    </p>
                    <p className="text-xs leading-5 text-gray-500">
                        로컬 개발에서만 보이는 빠른 로그인입니다.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClick}
                    disabled={isPending}
                >
                    {isPending ? '접속 중...' : '더미 로그인'}
                </Button>
            </div>
        </div>
    );
}
