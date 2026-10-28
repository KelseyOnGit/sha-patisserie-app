import StaffProfile from '@/components/StaffProfile';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IndividualStaffPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl">
      <StaffProfile id={id} />
    </div>
  );
}