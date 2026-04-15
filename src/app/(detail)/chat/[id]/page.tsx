import { ChatDetail } from '@/features/chat';
import { NavWrapper } from '@/shared/ui/NavWrapper';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: Props) {
    const { id } = await params;

    return (
        <>
            <ChatDetail roomId={id} />
            <div className="hidden md:block">
                <NavWrapper />
            </div>
        </>
    );
}
