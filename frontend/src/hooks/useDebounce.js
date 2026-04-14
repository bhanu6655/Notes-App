import { useEffect, useRef, useState } from 'react';

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of silence. Used for auto-save triggers.
 */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);

  return debounced;
}
