// map 단독 페르소나 dot. 클러스터에 속하지 않은 "이동 중" 상태.

'use client';

import type { PersonaRef } from '../model/types';

type PersonaDotMarkerProps = {
    persona: PersonaRef;
    moving?: boolean;
};

const TRAIL_OPACITIES = [0.45, 0.28, 0.14] as const;

export function PersonaDotMarker({ persona, moving }: PersonaDotMarkerProps) {
    return (
        <div
            className="absolute flex flex-col items-center"
            style={{
                zIndex: 5,
                transform: 'translate(-50%, -50%)',
            }}
        >
            {moving && (
                <div
                    className="absolute flex gap-[3px]"
                    style={{ top: 24, left: -14 }}
                    aria-hidden
                >
                    {TRAIL_OPACITIES.map((o, i) => (
                        <div
                            key={i}
                            className="h-[3px] w-[3px] rounded-full bg-persona"
                            style={{ opacity: o }}
                        />
                    ))}
                </div>
            )}
            <div
                className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-persona bg-card text-[13px] shadow-sm dark:shadow-[0_0_10px_var(--color-persona-glow)]"
                aria-label={`${persona.name} ${moving ? '이동 중' : ''}`}
            >
                <span aria-hidden>{persona.emoji}</span>
            </div>
        </div>
    );
}
