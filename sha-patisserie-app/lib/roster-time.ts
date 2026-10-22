export function parseRosterTime(value: unknown): Date {
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)) {
    return new Date(NaN);
  }
  // datetime-local inputs represent venue time, not the server's timezone.
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}+08:00`);
}

export function perthDateTime(value: Date | string): string {
  return new Date(new Date(value).getTime() + 8 * 3600000).toISOString().slice(0, 16);
}
