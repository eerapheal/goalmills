import { redirect } from 'next/navigation';

export default function CreateNewsRedirect() {
  redirect('/admin/news/new');
}
