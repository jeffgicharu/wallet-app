import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TransactionIcon } from './TransactionIcon';
import type { Transaction } from '../types';

function tx(p: Partial<Transaction>): Transaction {
  return {
    reference: 'TRF-1',
    type: 'TRANSFER',
    status: 'COMPLETED',
    amount: 100,
    fee: 0,
    senderPhone: null,
    receiverPhone: null,
    description: '',
    createdAt: '2026-05-01T10:00:00Z',
    ...p,
  };
}

function iconClass(node: HTMLElement): string {
  const svg = node.querySelector('svg');
  return svg?.getAttribute('class') ?? '';
}

describe('TransactionIcon', () => {
  it('uses the up-right arrow for outgoing', () => {
    const { container } = render(<TransactionIcon t={tx({})} dir="out" />);
    expect(iconClass(container)).toContain('lucide-arrow-up-right');
  });

  it('uses the down-left arrow for incoming', () => {
    const { container } = render(<TransactionIcon t={tx({})} dir="in" />);
    expect(iconClass(container)).toContain('lucide-arrow-down-left');
  });

  it('uses the rotate icon for a reversal regardless of direction', () => {
    const rev = tx({ reference: 'REV-TRF-9' });
    const out = render(<TransactionIcon t={rev} dir="out" />);
    expect(iconClass(out.container)).toContain('lucide-rotate-ccw');
    const inc = render(<TransactionIcon t={rev} dir="in" />);
    expect(iconClass(inc.container)).toContain('lucide-rotate-ccw');
  });

  it('forwards size and className to the icon', () => {
    const { container } = render(
      <TransactionIcon t={tx({})} dir="in" size={16} className="text-green-500" />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('class')).toContain('text-green-500');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
