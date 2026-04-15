import { Header } from '@/shared/ui/Header';
import { NavWrapper } from '@/shared/ui/NavWrapper';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <div className="min-h-[100dvh] bg-surface">{children}</div>
            <NavWrapper />
        </>
    );
}
