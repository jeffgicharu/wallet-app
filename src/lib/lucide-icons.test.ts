import { describe, it, expect } from 'vitest';
import { ArrowDownLeft, ArrowUpRight, RotateCcw } from 'lucide-react';

// Guards the icon names used by TransactionIcon against the pinned
// lucide-react version: a renamed/removed export would break the build,
// so assert they resolve to renderable components here.
describe('lucide icon availability', () => {
  it('exposes the transaction icons', () => {
    for (const Icon of [ArrowDownLeft, ArrowUpRight, RotateCcw]) {
      expect(Icon).toBeTruthy();
      expect(['function', 'object']).toContain(typeof Icon);
    }
  });
});
