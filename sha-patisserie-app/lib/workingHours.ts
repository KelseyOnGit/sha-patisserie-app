export const WORKING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = (typeof WORKING_DAYS)[number];

// Type aliases (not interfaces) so these are assignable to Prisma's InputJsonValue.
export type WorkingTimeRange = {
  startTime: string;
  endTime: string;
};

export type WorkingDayConfig = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  additionalHours: WorkingTimeRange[];
  standardHours: string;
  breakMinutes: number;
};

export type WorkingHoursMap = Record<DayOfWeek, WorkingDayConfig>;

// Schedules saved before these fields existed omit them.
export type WorkingDayInput = Omit<WorkingDayConfig, 'additionalHours' | 'breakMinutes'> &
  Partial<Pick<WorkingDayConfig, 'additionalHours' | 'breakMinutes'>>;

export type WorkingHoursInput = Record<DayOfWeek, WorkingDayInput>;

export const DEFAULT_WORKING_HOURS: WorkingHoursMap = {
  Monday: { enabled: true, startTime: '07:00', endTime: '15:00', additionalHours: [], standardHours: '', breakMinutes: 30 },
  Tuesday: { enabled: true, startTime: '07:00', endTime: '15:00', additionalHours: [], standardHours: '', breakMinutes: 30 },
  Wednesday: { enabled: true, startTime: '07:00', endTime: '15:00', additionalHours: [], standardHours: '', breakMinutes: 30 },
  Thursday: { enabled: true, startTime: '07:00', endTime: '15:00', additionalHours: [], standardHours: '', breakMinutes: 30 },
  Friday: { enabled: true, startTime: '07:00', endTime: '15:00', additionalHours: [], standardHours: '', breakMinutes: 30 },
  Saturday: { enabled: false, startTime: '', endTime: '', additionalHours: [], standardHours: '', breakMinutes: 0 },
  Sunday: { enabled: false, startTime: '', endTime: '', additionalHours: [], standardHours: '', breakMinutes: 0 },
};

// Staff who never saved a schedule follow the app default; a day that is off returns null.
export function regularHoursFor(
  schedule: Partial<WorkingHoursMap> | null | undefined,
  weekday: DayOfWeek
): WorkingDayConfig | null {
  const day = schedule ? schedule[weekday] : DEFAULT_WORKING_HOURS[weekday];
  return day?.enabled && day.startTime && day.endTime ? day : null;
}
