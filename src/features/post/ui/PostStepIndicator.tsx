type PostStepIndicatorProps = {
    steps: string[];
    currentStep: number; // 0-based
};

export function PostStepIndicator({
    steps,
    currentStep,
}: PostStepIndicatorProps) {
    return (
        <div className="flex items-start gap-1.5">
            {steps.map((step, index) => {
                const isDone = index < currentStep;
                const isActive = index === currentStep;
                return (
                    <div key={step} className="flex flex-1 flex-col gap-1.5">
                        <div
                            className={`h-1 w-full rounded-full transition-colors duration-300 ${
                                isDone
                                    ? 'bg-brand-800/40'
                                    : isActive
                                      ? 'bg-brand-800'
                                      : 'bg-gray-200'
                            }`}
                        />
                        <span
                            className={`text-[10px] font-medium transition-colors ${
                                isActive
                                    ? 'text-brand-800'
                                    : isDone
                                      ? 'text-brand-800/50'
                                      : 'text-gray-300'
                            }`}
                        >
                            {index + 1}. {step}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
