import { useEffect, useRef, useState } from 'react';

const easeOut = (t: number) => 1 - (1 - t) ** 4;

/**
 * Rolls a displayed number toward `target` over `ms`, like a tally being counted out, instead
 * of jumping. Spending rolls down the same way. Off when `animate` is false.
 */
export const useRollingNumber = (target: number, animate: boolean, ms = 600) => {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (!animate || start === target) {
      const id = requestAnimationFrame(() => {
        from.current = target;
        setShown(target);
      });
      return () => cancelAnimationFrame(id);
    }
    const t0 = Date.now();
    let id = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - t0) / ms);
      const value = Math.round(start + (target - start) * easeOut(t));
      from.current = value;
      setShown(value);
      if (t < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, animate, ms]);

  return shown;
};
