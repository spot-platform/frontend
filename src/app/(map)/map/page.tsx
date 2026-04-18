import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MapClient } from '@/features/map/client/MapClient';

export const metadata: Metadata = {
    title: '지도',
};

export default function MapPage() {
    return (
        <Suspense>
            <MapClient />
        </Suspense>
    );
}
