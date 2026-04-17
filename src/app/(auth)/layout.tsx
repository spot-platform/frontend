import { Shell } from '@/shared/ui/Shell';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Shell variant="auth" gap="lg" className="bg-surface">
            <div className="mx-auto flex w-full max-w-md flex-1 items-center">
                {children}
            </div>
        </Shell>
    );
}
