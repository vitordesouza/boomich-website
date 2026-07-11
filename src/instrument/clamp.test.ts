import { describe, expect, it } from 'vitest';

import { clamp } from './clamp';

describe('clamp', () => {
  it('keeps a value within an inclusive operating envelope', () => {
    expect(clamp(-2, 0, 10)).toBe(0);
    expect(clamp(4, 0, 10)).toBe(4);
    expect(clamp(12, 0, 10)).toBe(10);
  });
});
