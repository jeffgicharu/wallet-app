import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsDesktop } from './useMediaQuery';

afterEach(() => {
  vi.restoreAllMocks();
});

function stubMatchMedia(initial: boolean) {
  const listeners = new Set<() => void>();
  const mql = {
    matches: initial,
    media: '',
    onchange: null,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    flip(next: boolean) {
      mql.matches = next;
      listeners.forEach(cb => cb());
    },
    listenerCount: () => listeners.size,
  };
}

describe('useMediaQuery', () => {
  it('returns the initial match state', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the query flips and cleans up its listener', () => {
    const ctl = stubMatchMedia(false);
    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);

    act(() => ctl.flip(true));
    expect(result.current).toBe(true);
    expect(ctl.listenerCount()).toBe(1);

    unmount();
    expect(ctl.listenerCount()).toBe(0);
  });

  it('useIsDesktop is a thin wrapper over the lg breakpoint', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});
