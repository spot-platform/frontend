import type { SpotChatRoom } from '../../model/types';

type Props = { room: SpotChatRoom };

export function MatchedPhasePanel({ room: _room }: Props) {
    return (
        <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-800 uppercase">
                진행 단계
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                스팟이 진행 중이에요
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
                일정·체크리스트·참가자·투표는 다음 단계에서 여기로 들어옵니다.
            </p>
        </section>
    );
}
