import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
    LoginPageClient,
    pickSingleQueryValue,
    resolvePostLoginPath,
    sanitizeNextPath,
} from '@/features/auth';

export const metadata: Metadata = {
    title: 'Login',
};

function isDevDummyLoginEnabled() {
    return (
        process.env.NODE_ENV !== 'production' &&
        process.env.ENABLE_DEV_DUMMY_LOGIN === 'true'
    );
}

export default async function LoginPage({
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

    return (
        <LoginPageClient
            allowDummyLogin={isDevDummyLoginEnabled()}
            nextPath={nextPath ?? undefined}
        />
    );
}
