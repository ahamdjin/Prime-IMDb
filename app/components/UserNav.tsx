"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function UserNav({ authEnabled }: { authEnabled: boolean }) {
  const { data: session } = useSession();

  if (!authEnabled || !session?.user) {
    return <Link href="/login" className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Sign in</Link>;
  }

  return (
    <button onClick={() => signOut({ callbackUrl: "/home" })} className="rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700">
      Sign out
    </button>
  );
}
