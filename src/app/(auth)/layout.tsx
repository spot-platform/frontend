import { Section } from '@/shared/ui';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Section
            as="main"
            px="md"
            gap="lg"
            className="min-h-[100dvh] justify-center bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:px-4"
        >
            <div className="mx-auto flex w-full max-w-md flex-1 items-center">
                {children}
            </div>
        </Section>
    );
}
