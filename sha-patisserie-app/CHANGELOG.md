# Progress Log

## [Completed] Authentication Milestone
- Added Prisma `User` schema with `email`, `pinCode`, and `name`.
- Created JWT generation and HTTP-only cookie handlers in `lib/session.ts`.
- Integrated registration (`/register`) and login (`/login`) views with matching UI themes.
- Enabled middleware protection for `/dashboard`.

- Created `app/register/page.tsx` with email format and PIN strength validation.
- Updated `POST /api/auth/register` to save users with `isApproved: false`.
- Updated `POST /api/auth/login` to block unapproved staff with a `403` response.
- Verified successful database insertion into Neon PostgreSQL.

## [Next Up] Dashboard & Staff Clock-In
- Build staff clock-in/clock-out UI on `/dashboard`.
- Create API endpoints for shift tracking.
- Create admin API route



