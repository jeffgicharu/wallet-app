// @ts-nocheck
import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query and re-render when it flips. Used where
 * the desktop and mobile layouts are structurally different enough that
 * rendering both and toggling with `hidden`/`lg:hidden` would duplicate
 * content in the DOM (bad for assistive tech and for tests). The CSS
 * `lg:` utilities still drive everything that only differs cosmetically.
 *
 * jsdom stubs matchMedia to always report `matches: false`, so component
 * tests exercise the mobile branch — the existing characterizations stay
 * valid without change.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** The app's desktop breakpoint — matches Tailwind's `lg` (1024px). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
