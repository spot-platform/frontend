import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    SignupPageClient,
    pickSingleQueryValue,
    resolvePostLoginPath,
    sanitizeNextPath,
} from '@/features/auth';

export const metadata: Metadata = {
    title: 'Signup',
};

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string | string[] }>;
}) {
    const token = (await cookies()).get('spot-auth-token')?.value;
    const { next } = await searchParams;
    const nextPath = sanitizeNextPath(pickSingleQueryValue(next));

    if (token) {
        redirect(resolvePostLoginPath(nextPath));
    }

    return <SignupPageClient nextPath={nextPath ?? undefined} />;
}
