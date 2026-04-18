import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MapV3Client } from '@/features/map-v3/client/MapV3Client';

export const metadata: Metadata = {
    title: 'Map V3',
};

export default function MapV3Page() {
    return (
        <Suspense>
            <MapV3Client />
        </Suspense>
    );
}
