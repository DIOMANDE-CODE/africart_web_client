import { useEffect, useRef, useCallback } from "react";

interface UseAutoScrollOptions {
  /** Milliseconds between each scroll step. Default: 4200 */
  interval?: number;
  /** Scroll distance in pixels per step. Default: 220 */
  step?: number;
  /** Reverses direction automatically when the end/start is reached. Default: true */
  bounce?: boolean;
}

/**
 * Generic carousel auto-scroll hook.
 *
 * @param containerRef  React ref pointing at the scrollable container element.
 * @param options       Scroll configuration (interval, step, bounce).
 *
 * @returns `{ pause, resume, scrollNext, scrollPrev }` — control handles
 *          that can be attached to mouse/focus/touch events.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { pause, resume } = useAutoScroll(containerRef, { interval: 4000 });
 *
 * <div ref={containerRef} onMouseEnter={pause} onMouseLeave={resume}>
 *   {items.map(...)}
 * </div>
 * ```
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseAutoScrollOptions = {},
) {
  const { interval = 4200, step = 220, bounce = true } = options;

  const pausedRef   = useRef(false);
  const directionRef = useRef<1 | -1>(1);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollStep = useCallback(() => {
    const el = containerRef.current;
    if (!el || pausedRef.current) return;

    const maxScroll = el.scrollWidth - el.clientWidth;

    if (bounce) {
      if (el.scrollLeft >= maxScroll - 1) directionRef.current = -1;
      if (el.scrollLeft <= 1)             directionRef.current =  1;
    } else {
      if (el.scrollLeft >= maxScroll - 1) el.scrollLeft = 0;
    }

    el.scrollBy({ left: step * directionRef.current, behavior: "smooth" });
  }, [containerRef, step, bounce]);

  useEffect(() => {
    timerRef.current = setInterval(scrollStep, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scrollStep, interval]);

  const pause   = useCallback(() => { pausedRef.current = true;  }, []);
  const resume  = useCallback(() => { pausedRef.current = false; }, []);

  const scrollNext = useCallback(() => {
    containerRef.current?.scrollBy({ left: step, behavior: "smooth" });
  }, [containerRef, step]);

  const scrollPrev = useCallback(() => {
    containerRef.current?.scrollBy({ left: -step, behavior: "smooth" });
  }, [containerRef, step]);

  return { pause, resume, scrollNext, scrollPrev };
}
