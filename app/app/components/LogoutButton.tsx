'use client';

import { signOut } from '@/app/actions/auth';
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await signOut();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Sign Out
        </>
      )}
    </button>
  );
}
