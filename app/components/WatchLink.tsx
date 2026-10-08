"use client";

import Link from "next/link";
import type { ReactNode } from "react";

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
  // The protected watch route issues a redirect to /verify when a visitor has
  // no verified access cookie. Never mint visitor sessions on link clicks.
  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      aria-label={ariaLabel}
      onClick={onBeforeNavigate}
    >
      {children}
    </Link>
  );
}
