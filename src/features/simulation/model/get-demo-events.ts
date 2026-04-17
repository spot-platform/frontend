import type { TimedMapEvent } from './types';
import { MOCK_EVENT_SEQUENCE } from './mock-event-sequence';

export function getDemoEvents(): TimedMapEvent[] {
    return MOCK_EVENT_SEQUENCE;
}
