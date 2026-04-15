export default function DetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[100dvh] pt-[calc(var(--spacing-header-h)+env(safe-area-inset-top))]">
            {children}
        </div>
    );
}
