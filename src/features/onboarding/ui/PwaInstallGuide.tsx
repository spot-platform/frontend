'use client';

import { Button } from '@frontend/design-system';
import { PWA_SHORTCUTS } from '../model/pwa-install';
import { usePwaInstallPrompt } from './use-pwa-install-prompt';

const STATUS_MESSAGE: Record<string, string> = {
    accepted:
        '설치가 시작됐어요. 완료되면 홈 화면의 Spot 아이콘으로 들어오면 돼요.',
    dismissed: '괜찮아요. 나중에 브라우저 메뉴에서 다시 설치할 수 있어요.',
    unavailable:
        '지금 브라우저에서는 자동 설치 버튼이 보이지 않아요. 아래 수동 방법으로 진행해 주세요.',
};

export function PwaInstallGuide() {
    const {
        canPromptInstall,
        guide,
        installState,
        isInstalled,
        promptInstall,
    } = usePwaInstallPrompt();

    return (
        <section className="flex flex-col gap-4">
            <header className="flex flex-col gap-2 text-center">
                <span className="mx-auto rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">
                    홈 화면에 Spot 고정
                </span>
                <h2 className="text-base font-semibold text-foreground">
                    앱처럼 열어두면 바로 지도부터 시작해요
                </h2>
                <p className="text-xs leading-5 text-muted-foreground">
                    설치는 선택이에요. 그래도 한 번 추가해두면 주소 입력 없이
                    주변 피드, 작성, 채팅까지 더 빠르게 들어갈 수 있어요.
                </p>
            </header>

            <div className="rounded-3xl border border-border-soft bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                    <div
                        aria-hidden="true"
                        className="h-12 w-12 shrink-0 rounded-2xl bg-[#0b1216] bg-[url('/brand/spot-logo.png')] bg-[length:92%_92%] bg-center bg-no-repeat shadow-sm"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                            Spot 빠른 실행
                        </p>
                        <p className="text-xs text-muted-foreground">
                            설치 후 홈 화면 아이콘과 앱 단축 메뉴를 사용할 수
                            있어요.
                        </p>
                    </div>
                </div>

                {isInstalled ? (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        이미 설치된 상태예요. 이제 Spot을 앱처럼 사용할 수
                        있어요.
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="primary"
                        fullWidth
                        disabled={installState === 'prompting'}
                        onClick={promptInstall}
                    >
                        {canPromptInstall
                            ? 'Spot 설치하기'
                            : '설치 방법 확인하기'}
                    </Button>
                )}

                {installState !== 'idle' && installState !== 'prompting' && (
                    <p className="mt-3 rounded-2xl bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
                        {STATUS_MESSAGE[installState]}
                    </p>
                )}
            </div>

            <div className="rounded-3xl border border-border-soft bg-background p-4">
                <h3 className="text-sm font-semibold text-foreground">
                    {guide.title}
                </h3>
                <ol className="mt-3 flex flex-col gap-2">
                    {guide.steps.map((step, index) => (
                        <li
                            key={step}
                            className="flex gap-3 text-xs leading-5 text-muted-foreground"
                        >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-800">
                                {index + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            </div>

            <div className="grid gap-2">
                {PWA_SHORTCUTS.map((shortcut) => (
                    <div
                        key={shortcut.url}
                        className="rounded-2xl border border-border-soft bg-muted px-4 py-3"
                    >
                        <p className="text-xs font-semibold text-foreground">
                            {shortcut.label}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                            {shortcut.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
