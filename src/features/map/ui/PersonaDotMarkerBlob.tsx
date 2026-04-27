// 페르소나 dot — 10px 정적 표시. 인터랙션/프로필 카드는 제거됨 (모바일 발열 절감).
// 이동 중 pulse 는 CSS @keyframes 에 위임 (animate-persona-dot-pulse).

'use client';

import { memo } from 'react';

type DotVariant = 'ai' | 'user';

type PersonaDotMarkerBlobProps = {
    name: string;
    variant: DotVariant;
    moving?: boolean;
};

const DOT_SIZE = 10;

function PersonaDotMarkerBlobImpl({
    name,
    variant,
    moving,
}: PersonaDotMarkerBlobProps) {
    const isUser = variant === 'user';

    return (
        <div
            className="absolute"
            style={{
                zIndex: 5,
                transform: 'translate(-50%, -50%)',
            }}
            aria-label={`${name}${moving ? ' 이동 중' : ''}`}
            role="img"
        >
            <div className={moving ? 'animate-persona-dot-pulse' : undefined}>
                <div
                    className="rounded-full shadow-[0_0_6px_var(--color-persona-glow)]"
                    style={{
                        width: DOT_SIZE,
                        height: DOT_SIZE,
                        ...(isUser
                            ? {
                                  backgroundColor:
                                      'var(--color-persona-strong)',
                              }
                            : {
                                  border: '1.5px solid var(--color-persona)',
                                  backgroundColor: 'transparent',
                              }),
                    }}
                />
            </div>
        </div>
    );
}

export const PersonaDotMarkerBlob = memo(
    PersonaDotMarkerBlobImpl,
    (prev, next) =>
        prev.name === next.name &&
        prev.variant === next.variant &&
        prev.moving === next.moving,
);
