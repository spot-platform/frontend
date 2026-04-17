import type { Metadata } from 'next';
import { OnboardingPageClient } from '@/features/onboarding';

export const metadata: Metadata = {
    title: 'Onboarding',
};

export default function OnboardingPage() {
    return <OnboardingPageClient />;
}
