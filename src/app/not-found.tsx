import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">페이지를 찾을 수 없어요</h1>
            <p className="text-muted-foreground">존재하지 않는 페이지입니다.</p>
            <Link
                href="/map"
                className="text-brand-500 underline underline-offset-4"
            >
                홈으로 돌아가기
            </Link>
        </main>
    );
}
