import { IconChevronLeft } from '@tabler/icons-react';
import { Button } from '@frontend/design-system';

type PostSubmitBarProps = {
    label: string;
    onClick: () => void;
    onBack?: () => void;
    disabled?: boolean;
    showBack?: boolean;
};

export function PostSubmitBar({
    label,
    onClick,
    onBack,
    disabled,
    showBack,
}: PostSubmitBarProps) {
    return (
        <div className="fixed bottom-3 left-0 right-0 z-30 px-4">
            <div className="mx-auto flex max-w-107.5 items-center gap-2">
                {showBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 active:bg-gray-100"
                        aria-label="이전 단계"
                    >
                        <IconChevronLeft size={20} />
                    </button>
                )}
                <Button
                    onClick={onClick}
                    size="lg"
                    fullWidth
                    disabled={disabled}
                    className="rounded-full"
                >
                    {label}
                </Button>
            </div>
        </div>
    );
}
