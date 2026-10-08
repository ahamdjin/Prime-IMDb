"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WatchLink({
  href,
  className,
  ariaLabel,
  children,
  onBeforeNavigate,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
  onBeforeNavigate?: () => void;
}) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  async function open(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    event.preventDefault();
    if (opening) return;
    setOpening(true);

    try {
      const response = await fetch("/api/access/session", {
        method: "POST",
        headers: { "X-Requested-With": "PrimeIMDbAccess" },
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Access session rejected");
      onBeforeNavigate?.();
      router.push(href);
    } finally {
      setOpening(false);
    }
  }

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={open}
      aria-busy={opening || undefined}
    >
      {children}
    </a>
  );
}
