export const staffListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  isApproved: true,
  employmentType: true,
  regularWorkingHours: true,
  createdAt: true,
  location: { select: { code: true, name: true } },
} as const;

export const shiftUserSelect = {
  id: true,
  name: true,
  role: true,
  employmentType: true,
} as const;
