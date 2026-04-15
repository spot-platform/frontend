type SignupHeroProps = {
    email: string;
    step: 'info' | 'verify';
    isComplete: boolean;
};

export function SignupHero({ email, step, isComplete }: SignupHeroProps) {
    const title =
        step === 'info'
            ? '처음 연결되는,\n오늘의 스팟.'
            : isComplete
              ? '코드 형식 확인이\n완료됐어요.'
              : '코드 입력 흐름을\n이어 확인해요.';

    const description =
        step === 'info'
            ? '이메일과 비밀번호만 입력하면 다음 단계의 회원가입 UI를 미리 확인할 수 있어요. 실제 가입 처리는 아직 연결되지 않았어요.'
            : isComplete
              ? '6자리 코드 입력 형식만 확인했어요. 실제 인증과 가입 완료는 백엔드 연동 이후 이어질 수 있어요.'
              : `${email} 기준으로 6자리 코드 입력 UI를 확인해 보세요. 실제 메일 발송은 아직 연결되지 않았어요.`;

    return (
        <div className="relative flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-[1.75rem] leading-9 font-black tracking-[-0.04em] whitespace-pre-line text-gray-950">
                    {title}
                </h1>
                <p className="max-w-xs text-sm leading-6 text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
}
