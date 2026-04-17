import { Suspense } from 'react';
import { MapPageClient } from '../MapPageClient';

export default function MapPage() {
    return (
        <Suspense>
            <MapPageClient />
        </Suspense>
    );
}
