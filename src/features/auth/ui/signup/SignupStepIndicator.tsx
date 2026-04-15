type SignupStepIndicatorProps = {
    currentStep: 'info' | 'verify';
};

const steps = [
    { key: 'info', label: '기본 정보' },
    { key: 'verify', label: '코드 확인' },
] as const;

export function SignupStepIndicator({ currentStep }: SignupStepIndicatorProps) {
    const currentIndex = steps.findIndex((step) => step.key === currentStep);

    return (
        <div className="grid grid-cols-2 gap-3">
            {steps.map((step, index) => {
                const isActive = step.key === currentStep;
                const isComplete = index < currentIndex;

                return (
                    <div
                        key={step.key}
                        className={[
                            'rounded-2xl border px-4 py-3 transition',
                            isActive || isComplete
                                ? 'border-brand-200 bg-brand-50'
                                : 'border-gray-200 bg-gray-50',
                        ].join(' ')}
                    >
                        <div className="text-xs font-semibold text-gray-500">
                            STEP {index + 1}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-gray-900">
                            {step.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
