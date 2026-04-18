// Preview of the draft UserPersona: avatar + role + archetype + interests.
// Server-safe by default. PersonaAvatar (map-coupled) is not reused here because it requires GeoCoord.

import { Chip } from '@frontend/design-system';
import {
    ARCHETYPE_DESCRIPTION,
    ARCHETYPE_EMOJI,
    ARCHETYPE_LABEL,
} from '@/entities/persona/labels';
import type {
    PersonaArchetype,
    UserPersonaRole,
} from '@/entities/persona/types';

const ROLE_LABEL: Record<UserPersonaRole, string> = {
    SUPPORTER: '서포터',
    PARTNER: '파트너',
};

type PersonaPreviewProps = {
    role?: UserPersonaRole;
    archetype?: PersonaArchetype;
    interests: string[];
    className?: string;
};

export function PersonaPreview({
    role,
    archetype,
    interests,
    className,
}: PersonaPreviewProps) {
    const emoji = archetype ? ARCHETYPE_EMOJI[archetype] : '🙂';
    const archetypeLabel = archetype
        ? ARCHETYPE_LABEL[archetype]
        : '유형 미선택';
    const archetypeDescription = archetype
        ? ARCHETYPE_DESCRIPTION[archetype]
        : '아직 유형을 고르지 않았어요';

    return (
        <div
            className={
                className ??
                'flex flex-col items-center gap-4 rounded-2xl border border-border-soft bg-background p-6 shadow-sm'
            }
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-background bg-accent-muted text-4xl shadow-md">
                {emoji}
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {role ? ROLE_LABEL[role] : '역할 미선택'}
                </p>
                <p className="text-lg font-semibold text-foreground">
                    {archetypeLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                    {archetypeDescription}
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {interests.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                        관심 카테고리 미선택
                    </span>
                ) : (
                    interests.map((interest) => (
                        <Chip key={interest} tone="brand" selected size="sm">
                            {interest}
                        </Chip>
                    ))
                )}
            </div>
        </div>
    );
}
