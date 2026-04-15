type MySectionHeaderProps = {
    eyebrow: string;
    title: string;
    description: string;
    inverse?: boolean;
};

export function MySectionHeader({
    eyebrow,
    title,
    description,
    inverse = false,
}: MySectionHeaderProps) {
    return (
        <div className="flex flex-col gap-1">
            <p
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${inverse ? 'text-white/60' : 'text-gray-400'}`}
            >
                {eyebrow}
            </p>
            <h2
                className={`text-lg font-bold tracking-[-0.03em] ${inverse ? 'text-white' : 'text-gray-950'}`}
            >
                {title}
            </h2>
            <p
                className={`text-sm leading-6 ${inverse ? 'text-white/70' : 'text-gray-500'}`}
            >
                {description}
            </p>
        </div>
    );
}
