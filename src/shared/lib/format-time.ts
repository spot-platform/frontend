export function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return '방금 전';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}분 전`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}시간 전`;
    const day = Math.floor(hour / 24);
    if (day < 30) return `${day}일 전`;
    const month = Math.floor(day / 30);
    if (month < 12) return `${month}달 전`;
    return `${Math.floor(month / 12)}년 전`;
}
