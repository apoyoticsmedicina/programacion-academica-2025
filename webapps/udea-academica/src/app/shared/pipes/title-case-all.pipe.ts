import { Pipe, PipeTransform } from '@angular/core';

/**
 * Convierte un texto a "sentence case" pensando en español:
 * - Todo en minúsculas
 * - Primera letra de la primera palabra en mayúscula
 * - Y también la primera letra después de . ! ? ¿ ¡ o saltos de línea.
 */
export function toSentenceCase(input: unknown): string {
    if (input === null || input === undefined) {
        return '';
    }

    let value = String(input).trim();
    if (!value) return '';

    // Pasamos todo a minúsculas para unificar
    value = value.toLowerCase();

    const isLetter = (ch: string): boolean =>
        /[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/.test(ch);

    let result = '';
    let capitalizeNext = true; // al inicio de la cadena

    for (let i = 0; i < value.length; i++) {
        const ch = value[i];

        // Si toca capitalizar y es letra → la ponemos en mayúscula
        if (capitalizeNext && isLetter(ch)) {
            result += ch.toUpperCase();
            capitalizeNext = false;
            continue;
        }

        result += ch;

        // Si vemos un punto, signo de exclamación o interrogación normal,
        // preparamos para capitalizar la próxima letra.
        if (ch === '.' || ch === '!' || ch === '?') {
            capitalizeNext = true;
        }
        // Saltos de línea también reinician oración
        else if (ch === '\n') {
            capitalizeNext = true;
        }
        // Los signos invertidos en ES (¿ ¡) indican que lo siguiente es inicio de oración
        else if (ch === '¿' || ch === '¡') {
            capitalizeNext = true;
        }
    }

    return result;
}

@Pipe({
    name: 'titleCaseAll',      // mantenemos el mismo nombre que ya usaste en el HTML
    standalone: true,
})
export class TitleCaseAllPipe implements PipeTransform {
    transform(value: unknown): string {
        return toSentenceCase(value);
    }
}
