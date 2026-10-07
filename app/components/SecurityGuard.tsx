"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SecurityGuard() {
  const router = useRouter();

  useEffect(() => {
    const redirectHome = () => router.replace("/home");

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrlOrMeta = event.ctrlKey || event.metaKey;
      const devtoolsShortcut =
        event.key === "F12" ||
        (ctrlOrMeta && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (ctrlOrMeta && key === "u");

      if (devtoolsShortcut) {
        event.preventDefault();
        event.stopPropagation();
        redirectHome();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      redirectHome();
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("contextmenu", onContextMenu, true);
    };
  }, [router]);

  return null;
}
