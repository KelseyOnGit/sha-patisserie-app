# Roster, Working Hours, and Staff Profile Guide

This guide explains the staff scheduling and profile code in the active Next.js app, including where each behavior lives, how the browser and API communicate, and what the stored fields mean.

## The Main Mental Model

There are three related but separate concepts:

1. **A roster shift** is a specific assignment for one staff member on one date, with a start, end, role, location, and break length. It is stored as a `Shift` row.
2. **Regular working hours** are a recurring weekly availability template for a staff member. It is stored as JSON on `User`. Saving this template does not create actual roster shifts.
3. **A shift break** is the break attached to one specific roster shift (`Shift.breakMinutes`). The regular-hours break value is a separate default/planning value and does not automatically create a break event or adjust clock records.

The roster page is now a staff-by-week grid: staff are rows and dates are columns. Use the `+` in a cell to add a shift for that staff member on that date. Existing shift cards open for editing.

## Active App Location

The working Next.js app is the nested project folder:

```text
sha-patisserie-app/
  app/
  components/
  lib/
  prisma/
```

Run app commands from that directory. In the Next.js App Router, a route file named `route.ts` maps to the URL formed from the folders above it. For example:

```text
app/api/shifts/route.ts
```

maps to:

```text
/api/shifts
```

Avoid adding a `routes/` folder unless `/routes` should be part of the URL.

## File Map

- [Roster page](../app/admin/roster/page.tsx): weekly staff grid, date/location controls, shift modal, staff availability filtering.
- [Shift API](../app/api/shifts/route.ts): authenticated shift reads and privileged shift creation/update.
- [Staff profile component](../components/StaffProfile.tsx): profile details and recurring working-hours editor.
- [Working-hours API](../app/api/admin/staff/working-hours/route.ts): validates and persists recurring schedules.
- [Profile update API](../app/api/admin/staff/update/route.ts): loads/saves user profile fields.
- [Prisma schema](../prisma/schema.prisma): User, Shift, enums, and JSON fields.
- [Prisma migrations](../prisma/migrations): SQL schema changes applied to the database.

## Roster Grid: Click to Create or Edit

### Grid data

The roster page loads users and shifts through two requests:

```ts
const [usersResponse, shiftsResponse] = await Promise.all([
  fetch('/api/users'),
  fetch('/api/shifts'),
]);
```

It builds the week with `weekDays`, then groups shifts by date and selected location in `shiftsByDay`. The UI displays one row per staff member and one column per day. Each cell filters that day’s shifts to the current staff member.

### Adding a shift

Clicking a cell’s `+` calls `openShiftForm(user.id, day.date)`. That function opens the modal with the clicked user and date already selected, and defaults the times to 9:00 am–5:00 pm. The form still lets the manager change the staff member, dates/times, break, role, and notes.

Saving creates a shift with `POST /api/shifts`. Editing a shift card opens the same modal and saves with `PUT /api/shifts`.

Simplified flow:

```text
Click staff/day +
  -> openShiftForm(staffId, date)
  -> select/edit shift details
  -> POST /api/shifts
  -> refresh users and shifts
```

### Availability and overlapping shifts

`availableUsers` filters staff assigned to the selected venue and removes people with another shift that overlaps the requested interval. The overlap rule is:

```ts
existingStart < requestedEnd && existingEnd > requestedStart
```

This catches partial overlaps and shifts that fully contain one another. When editing, the shift currently being edited is excluded from the conflict check; otherwise a shift would conflict with itself.

The availability check is in the browser and reflects the shifts currently loaded on the page. If multiple admins can schedule simultaneously, the API should also enforce overlap rules server-side to prevent two requests from racing.

### Timezone and hydration

Shift labels use `Australia/Perth` explicitly:

```ts
new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Perth',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(value));
```

An explicit locale and timezone keep server-rendered and browser-rendered labels consistent. Using the browser’s default `toLocaleTimeString()` can produce different text between server and client and trigger a React hydration warning.

## Regular Working Hours

A weekly schedule has one record per weekday. Each day includes an enabled flag, a primary time range, optional extra ranges, standard hours, and break minutes. Conceptually:

```ts
{
  Monday: {
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    additionalHours: [{ startTime: '18:00', endTime: '20:00' }],
    standardHours: '8',
    breakMinutes: 30,
  },
}
```

The actual object contains all seven days. `+ Add hours` appends another `{ startTime, endTime }` range for that weekday; up to five extra ranges are supported. These ranges are recurring availability data, not separate `Shift` rows.

For backwards compatibility, older saved schedules without `additionalHours` load with an empty list. Older schedules without `breakMinutes` use 30 minutes on enabled days and 0 on disabled days.

### Persistence flow

The component loads from `GET /api/admin/staff/working-hours?userId=...` and saves with `POST` to the same route. The API:

- requires a valid session;
- allows the user to access their own schedule, and privileged roles to access other users;
- validates weekday objects, time strings, extra ranges, and break minutes;
- normalizes defaults for older schedule objects;
- stores the complete schedule in `User.regularWorkingHours` as Prisma JSON.

`WorkingHoursPolicy` records `CUSTOM` or `POLICY`. A policy selection currently records the selected mode; it is not a reference to an external policy definition.

### Break concepts

The profile’s recurring working-hours `breakMinutes` describes the planned break for that weekday. The roster modal has a separate break control, and its value is stored on that specific shift in `Shift.breakMinutes`.

Changing the recurring setting does not retroactively alter existing roster shifts. When a new shift should inherit the recurring value automatically, that behavior needs to be implemented explicitly in the roster form or API.

## Staff Profile and Registration

The profile form loads its values from the profile API and starts read-only. **Edit Profile** enables editing; **Cancel** restores the last saved values; **Save Profile** posts the changes. Name, email, and contact number are associated with registration data, so they populate from the user record rather than starting as blank inputs.

The User model also stores pay and tax information:

- `hourlyPayRate` (`Decimal?`): hourly rate;
- `rateLastUpdated` (`DateTime?`): effective/update date;
- `workingRightStatus` (`WorkingRightStatus?`): work-right category;
- `claimTaxFreeThreshold` (`Boolean?`): nullable so an unknown/unset answer is not treated as false.

Signup captures an optional contact number. Existing accounts without one continue to show an empty value until it is supplied.

## Authentication and Authorization Concepts

API routes use the session helpers from `lib/session.ts`:

```ts
const session = await getSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Some endpoints require `isPrivilegedRole(session.role)`, which permits admin/manager operations. The working-hours endpoint also allows a signed-in user to access their own record. A `401` means there is no valid session; a `403` means the session exists but does not have permission.

## Prisma Schema and Migrations

`User.regularWorkingHours` is a nullable JSON field so older users can have no schedule saved. `User.workingHoursPolicy` is an enum with a default. The profile pay/tax columns and working-hours fields were added by migrations in `prisma/migrations/`.

When changing the Prisma schema:

1. Edit `prisma/schema.prisma`.
2. Validate it with `npx prisma validate`.
3. Create/apply a migration using the project’s database workflow.
4. Run `npx prisma generate` so TypeScript and runtime queries use the updated client.
5. Restart the dev server if it holds Prisma’s Windows query-engine DLL open.

A generated-client error such as “field does not exist in `UserSelect`” often means Prisma Client is stale, even if the schema file already contains the field.

## Useful Commands

Run these from `sha-patisserie-app/`:

```powershell
npm run dev
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npx eslint app/admin/roster/page.tsx components/StaffProfile.tsx app/api/shifts/route.ts app/api/admin/staff/working-hours/route.ts
```

Only use `migrate deploy` when the intended migration is present and you mean to apply it to the configured database. The local dev app runs at `http://localhost:3000` unless that port is already occupied.

## Current Verification Notes

The roster page and working-hours route have been type-checked at the editor diagnostics level during development, and the roster page has returned HTTP 200 locally. The roster page has also shown an existing ESLint warning/error around calling `loadData()` from an effect; that lint finding is separate from the shift-grid behavior.
