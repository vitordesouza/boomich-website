import { describe, expect, it } from 'vitest';

import {
  BOTTOM_TIP_INDEX,
  ENVELOPE_RADIUS,
  HOOK_INDEX,
  LOAD_PER_UNIT,
  TOP_TIP_INDEX,
  createTruss,
  readout,
  setLoadTarget,
  step,
  strain,
  type Readout,
} from './physics';

const settledReadout = (): Readout => ({
  load: 0,
  deflection: 0,
  displacement: 0,
  status: 'WITHIN TOLERANCE',
});

function settle(state: ReturnType<typeof createTruss>, frames = 1_200): void {
  for (let frame = 0; frame < frames; frame += 1) step(state, 1 / 120);
}

describe('cantilever truss physics', () => {
  it('is stable at rest after settling', () => {
    const state = createTruss();
    state.idleTime = 0; // The idle source is intentionally tiny; isolate structural stability.
    settle(state);
    let maxVelocity = 0;
    for (let index = 0; index < state.positions.length; index += 1) {
      maxVelocity = Math.max(
        maxVelocity,
        Math.abs(state.positions[index] - state.previousPositions[index]),
      );
    }
    expect(maxVelocity).toBeLessThan(0.03);
  });

  it('recovers within tolerance after the hook is displaced and released', () => {
    const state = createTruss();
    const hook = HOOK_INDEX * 2;
    state.dragging = true;
    setLoadTarget(
      state,
      state.restPositions[hook] + 20,
      state.restPositions[hook + 1] + 56,
    );
    settle(state, 500);
    state.dragging = false;
    settle(state, 2_400);
    expect(
      Math.hypot(
        state.positions[hook] - state.restPositions[hook],
        state.positions[hook + 1] - state.restPositions[hook + 1],
      ),
    ).toBeLessThan(3.2);
  });

  it('holds the hook at its rated envelope', () => {
    const state = createTruss();
    const hook = HOOK_INDEX * 2;
    state.dragging = true;
    setLoadTarget(
      state,
      state.restPositions[hook] + 900,
      state.restPositions[hook + 1] + 900,
    );
    settle(state, 2_000);
    expect(
      Math.hypot(
        state.positions[hook] - state.restPositions[hook],
        state.positions[hook + 1] - state.restPositions[hook + 1],
      ),
    ).toBeLessThanOrEqual(ENVELOPE_RADIUS + 0.01);
  });

  it('reports signed tensile and compressive member strain', () => {
    const state = createTruss();
    state.positions[2] += 12;
    expect(strain(state, 0)).toBeGreaterThan(0);
    state.positions[2] = state.restPositions[2] - 12;
    expect(strain(state, 0)).toBeLessThan(0);
  });

  it('maps live values and status thresholds exactly', () => {
    const state = createTruss();
    const output = settledReadout();
    const hook = HOOK_INDEX * 2;
    state.positions[hook] = state.restPositions[hook] + 10;
    readout(state, output);
    expect(output.load).toBe(Math.round(10 * LOAD_PER_UNIT * 10) / 10);
    expect(output.status).toBe('WITHIN TOLERANCE');
    state.positions[hook] = state.restPositions[hook] + ENVELOPE_RADIUS * 0.7;
    readout(state, output);
    expect(output.status).toBe('APPROACHING LIMIT');
    state.positions[hook] = state.restPositions[hook] + ENVELOPE_RADIUS;
    state.positions[TOP_TIP_INDEX * 2 + 1] =
      state.restPositions[TOP_TIP_INDEX * 2 + 1] + 10;
    state.positions[BOTTOM_TIP_INDEX * 2 + 1] =
      state.restPositions[BOTTOM_TIP_INDEX * 2 + 1] + 10;
    readout(state, output);
    expect(output.status).toBe('AT RATED LIMIT');
    expect(output.deflection).toBe(3.5);
  });
});
