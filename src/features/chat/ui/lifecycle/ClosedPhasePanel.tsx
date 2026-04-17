import type { SpotChatRoom } from '../../model/types';

type Props = { room: SpotChatRoom };

export function ClosedPhasePanel({ room: _room }: Props) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-gray-500 uppercase">
                종료 단계
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                스팟이 마무리됐어요
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
                후기·정산은 다음 단계에서 여기로 들어옵니다.
            </p>
        </section>
    );
}
