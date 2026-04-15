export function LoginHero() {
    return (
        <div className="relative flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-[1.75rem] leading-9 font-black tracking-[-0.04em] text-gray-950">
                    다시 연결되는,
                    <br />
                    오늘의 스팟.
                </h1>
                <p className="max-w-xs text-sm leading-6 text-gray-500">
                    이메일로 바로 로그인하거나, 익숙한 소셜 계정으로 빠르게
                    이어서 시작해 보세요.
                </p>
            </div>
        </div>
    );
}
