This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run the command from the application directory, not the parent repository directory:

```powershell
Set-Location C:\Users\kelsey.wang\sha-patisserie-app\sha-patisserie-app
npm run dev
```

Keep that terminal running while using the site. If the PowerShell prompt returns,
the server has stopped and the browser cannot connect; check the terminal output
and restart it. Press `Ctrl+C` when you want to stop the server.

Use `http://localhost:3000` on the computer running the server. On another device,
use the Network URL printed by Next.js, on the same local network.

## Authentication deployment checklist

- Set a strong, unique `JWT_SECRET` in each environment. The app refuses to start
  without it; no default signing key is used. Rotate the secret before launch if
  the fallback was previously used; rotation signs everyone out.
- GPS test coordinates are ignored when `NODE_ENV=production`, even if
  `GPS_TEST_MODE=true`. Leave GPS test mode unset in production.
- New PINs are salted and hashed with scrypt. Login accepts only hashes, never
  plaintext credentials. PINs and hashes are excluded from user and shift API
  responses; the staff directory endpoint requires Admin or Manager access.
- Before enabling the new login code against an existing database, stop older
  app versions from writing plaintext PINs and take a database backup. Confirm
  the application `.env` `DATABASE_URL` targets the intended database, then run:

  ```powershell
  npm run pins:migrate
  npm run pins:migrate -- --apply
  ```

  The first command reports counts only without changing records. The second
  verifies each hash against the existing PIN, then updates credentials in one
  transaction. It is safe to repeat and never prints PINs or hashes. It uses
  `DATABASE_URL`, not Prisma's migration connection setting. Run separately for
  development and production; do not copy production credentials into source.
  No schema migration is needed because the existing PIN column is text.
- Previously exposed PINs must be treated as compromised. Hashing does not
  revoke a known PIN: arrange credential resets before launch. This change does
  not implement a reset workflow or login rate limiting, and is not a complete
  launch security assessment.

Focused checks: `node --test tests/auth-security.test.cjs`.

## Worked-hours review and payroll

Staff Payslips navigation and content are temporarily commented out pending MYOB
integration. The payroll Approved Leave table and leave CSV rows are also hidden
until leave calculations are verified. Worked-hours review, worked-payroll totals
and exports, leave requests, and roster leave cards remain available.

### Account approval and role management

In Pending Users, select Staff or Admin before approval. Only Admins can approve
Admin accounts; Managers can approve registrations as Staff only. Admins can use
Move to Admin in Staff Profiles and Move to Staff in the separate Admin Users
list. Pending accounts must go through approval first. Role changes retain venue,
profile, shifts, leave, attendance and payroll records; returning to Staff makes
the account schedulable at its saved venue again.

You cannot change your own role, and the last active approved Admin cannot be
demoted. Role changes use a serializable transaction. Sessions read the current
role and active/approved state from the database on each request, so an old cookie
cannot retain Admin access after demotion. Existing Managers retain their role
unless an Admin explicitly moves them; this workflow does not assign Manager.

Run `node --test tests/account-management.test.cjs tests/auth-security.test.cjs`.

### Admin weekly roster

Shift entry, editing, day grouping and weekly repeats use Perth time (UTC+08),
independent of the browser/server timezone. Timezone-free shift API inputs are
interpreted as Perth time; timestamps with an explicit offset retain their instant.
Existing incorrectly saved shifts are not automatically moved: edit their start/end
to the intended Perth times, save, and republish. Regular-hours changes do not
overwrite existing saved shifts.

Staff Profiles and shift rosters include Staff and Manager accounts, not Admin
accounts, using each user's current role. Promoting a user to Admin removes them
from these lists on refresh and prevents assigning, auto-filling, duplicating or
publishing roster shifts for them. Existing shifts, attendance and payroll history
are retained; changing a role does not delete historical records.

The admin roster shows WA public holidays from [the holiday list](lib/holidays.ts)
in each matching date header. Approved leave appears in green on the staff member's
leave dates, showing only the leave type, without a status label or hours. Leave awaiting cancellation stays
visible until the cancellation is approved; pending, rejected and cancelled leave
are not shown as approved time off. Existing shifts and regular-hours suggestions
are hidden on leave dates. Saved shifts are not deleted and reappear if the leave
is cancelled (unless the date is a public holiday). Public holiday columns hide
all shifts, regular-hours suggestions and add-shift buttons, while retaining
holiday labels and leave cards. Saved shifts are not deleted.
This is a roster display, not a change to payroll calculations or shift creation.
Returning to the roster browser tab refreshes staff, shifts and leave.

Run the focused roster tests with `node --test tests/roster.test.cjs`.

If the staff roster returns HTTP 500 with `invalid input value for enum
"LeaveStatus": "CANCEL_REQUESTED"` in the server log, deploy the
`20261021000000_correct_leave_cancellation_status` migration with
`npx prisma migrate deploy`. It corrects the legacy database spelling
`CANCLE_REQUESTED` without deleting leave records and leaves correctly spelled
databases unchanged. Do not edit an already-applied migration or reset the database.

### Worked-hours review

Admins and managers can use **Payroll Reports > Confirm Worked Hours**. Choose a
Monday, then filter by venue, staff or review status. All dates/times use Perth
(UTC+08), including full dates for overnight work.

- Original clock-in/out records and recorded breaks are read-only.
- Recorded break duration comes from actual break-start/end timestamps, not the
  roster's break field (which is also used as a preset). If no break was recorded,
  the preset is clearly shown as a suggestion; a manager must explain any deduction.
- **Review / Edit** opens separate payable periods and a payable break deduction.
  Time fields show hours/minutes and start from actual attendance on new reviews;
  existing reviews retain saved payable values. The shift date is kept automatically.
  Earlier end times roll over to the next day and show a `+1 day` label. Existing
  overnight periods retain their starting day. Unedited original timestamps keep
  their seconds; manually edited times use whole minutes.
  Multiple periods exclude clock-out gaps; do not deduct those gaps again as breaks.
  Explain any changes, missing attendance, or unscheduled work.
- **Save changes** persists a pending review. **Save & approve** records the
  approver, timestamp, hourly rate and an audit entry, and includes the hours in payroll.
- Approved rows are locked. **Reopen for correction** requires a reason, removes
  the hours from payroll, and retains the previous approval in history.
- No attendance is not evidence of a no-show. Review it manually; zero periods
  with a zero break deduction can explicitly approve zero payable hours.
- Current/future unfinished attendance or breaks, future payable hours and missing
  staff rates block approval. Past unfinished attendance can be reviewed with
  explicit payable periods and a reason; raw timestamps are never overwritten.
- Attendance is matched only when the staff member and venue agree and the log
  overlaps one published roster shift. Attendance overlapping several shifts stays
  in a separate row unless already allocated to a saved review. Open **Details**,
  verify the payable periods and enter a reason explaining the allocation; bulk
  approval will not automatically approve these rows. Approved overrides appear
  in payroll and CSV using the saved rate. Attendance is allocated to only one
  timesheet, and overlapping payable periods for the same staff member are rejected,
  including across venues and within a batch. Unscheduled attendance remains visible.
- Changed attendance, break records or roster details invalidate an existing
  approval for payroll until it is reopened and reviewed again.
- Reviewed roster shifts cannot be deleted or reassigned to another staff
  member, date or venue: their identity and history must remain available.
- **Payroll Summary**, CSV export, and the legacy `/reports` page use only valid,
  approved payable periods. Rates are captured at approval, grouped by staff,
  venue and rate. No scheduled-hours or default-rate fallback is used. This is
  gross hourly pay, not overtime/award/tax calculation. Hours are not rounded;
  display/CSV totals are formatted to two decimal places.

### Database setup and tests

Run commands from the application directory. In its untracked `.env`, set
`DATABASE_URL` to the Neon pooled connection string and `DIRECT_URL` to the direct
connection string for the same branch and database. The app uses `DATABASE_URL`;
Prisma migrations use `DIRECT_URL`. Copy both strings from Neon and do not commit
them. Local development should use the development branch, not production.
Avoid defining these variables again in `.env.local`, where Next.js overrides
`.env` while the Prisma CLI does not load `.env.local`. Configure both variables
in the corresponding Vercel environment as well, keeping Preview databases
separate from Production. After changing the environment, restart the dev server.

The additive SQL is in
`prisma/migrations/20261012000000_add_timesheet_review/migration.sql`.
With a complete migration history, deploy migrations and regenerate the client:

```powershell
npx prisma migrate deploy
npx prisma generate
```

This checkout currently has an older empty migration folder
(`20261007010000_unique_shift_per_staff_time`), which blocks normal deployment.
Do not reset the database or delete migration history to bypass it. Restore the
original migration history before normal deployment. For this existing database,
the new additive SQL can be applied once using `prisma db execute --file` and
recorded as applied with `prisma migrate resolve --applied
20261012000000_add_timesheet_review`; neither command requires a data reset.

Focused tests use the existing Node and TypeScript installations:

```powershell
npm run test:timesheets
$env:RUN_TIMESHEET_DB_TESTS = 'true'
npm run test:timesheets
Remove-Item Env:\RUN_TIMESHEET_DB_TESTS
```

Database tests create isolated fixture staff/attendance, exercise the actual
review API and report calculations, then roll back every fixture and change.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
