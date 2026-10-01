import StaffProfile from '@/components/StaffProfile';
import type { ComponentType } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IndividualStaffPage({ params }: PageProps) {
  const { id } = await params;
  const StaffProfileWithId = StaffProfile as ComponentType<{ id: string }>;

  return (
    <div className="mx-auto max-w-4xl">
      <StaffProfileWithId id={id} />
    </div>
  );
}