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
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${inverse ? 'text-white/60' : 'text-muted-foreground'}`}
            >
                {eyebrow}
            </p>
            <h2
                className={`text-lg font-bold tracking-[-0.03em] ${inverse ? 'text-white' : 'text-foreground'}`}
            >
                {title}
            </h2>
            <p
                className={`text-sm leading-6 ${inverse ? 'text-white/70' : 'text-muted-foreground'}`}
            >
                {description}
            </p>
        </div>
    );
}
