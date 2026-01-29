import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to dashboard if already authenticated
  if (user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
