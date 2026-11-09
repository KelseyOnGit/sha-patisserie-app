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

### Roster notification emails

Published roster emails list shifts chronologically by start date and time,
including multiple shifts on the same day. Dates and times display in Perth
time. Email formatting sorts a copy, leaving the original shift list unchanged.
Check: `node --test tests/roster-email.test.cjs`.

### Worked hours versus paid leave

Bulk timesheet approval preserves unchanged payable periods (including seconds
and split shifts). New timesheets, existing-timesheet corrections, attendance
allocations and audit entries each use one batched database write inside one
serializable transaction, rather than a query per row. Existing corrections
and allocations use parameterized PostgreSQL updates with per-row version and
ownership checks; any mismatch rolls back the entire batch. A failed save
commits no partial approvals.
Serialization conflicts are retried at most twice against freshly loaded data.
Stale versions still require a refresh. Database transaction timeouts are shown
explicitly; retry after refreshing or approve one staff member at a time.
Validation errors identify the staff member and work date. Server logs retain
the underlying database error for diagnosis; the generic error alone does not
establish whether a failure was caused by timeout, connectivity or schema issues.

Timesheet entries classified as Annual leave or Personal leave are excluded
from weekly worked-hour totals. Payroll table and CSV use matching columns:
Staff Member, Employment Status, Site, Rate, Worked Hours, Leave Hours, Total,
Total Gross, Leave Type and Leave Date (dd-mm-yyyy). There is no separate leave
table. Total is worked plus paid leave hours; Total Gross is Total times rate.
Unpaid leave can appear in the type/date columns but adds no paid hours.
Approved leave
records are used for leave hours; a matching staff/date/type timesheet entry
does not add the same leave a second time. Without a matching leave record,
the approved, current classified timesheet's net hours are used for payroll
leave hours. Pending classified entries remain visible in weekly review only.

Approved leave does not automatically subtract actual work. If worked hours
and approved leave occur on the same day, the weekly row shows a warning for
manager review. Classify a leave-only entry correctly rather than deleting
genuine attendance. Four 8-hour worked days plus an 8-hour Annual leave entry
therefore show 32 worked hours and 8 Annual leave hours, not 40 worked hours.
For example, 32 worked hours plus 7.5 Annual leave hours at $35.45 gives 39.5
total paid hours and $1,400.28 displayed gross. Leave is assigned once per
staff/site/rate, including leave-only staff. Approved leave uses the current
profile rate and profile site; classified-only approved leave uses its approved
timesheet rate/site. Different rates stay on separate lines. A missing rate is
flagged and gross is left blank rather than treated as zero. Leave awaiting a
cancellation decision remains payable until cancellation is approved.

### Clock-in venue locations

Clock-in/out checks live GPS against the selected venue, independently of login.
Zushi Bento uses the Google Maps business pin at **125 St Georges Terrace,
Brookfield Place, Perth**: latitude `-31.9544448`, longitude `115.8548311`, with
the existing **200 m** radius. The Maps listing labels the unit `11/125`;
confirm tenancy numbering separately if using `CC108` in business records.
Source: [Zushibento business pin](https://www.google.com/maps/place/Zushibento/data=!4m6!3m5!1s0x2a32bad50922d4f1:0x29c445be1d731d01!8m2!3d-31.9544448!4d115.8548311!16s%2Fg%2F11xxgqdyx).
The coordinates live in `lib/geo.ts`; deploy the updated server for them to take
effect. Do not select Sha Patisserie to work around a Zushi Bento location error:
clock-ins are recorded against the venue selected. Attendance now matches the
staff member's overlapping roster regardless of venue; payroll uses the roster
venue for matched records. Ask an admin to review entries recorded at the wrong venue.

Check: `node --test tests/geo.test.cjs`.

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

### Leave-request email notifications

After verifying `shagroup.com.au` in Resend, configure the following in the
application environment and hosting dashboard, then restart/redeploy:

```dotenv
RESEND_API_KEY=<your sending API key>
FROM_EMAIL=Sha Staff <notifications@shagroup.com.au>
ADMIN_NOTIFY_EMAILS=tricia@shagroup.com.au
APP_URL=https://staff.shagroup.com.au
NEXT_PUBLIC_APP_URL=https://<your actual staff app hostname>
```

Do not commit API keys. `EMAIL_FROM` is supported as a legacy sender setting;
`FROM_EMAIL` takes precedence. Use the actual app URL, not the Resend dashboard
or just the email domain. Production links require HTTPS. Additional recipients
can be added as comma-separated addresses; each receives a separate email.

`APP_URL` is the server-only base URL for admin notification links and takes
precedence over `NEXT_PUBLIC_APP_URL`. Set it in Vercel **Production** to
`https://staff.shagroup.com.au`, then deploy again. `NEXT_PUBLIC_APP_URL` remains
supported for admin notifications and is still required for verification emails;
public variables must exist when Next.js builds. Local `.env` edits do not
configure a hosted deployment. A missing URL stops sending before Resend is
called; changing the email layout cannot fix that configuration error.

Staff leave submissions, proposed changes and cancellation requests send one
notification per request to these recipients, after the database transaction
commits. A multi-day request does not send an email per day. Emails include the
staff name, leave type, dates in dd-mm-yyyy, total hours, staff note and a link
to the admin Leave Requests page. Manager-created, immediately approved leave
and review/withdrawal actions do not send these review notifications.

Leave and pending-user emails share a branded HTML layout with a dark Sha
Patisserie header, summary card and green review button plus a fallback link.
Consecutive dates appear as a range (10-02-2027 to 28-02-2027); gaps remain
separate ranges, and single-day requests show a single date. The requested-day
count and hours are unchanged. Styling applies to newly sent emails only.
Recipient validation and precise configuration errors remain in place, as do
per-recipient delivery logs and Resend email IDs. Keep all four Production
settings configured when deploying the restored layout.

### Scheduled missing clock-in / clock-out alerts

Vercel runs `/api/cron/attendance` every minute in Production. This frequency
requires a Vercel plan that supports minute-level cron jobs. Before enabling:

1. Set a strong random `CRON_SECRET` in Vercel Production, along with the email
   settings and `APP_URL` above. Vercel supplies it as the Bearer authorization
   header; unauthenticated requests cannot run the check.
2. Apply the committed Prisma migration to the intended production database
   using `npx prisma migrate deploy` through your normal deployment process.
   The `AttendanceNotification` table must exist before cron runs.
3. Deploy the code with the application folder as the Vercel Root Directory,
   so Vercel picks up its `vercel.json`. Check that the deployment is Ready and
   the attendance cron appears in the project's Cron Jobs.

Only published shifts for active, approved staff are checked. Missing clock-in
is checked from scheduled start + 15 minutes until the shift ends. Missing
clock-out is checked from scheduled end + 15 minutes while an overlapping
attendance session remains open. Attendance matches staff and time regardless
of Sha/Zushi venue, using the existing payroll matching helper. An ongoing
subsequent published shift suppresses a premature clock-out alert.

These are reminders for staff who **still have not clocked in/out**, not reports
of people who already clocked late. Checks run without a browser being open.
They run every minute, so an alert is eligible at 15 minutes and normally sent
at the next invocation, not guaranteed at the exact second. Provider delivery
can take longer. The first run also checks overdue shift ends from the last
24 hours; it does not scan older history.

Persistent claims prevent concurrent cron jobs from sending the same alert,
and each recipient is marked sent separately. Failed recipients retry while
the attendance condition remains overdue; successful recipients are skipped.
Resend idempotency keys protect retries after interrupted jobs. Changing a
scheduled start/end creates a new alert identity. Delivery failures are logged
and the cron responds with an error rather than reporting success.

### Leave and registration delivery failures

Delivery/configuration failures are logged and the staff response explicitly
says the leave was saved but the email failed. Do not resubmit the leave to
retry email. There is no automatic delivery retry or historical backfill.
Resend acceptance does not guarantee inbox delivery; check the Resend dashboard
for delivery/bounce status. Registration verification remains independently
controlled by the flag below.

New staff registrations also notify the same `ADMIN_NOTIFY_EMAILS` recipients
after the account is saved, with name, email, Perth registration date/time and
a link to `/admin/users`. No PINs or verification tokens are included.
Notifications are sent at registration, even when email verification is enabled;
the email explains that verification must finish before approval in that mode.
Duplicate/invalid registrations do not notify again. Admin-mail failure leaves
the account intact and adds an explicit warning to the registration response.
There is no automatic notification retry. The Resend sample `/api/send` route
is not used or required; notification flows call the shared server mail helper.

For production delivery troubleshooting, inspect runtime logs for the
successful `POST /api/leave` (HTTP 201). `Leave notification trigger` identifies
whether sending was requested or intentionally skipped for manager-created,
immediately approved leave. `Leave notification dispatch` records the recipient
count. `Leave notification accepted by Resend` records each recipient and
provider email ID; search that ID in the Resend account associated with the
deployed API key. Acceptance is not inbox delivery. Configuration or recipient
failures are logged explicitly. API keys and leave notes are not logged.

Validate without sending live mail:
`node --test tests/leave-notifications.test.cjs`.
For a real smoke test, temporarily set the recipient to an authorised test
mailbox and submit one multi-day request; verify one email, correct dates and
the admin link, then restore Tricia's recipient address.

### Email verification and approval

**Temporarily disabled while Resend setup is pending:** email verification is
opt-in via `NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED=true`. With the flag unset or
`false`, staff follow **Register -> admin approval -> sign in**, with no Resend
call or email configuration required. Existing unverified pending sign-ups can
also be approved; they do not need to register again. Approval, ACTIVE status,
PIN checks and role restrictions remain mandatory. The bypass does not mark
addresses as verified or change existing database records.

To re-enable verification, finish the configuration below, set the flag to
`true` **before building**, then rebuild and deploy the server and UI together.
This public, non-secret flag is inlined into the client build; keep the same
value in build and runtime environments. Re-enabling also requires previously
bypassed accounts to verify before their next login/session check; arrange
verification using the resend form and their existing PINs.

When enabled, new staff follow **Register -> verify email -> admin approval -> sign in**.
Verification links expire after 24 hours and are consumed atomically once.
Unverified registrations remain visible in Pending Approvals with an
**Awaiting email verification** label; approval is disabled and the API also
rejects approval until verified. Remove remains available. Login and existing
session validation both require verification, approval and ACTIVE status.
Use **Refresh verification status** (or **Refresh pending users** while disabled) to pick up emails verified while the list
was open, without losing the page.

Before deploying, back up and confirm the database, inspect pending migrations,
and apply `20261028010000_email_verification_flow` using `npx prisma migrate deploy`.
It adds the email fields if absent and **grandfathers all already-approved accounts**
by setting their verification flag to true once. This preserves current staff access;
it is not evidence that those historical addresses were verified by email.
Pending accounts are not grandfathered. Deploy migration before the new server
so approved staff are not locked out. Do not use database reset or db push.

Configure these on the deployed server (never commit secrets):

- `RESEND_API_KEY`: your Resend API key.
- `FROM_EMAIL`: a sender on a domain verified in Resend, for example
  `Sha Staff <noreply@shagroup.com.au>`. `EMAIL_FROM` is supported as a legacy alias;
  `FROM_EMAIL` takes precedence. Verification requires an explicit sender; no
  Resend test-domain fallback is used by this flow.
- `NEXT_PUBLIC_APP_URL=https://staff.shagroup.com.au`: production requires an
  explicit HTTPS URL, not a localhost fallback.

Sending does not require purchasing a mailbox, but you must control the sender
domain and configure the DNS records Resend provides. Create/use a monitored
mailbox instead if staff should be able to reply to this address. Domain
verification, DNS, production environment configuration and actual delivery
must be checked separately; an accepted send is not a guarantee of inbox delivery.

Registration stays on the confirmation screen instead of redirecting immediately.
Failed delivery is an explicit error and preserves the pending account for recovery.
**Resend verification email** on registration/login opens `/verify-email`; enter
the original email and PIN to request a replacement. Requests are limited to
one per account per minute using database token expiry and conditional updates
(including across server instances). A replacement invalidates the previous link.
Expired/reused links have a friendly recovery page. Existing pending accounts
created through the admin staff form can use this same recovery form with their
assigned PIN. This is not a forgotten-PIN reset flow.

Checks: `node --test tests/email-verification.test.cjs tests/auth-security.test.cjs tests/account-management.test.cjs`.

## Worked-hours review and payroll

### Mobile admin layouts

Below 1280 px, payroll and roster keep a compact grid with staff names pinned on
the left and column headers pinned at the top. Swipe dates/payroll columns
sideways and scroll staff vertically inside the grid (up to 70% of the viewport
height). All seven days, staff totals and approval actions remain available.
Desktop table layouts remain unchanged at 1280 px and wider.

Admin Users and Staff Profiles still stack rows vertically to fit narrow screens.
The dashboard's Active staff, Pending users and Upcoming shifts summary cards are
hidden below 768 px; quick links and live attendance remain available.
Payroll's staff count, pending approval count and approved-hours summary cards
are also hidden below 768 px on both report tabs.

Filters and approval controls wrap to the available width.
Venue, Staff and Status filters collapse behind a Filters button below 1280 px,
with an active-filter count; the week picker stays compact and visible.
Regular-hours Add/Edit buttons stay visible on touch layouts rather than requiring hover.
Roster and timesheet dialogs scroll vertically within the viewport, with
full-width mobile inputs. These are presentation changes only: approval,
permissions, payroll calculations, roster publishing and save handlers are unchanged.

Checks: `node --test tests/mobile-admin.test.cjs tests/account-management.test.cjs`.
The mobile fixture tests use synthetic staff data. Set `MOBILE_FIXTURE_DIR` to
an external scratch folder to render the actual components for browser checks
with the application stylesheet; no real accounts or database writes are needed.

### Attendance-session breaks

Clocked-in staff can record one break per active clock-in session, including
unscheduled work, overnight work and work past a rostered finish time. No roster
shift is created just to enable a break. Start/End Break uses the signed-in user's
active attendance session (within the existing 16-hour clock-session window), not
the venue selector or a client-supplied employee ID. End the break before clock-out.
The countdown is a guide only; payroll uses the actual recorded duration.
Clock status refreshes on focus and every 30 seconds; failed break-status lookups
are shown explicitly with a retry control.

The current week's payroll report refreshes in the background every 15 seconds
while visible, pausing during saves and while Details is open. Local adjustment
drafts are retained. Recorded breaks show **Break taken** and their actual duration;
live open breaks show **On break** with an elapsed minutes/seconds timer updated
every second. Past unfinished breaks are flagged rather than ticking indefinitely.
No recorded break is labelled **Not recorded**, not assumed to be a roster preset.
The elapsed timer is display-only and does not change payable values or approval
snapshots; approval still requires completed attendance and server validation.

New break timestamps are stored on TimeLog. Existing roster-based breaks are
retained and can still be finished in their original record. Payroll deducts
completed recorded breaks instead of adding them to a roster preset; unscheduled
hours still require manager review and an explanation before approval. Changes to
recorded session breaks invalidate affected approval snapshots, while historical
approvals with no new session breaks retain their original snapshot format.

Historical roster-based breaks remain visible even if their roster shift is
unpublished. Attendance and breaks match the same employee's overlapping roster
by time, regardless of the Sha/Zushi venue selected at clock-in. A unique match
combines attendance and recorded breaks on one roster row rather than creating
an additional attendance entry solely for a venue mismatch. Payroll uses the
roster venue; raw clock-in venue, GPS and timestamps are not rewritten.
Overlapping roster matches remain separate and flagged for manager review:
the clock-in venue is not used to guess between them. Saved reviews retain
their existing attendance allocation; changed source snapshots require review.
Unpublished roster shifts still show **Roster shift unpublished** and cannot
be approved until published.
Ordinary drafts without recorded breaks remain excluded. No timestamps are
copied or backfilled, and the change does not invent missing break durations.
Active legacy break lookup also ignores venue, so those breaks remain finishable
and cannot be recorded twice by changing venue. GPS checks still apply to the
selected venue when clocking in or out.

Before deploying this code, back up and confirm the target database, then apply
the additive `20261028000000_attendance_session_breaks` migration using the normal
`npx prisma migrate deploy` workflow. This adds nullable start/end columns to
TimeLog and validates their order; it does not rewrite historical attendance.
Inspect all pending migrations before deploying, and do not use database reset.
Generate the Prisma client (`npx prisma generate`, also run by `npm run build`)
and deploy the updated server and UI together.

Checks: `node --test tests/attendance-breaks.test.cjs tests/timesheet-overlap.test.cjs tests/timesheet-performance.test.cjs`.

Staff Payslips navigation and content are temporarily commented out pending MYOB
integration. The payroll Approved Leave table and leave CSV rows are also hidden
until leave calculations are verified. Worked-hours review, worked-payroll totals
and exports, leave requests, and roster leave cards remain available.

### Account approval and role management

Staff Profiles defaults to **Show Active**. Use the status filter on the right
to **Show Inactive** or **Show All**, and the name search on the left to narrow
the selected list (case-insensitive). These filters do not change account status.

To end employment, open the individual profile, choose **Edit Profile**, select
**End Profile**, confirm the popup, then **Save Profile**. Cancelling the popup
does not change status; confirming stages the change until it is saved.
Inactive staff appear last under **Inactive staff** in Show All, with light-red rows.
They are hidden from the current and future weekly rosters, and cannot receive new
shifts (including regular-hours fill and duplication). Dashboard attendance rows,
alerts, attendance totals and upcoming-shift counts exclude currently inactive
staff, even when saved shifts or clock-ins exist for them. This also applies when
requesting a past date through the dashboard attendance API. In past roster weeks they remain
visible with an Inactive badge at venues where they have saved shifts, even if
their profile's venue changed. Their existing historical shifts remain editable,
but their name is not offered for new shifts. Historical corrections must be
republished and any affected payroll approvals reviewed again.
Ending employment does not delete shifts, attendance, approvals or payroll history;
previously approved hours remain payable unless their underlying source is changed.

In Pending Users, select Staff or Admin before approval. Only Admins can approve
Admin accounts; Managers can approve registrations as Staff only. Admins can use
Move to Admin in Staff Profiles and Move to Staff in the separate Admin Users
list. Pending accounts must go through approval first. Role changes retain venue,
profile, shifts, leave, attendance and payroll records; returning to Staff makes
the account schedulable at its saved venue again.

Use **Remove** beside Approve to permanently delete an unwanted pending sign-up
after confirmation. Admins and Managers can remove unapproved PENDING accounts;
only Admins can remove pending Admin accounts. Approved accounts, your own account,
and accounts with any roster, attendance, leave or payroll history cannot be
removed here. Use End Profile for existing staff to preserve their records.

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

Reports use an in-memory cache keyed by signed-in account and week. Revisiting
a report within one minute reuses its data; older data refreshes in the background.
Saves and manual Refresh update the report without blanking the table. Unsaved
adjustments on other rows are retained; changing weeks clears local drafts.
Approvals/exports are disabled while refreshing or after a refresh error.
Logout clears the client query cache. Server-side version/snapshot validation
still checks every save; cached figures never bypass approval validation.

Report loading starts independent leave, review, attendance and venue reads
together and selects only the user/shift/log fields the report needs. Matching
indexes published shifts by employee instead of scanning everyone's roster for
each clock-in. The weekly table indexes rows by employee/day and reuses Perth
date/time formatters. These optimizations do not cache server approval decisions
or truncate overnight attendance, audit history or payroll records.

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
  The weekly table unlocks past-day adjustment and classification controls,
  labels an absent clock-out as **Missing clock-out**, and requires a review
  reason before approving those hours. Today/future unfinished attendance stays
  locked. Approved entries must be reopened before editing.
- Attendance is matched when the staff member agrees and the log overlaps one
  published roster shift (or an unpublished shift with recorded break evidence),
  regardless of the clock-in venue. Payroll uses the matched roster venue.
  Attendance overlapping several shifts stays
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
