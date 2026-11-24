/** Date helpers. Local calendar dates are stored as YYYY-MM-DD strings. */

export function toLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(iso: string): Date {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO(now: Date = new Date()): string {
  return toLocalDateISO(now);
}

export function addDaysISO(iso: string, days: number): string {
  const date = parseLocalDate(iso);
  date.setDate(date.getDate() + days);
  return toLocalDateISO(date);
}

export function diffDaysISO(fromISO: string, toISO: string): number {
  const from = parseLocalDate(fromISO).getTime();
  const to = parseLocalDate(toISO).getTime();
  return Math.round((to - from) / 86_400_000);
}

/** 0 = Monday ... 6 = Sunday. */
export function weekdayIndex(iso: string): number {
  return (parseLocalDate(iso).getDay() + 6) % 7;
}

export function startOfWeekISO(iso: string, weekStartDay = 1): string {
  const offset = (weekdayIndex(iso) - ((weekStartDay + 6) % 7) + 7) % 7;
  return addDaysISO(iso, -offset);
}

export function nowTimeHHMM(now: Date = new Date()): string {
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function timeToMinutes(hhmm: string): number {
  const [hours = 0, minutes = 0] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}
