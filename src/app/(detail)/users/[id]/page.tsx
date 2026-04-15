import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMockUserProfile } from '@/entities/user/mock';
import { SupporterProfileClient } from '@/features/my/client/profile/SupporterProfileClient';
import { PartnerProfileClient } from '@/features/my/client/profile/PartnerProfileClient';

type UserProfilePageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({
    params,
}: UserProfilePageProps): Promise<Metadata> {
    const { id } = await params;
    const profile = getMockUserProfile(id);
    if (!profile) return { title: '프로필' };
    const typeLabel = profile.profileType === 'SUPPORTER' ? '서포터' : '파트너';
    return { title: `${profile.nickname} · ${typeLabel} 프로필` };
}

export default async function UserProfilePage({
    params,
}: UserProfilePageProps) {
    const { id } = await params;
    const profile = getMockUserProfile(id);

    if (!profile) notFound();

    if (profile.profileType === 'SUPPORTER') {
        return <SupporterProfileClient profile={profile} />;
    }

    return <PartnerProfileClient profile={profile} />;
}
