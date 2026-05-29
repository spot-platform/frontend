import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClusterBlob } from './ClusterBlob';
import type { ActivityCluster } from '../model/types';

vi.mock('framer-motion', async () => {
    const actual =
        await vi.importActual<typeof import('framer-motion')>('framer-motion');
    return {
        ...actual,
        useReducedMotion: () => false,
    };
});

const cluster: ActivityCluster = {
    id: 'feed-group-1-2',
    centerCoord: { lat: 37.2636, lng: 127.0286 },
    category: '인접 피드 2개',
    intent: 'offer',
    variant: 'feed-group',
    personas: [
        { id: '1', name: 'a', emoji: '📚' },
        { id: '2', name: 'b', emoji: '📚' },
    ],
};

afterEach(() => cleanup());

describe('ClusterBlob full marker animation contract', () => {
    it('marks full feed-group markers as animated so newly mounted markers do not stay static', () => {
        render(
            <ClusterBlob
                cluster={cluster}
                selected={false}
                onSelectAction={() => undefined}
                visualMode="full"
            />,
        );

        expect(
            screen
                .getByTestId('cluster-blob-full-animation')
                .getAttribute('data-animated'),
        ).toBe('true');
    });

    it('does not attach full animation contract in simple mode', () => {
        render(
            <ClusterBlob
                cluster={cluster}
                selected={false}
                onSelectAction={() => undefined}
                visualMode="simple"
            />,
        );

        expect(screen.queryByTestId('cluster-blob-full-animation')).toBeNull();
    });
});
