import Link from 'next/link';
import ResendVerificationForm from '@/components/ResendVerificationForm';
import { emailVerificationRequired } from '@/lib/auth-config';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { status } = await searchParams;
  const success = status === 'success';
  const requiresVerification = emailVerificationRequired();
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-serif text-stone-800">{success ? 'Email verified' : requiresVerification ? 'Verify your email' : 'Account approval'}</h1>
        {!requiresVerification && !success ? (
          <p role="status" className="mt-4 text-sm text-stone-600">
            Email verification is temporarily disabled. Your account still needs admin approval.
            Contact your manager, then sign in with your email and PIN.
          </p>
        ) : success ? (
          <p role="status" className="mt-4 text-sm text-emerald-700">
            Your email has been verified. Your account is now awaiting admin approval.
            You can sign in once your manager approves it.
          </p>
        ) : (
          <>
            {status === 'invalid' && <p role="alert" className="mt-4 text-sm text-rose-700">
              This link is invalid, expired or already used. If you have already verified your email,
              sign in after admin approval. Otherwise request a new link below.
            </p>}
            {status === 'error' && <p role="alert" className="mt-4 text-sm text-rose-700">
              We could not verify your email right now. Try your link again, or request a new one.
            </p>}
            <ResendVerificationForm />
          </>
        )}
        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-stone-800 underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
