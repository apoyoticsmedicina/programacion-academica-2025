// src/app/shared/utils/text-utils.ts
export function titleCaseAll(value: string | null | undefined): string {
    if (value == null) return '';
    return value
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
