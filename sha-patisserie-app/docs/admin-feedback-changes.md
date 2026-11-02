# Admin Feedback – Changes To Make

Collected from Vanessa, Tricia and Kelsey (30 Oct – 1 Nov 2026).
**Status: documentation only. Nothing has been changed yet.**

## 1. Payroll / Worked Hours (highest priority)

| # | Issue | Notes / To verify |
|---|-------|-------------------|
| 1.1 | "Save and Approve All" is blocked when staff did not clock in, even after times are adjusted. Tricia must enter every shift for every person manually in Details. | Decision: remove the reason requirement, or make it optional (it is the audit trail). |
| 1.2 | Remove the explanation requirement when editing. | Same decision as 1.1. |
| 1.3 | After approval, lock the row and show "Approved by [name]" with date/time. Admin can still unlock. Vanessa could not see Tricia's approval. | Verify cause: stale data, partial approval, or approver name not displayed. `approvedBy` already exists in the data. |
| 1.4 | Totals should subtract break time. | Daily totals look already deducted. Ask where the wrong total appears: summary, CSV, details, staff view or weekly total. |
| 1.5 | Details dialog default for Cheryl, 28 Oct, is wrong: payable period 7:30 pm → 2:30 pm (+1 day) = 18.50h; break field shows "030". | Likely AM/PM or default-period bug. |
| 1.6 | Desktop alignment of the Admin Reports filter row is off. | |
| 1.7 | Overlapping/additional entries (e.g. Cheryl, Zushi Bento 0.09h "Needs attention") block bulk approval. | Rule needed for how these are handled. |

## 2. Mobile vs Desktop

| # | Issue | Notes |
|---|-------|-------|
| 2.1 | Mobile changes must not affect the PC version (fixed column and scroll box now appear on laptops). | Breakpoint is currently below 1280px; use a mobile-only breakpoint. |
| 2.2 | The locked mobile table needs a different option. | Per-staff cards/accordion, or a day view with prev/next. |
| 2.3 | Filters button overlaps the date field on iPhone. | Bug from the latest change. |
| 2.4 | Long staff names wrap awkwardly in the fixed column. | |

## 3. Roster

| # | Issue | Notes |
|---|-------|-------|
| 3.1 | In Zushi Bento, clicking a shift flips the venue back to Sha. Venue should follow the staff member's location. | Suspects: `locationFilter` and `formData.location` defaults (unverified). |
| 3.2 | Edit shift: "OK" cannot be clicked; only Close and Delete work. | |
| 3.3 | Shifts could not be published (9 drafts); staff had to delete and re-add. | |
| 3.4 | Update "Duplicate confirmed shifts"; decide behaviour when the target week already has shifts. | Skip, replace or warn. |
| 3.5 | Grey cards = suggested from staff profile hours. Keep distinct from drafts and published shifts, and from duplicate/fill behaviour. | |
| 3.6 | Approved annual leave shows "Possible absence" on the dashboard. Apply leave logic to dashboard attendance and the roster. | Source: `app/api/admin/attendance/route.ts`. |

## 4. Dashboard, Navigation, Staff Lists

| # | Issue | Notes |
|---|-------|-------|
| 4.1 | Add Leave Requests to Quick links and menu, with a small badge count when requests are pending. | |
| 4.2 | Remove the "Upcoming shifts (7d)" card (shows 42). | Confirm this is what the green line meant. |
| 4.3 | Sort Staff Profiles A–Z with arrows, and by Location. | |
| 4.4 | Add a "Back to staff list" button on the profile page (top right). | |

## 5. Decisions Needed

1. Reasons: remove entirely or make optional?
2. Where exactly is the break-total error?
3. Bulk approval with unusual entries: approve using adjusted values, or still stop on overlaps?
4. Mobile payroll layout: cards per staff, day view, or other?
5. Desktop threshold: tablet width or laptop width?
6. Should approved leave also suppress Late / Possible absence and show "On leave"?

## 6. Future Feature: Mass Email to Staff

- Recipients: all staff, by venue or employment type, or individuals.
- Sending: compose form, preview and test send.
- Requires Resend to be set up first (app URL and sender domain not yet configured).
- Safeguards: admin-only, record of what was sent and by whom, individual sends (no exposed addresses).

## Suggested Order

1. Payroll approval, lock, "Approved by", and the 18.5h bug.
2. Roster venue flip, OK button and publishing.
3. Leave logic.
4. Desktop vs mobile separation.
5. Navigation, sorting and dashboard items.
6. Mass email.

## Screenshot References

1. Staff Profiles name/location sort
2. Profile page back button
3. Quick links
4. Roster Zushi with 9 drafts
5. Dashboard "Upcoming shifts" card
6. iPhone Filters overlap
7. Payroll grid with "No clock record"
8. Desktop filter row with the overlap error
9. Cheryl details dialog
10. Approved / Modify-Unlock buttons
