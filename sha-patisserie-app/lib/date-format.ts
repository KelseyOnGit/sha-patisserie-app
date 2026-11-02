// Display dates as dd-mm-yyyy. Accepts a YYYY-MM-DD string (or ISO timestamp, read as written) or a Date.
export function formatDMY(value: string | Date): string {
  const iso = typeof value === 'string'
    ? value.slice(0, 10)
    : `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  const [year, month, day] = iso.split('-');
  return `${day}-${month}-${year}`;
}
