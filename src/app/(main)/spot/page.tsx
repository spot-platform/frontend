import type { Metadata } from 'next';
import { getSpotView, SpotAlertSection, SpotMyList } from '@/features/spot';
import { Main } from '@/shared/ui';

export const metadata: Metadata = { title: 'Spot' };

export default async function SpotPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string | string[] }>;
}) {
    const { view } = await searchParams;
    const activeView = getSpotView(view);

    return (
        <Main>
            <SpotAlertSection />
            <SpotMyList view={activeView} />
        </Main>
    );
}
