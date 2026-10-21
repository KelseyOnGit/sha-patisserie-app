/** WA public holidays (statewide). Add next year's dates when WA publishes them. */
export const WA_PUBLIC_HOLIDAYS: Record<string, string> = {
  // 2026
  '2026-01-01': "New Year's Day",
  '2026-01-26': 'Australia Day',
  '2026-03-02': 'Labour Day',
  '2026-04-03': 'Good Friday',
  '2026-04-05': 'Easter Sunday',
  '2026-04-06': 'Easter Monday',
  '2026-04-25': 'Anzac Day',
  '2026-04-27': 'Anzac Day Holiday',
  '2026-06-01': 'Western Australia Day',
  '2026-09-28': "King's Birthday",
  '2026-12-25': 'Christmas Day',
  '2026-12-26': 'Boxing Day',
  '2026-12-28': 'Boxing Day Holiday',
  // 2027
  '2027-01-01': "New Year's Day",
  '2027-01-26': 'Australia Day',
  '2027-03-01': 'Labour Day',
  '2027-03-26': 'Good Friday',
  '2027-03-28': 'Easter Sunday',
  '2027-03-29': 'Easter Monday',
  '2027-04-25': 'Anzac Day',
  '2027-04-26': 'Anzac Day Holiday',
  '2027-06-07': 'Western Australia Day',
  '2027-09-27': "King's Birthday",
  '2027-12-25': 'Christmas Day',
  '2027-12-26': 'Boxing Day',
  '2027-12-27': 'Christmas Day Holiday',
  '2027-12-28': 'Boxing Day Holiday',
};

/** Holidays from `fromKey` (YYYY-MM-DD) for the next `days` days. */
export function upcomingHolidays(fromKey: string, days = 60) {
  const end = new Date(new Date(`${fromKey}T00:00:00Z`).getTime() + days * 86400000)
    .toISOString().slice(0, 10);
  return Object.entries(WA_PUBLIC_HOLIDAYS)
    .filter(([date]) => date >= fromKey && date <= end)
    .map(([date, name]) => ({ date, name }));
}