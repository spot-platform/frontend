import { CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@frontend/design-system';

type MyRetryCardProps = {
    title: string;
    description: string;
    onRetry: () => void;
    isRetrying: boolean;
};

export function MyRetryCard({
    title,
    description,
    onRetry,
    isRetrying,
}: MyRetryCardProps) {
    return (
        <div className="flex flex-col gap-4 rounded-[1.5rem] border border-red-100 bg-red-50/80 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                    <CircleAlert size={18} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700">
                        {title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-600">
                        {description}
                    </p>
                </div>
            </div>

            <Button
                variant="ghost"
                onClick={onRetry}
                className="justify-center bg-white text-red-600 hover:bg-red-100"
                startIcon={
                    isRetrying ? (
                        <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                        <RefreshCw size={16} />
                    )
                }
            >
                다시 시도
            </Button>
        </div>
    );
}
