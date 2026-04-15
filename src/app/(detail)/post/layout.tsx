import { DetailHeader } from '@/shared/ui/DetailHeader';

export default function PostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <DetailHeader title="스팟 생성" />
            {children}
        </>
    );
}
