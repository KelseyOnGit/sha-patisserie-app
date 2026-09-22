import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Automatically send users landing on /admin to the admin roster view
  redirect('/admin/roster');
}