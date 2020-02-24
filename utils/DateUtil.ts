const currentYear = new Date().getFullYear();

export function getDateString(date: Date): string {
    return date.toISOString().substring(0, 10);
}

export function formatDate(date: Date): string {
    return date.getFullYear() === currentYear
        ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        : date.toLocaleDateString();
}
