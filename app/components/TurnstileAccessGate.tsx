"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: {
    sitekey: string;
    action: string;
    theme: "dark";
    appearance: "interaction-only";
    callback: (token: string) => void;
    "error-callback": () => void;
    "expired-callback": () => void;
  }) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

type TurnstileWindow = Window & { turnstile?: TurnstileApi };

export default function TurnstileAccessGate({
  siteKey,
  destination,
}: {
  siteKey: string;
  destination: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const isMounted = useRef(true);
  const [message, setMessage] = useState("Checking your browser…");
  const [busy, setBusy] = useState(false);

  const verifyToken = useCallback(async (token: string) => {
    setBusy(true);
    setMessage("Finishing verification…");
    try {
      const response = await fetch("/api/access/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Unable to verify this visit.");
      if (!isMounted.current) return;
      // A full navigation prevents cached RSC responses from using an old cookie state.
      window.location.assign(destination);
    } catch {
      if (!isMounted.current) return;
      setBusy(false);
      setMessage("Verification did not complete. Please try again.");
      const api = (window as TurnstileWindow).turnstile;
      if (api && widget.current) api.reset(widget.current);
    }
  }, [destination]);

  const mountWidget = useCallback(() => {
    const api = (window as TurnstileWindow).turnstile;
    if (!container.current || !api || widget.current || !siteKey) return;
    widget.current = api.render(container.current, {
      sitekey: siteKey,
      action: "watch_access",
      theme: "dark",
      appearance: "interaction-only",
      callback: (token) => { void verifyToken(token); },
      "error-callback": () => setMessage("Browser verification failed. Please refresh and retry."),
      "expired-callback": () => {
        if (widget.current) api.reset(widget.current);
      },
    });
  }, [siteKey, verifyToken]);

  useEffect(() => {
    isMounted.current = true;
    mountWidget();
    return () => {
      isMounted.current = false;
      const api = (window as TurnstileWindow).turnstile;
      if (widget.current && api) api.remove(widget.current);
      widget.current = null;
    };
  }, [mountWidget]);

  if (!siteKey) {
    return <p role="alert">Player verification has not been configured yet.</p>;
  }

  return (
    <div className="stream-verify-panel" aria-busy={busy}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={mountWidget}
      />
      <p aria-live="polite">{message}</p>
      <div ref={container} />
      <button type="button" className="stream-filter-reset" onClick={() => window.location.reload()}>
        Retry verification
      </button>
    </div>
  );
}
