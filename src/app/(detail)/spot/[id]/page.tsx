import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function SpotRedirectPage({ params }: Props) {
    const { id } = await params;
    redirect(`/chat?spotId=${encodeURIComponent(id)}`);
}
