export function getAuthPathWithNext(path: string, nextPath?: string) {
    if (!nextPath) {
        return path;
    }

    const search = new URLSearchParams({ next: nextPath });

    return `${path}?${search.toString()}`;
}
