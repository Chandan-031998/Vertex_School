import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value = 0, duration = 700, formatter }) {
  const [display, setDisplay] = useState(Number(value) || 0);
  const frameRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const from = Number(display) || 0;
    const to = Number(value) || 0;

    if (from === to) return;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (to - from) * eased;
      setDisplay(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  if (typeof formatter === "function") return formatter(display);
  return Math.round(display).toLocaleString();
}
