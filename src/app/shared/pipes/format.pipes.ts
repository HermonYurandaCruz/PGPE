import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mznCurrency',
  standalone: true
})
export class MznCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, showSymbol = true): string {
    if (value === null || value === undefined || isNaN(value)) {
      return showSymbol ? 'MZN 0,00' : '0,00';
    }

    const formatted = new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

    return showSymbol ? `MZN ${formatted}` : formatted;
  }
}

@Pipe({
  name: 'mzDate',
  standalone: true
})
export class MzDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, includeTime = false): string {
    if (!value) return '-';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '-';

      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();

      if (!includeTime) {
        return `${d}/${m}/${y}`;
      }

      const h = date.getHours().toString().padStart(2, '0');
      const min = date.getMinutes().toString().padStart(2, '0');
      return `${d}/${m}/${y} ${h}:${min}`;
    } catch {
      return '-';
    }
  }
}
