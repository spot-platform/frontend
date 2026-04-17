import type { SpotChatRoom } from '../../model/types';

type Props = { room: SpotChatRoom };

export function OpenPhasePanel({ room: _room }: Props) {
    return (
        <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase">
                모집 단계
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                아직 매칭 전 상태예요
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
                지원자 관리·모집 조건은 다음 단계에서 여기로 들어옵니다.
            </p>
        </section>
    );
}
