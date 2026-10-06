import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const focusRealm = useCallback(() => {
    frameRef.current?.contentWindow?.focus();
  }, []);

  useEffect(() => {
    const onPointer = () => focusRealm();
    window.addEventListener("pointerdown", onPointer);
    const timer = window.setTimeout(focusRealm, 400);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.clearTimeout(timer);
    };
  }, [focusRealm]);

  return (
    <main className="realm-shell">
      <h1 className="sr-only">Wayfarer / v2.2 — Reedhaven, Starlit Highlands</h1>
      <p className="sr-only">
        Celestial Observatory and Moonlight Cavern. Click the world to walk. WASD
        moves. I opens your backpack.
      </p>
      <iframe
        ref={frameRef}
        className="realm-frame"
        title="Wayfarer realm"
        src="/preview/realm.html"
        allow="gamepad; fullscreen; autoplay"
        onLoad={focusRealm}
      />
    </main>
  );
}
