import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    return { title: `Spot ${id}` };
}

export default async function SpotDetailPage({ params }: Props) {
    const { id } = await params;
    return (
        <main>
            <h1>Spot 상세</h1>
            <p>id: {id}</p>
            {/* TODO: SpotDetail + Timeline components */}
        </main>
    );
}
