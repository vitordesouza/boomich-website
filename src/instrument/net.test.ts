import { describe, expect, it } from 'vitest';

import { clearField, createNet, energy, setField, stepNet } from './net';

const STEP = 1 / 120;

function settle(state: ReturnType<typeof createNet>, frames = 1_500): void {
  for (let frame = 0; frame < frames; frame += 1) stepNet(state, STEP);
}

describe('The Net physics', () => {
  it('is stable at rest and keeps its perimeter pinned', () => {
    const state = createNet({ width: 960, height: 680, columns: 10, rows: 7 });
    state.idleEnabled = false;
    settle(state);
    expect(energy(state)).toBeLessThan(0.08);
    for (let node = 0; node < state.nodeCount; node += 1) {
      if (!state.pinned[node]) continue;
      const point = node * 2;
      expect(state.positions[point]).toBe(state.restPositions[point]);
      expect(state.positions[point + 1]).toBe(state.restPositions[point + 1]);
    }
  });

  it('locally deforms around an applied load field', () => {
    const state = createNet({ width: 960, height: 680, columns: 10, rows: 7 });
    state.idleEnabled = false;
    setField(state, 480, 340, 0, 72, 1);
    settle(state, 120);
    const center =
      (Math.floor(state.rows / 2) * state.columns +
        Math.floor(state.columns / 2)) *
      2;
    const corner = (state.columns + 1) * 2;
    const centerDisplacement = Math.hypot(
      state.positions[center] - state.restPositions[center],
      state.positions[center + 1] - state.restPositions[center + 1],
    );
    const cornerDisplacement = Math.hypot(
      state.positions[corner] - state.restPositions[corner],
      state.positions[corner + 1] - state.restPositions[corner + 1],
    );
    expect(centerDisplacement).toBeGreaterThan(8);
    expect(centerDisplacement).toBeGreaterThan(cornerDisplacement * 2);
  });

  it('springs back within tolerance after release', () => {
    const state = createNet({ width: 960, height: 680, columns: 10, rows: 7 });
    state.idleEnabled = false;
    setField(state, 480, 340, 30, 86, 1);
    settle(state, 180);
    clearField(state);
    settle(state, 3_000);
    expect(energy(state)).toBeLessThan(0.7);
  });

  it('reports more energy for a larger imposed displacement', () => {
    const state = createNet({ width: 960, height: 680, columns: 10, rows: 7 });
    const center =
      (Math.floor(state.rows / 2) * state.columns +
        Math.floor(state.columns / 2)) *
      2;
    state.positions[center + 1] += 12;
    const small = energy(state);
    state.positions[center + 1] += 24;
    expect(energy(state)).toBeGreaterThan(small);
  });
});
