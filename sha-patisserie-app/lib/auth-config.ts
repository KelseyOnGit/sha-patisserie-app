// Temporarily opt in only after Resend and the production sender are ready.
export function emailVerificationRequired() {
  return process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED === 'true';
}
