import { clamp } from './clamp';

export const MAX_COLUMNS = 14;
export const MAX_ROWS = 10;
export const MAX_NODES = MAX_COLUMNS * MAX_ROWS;
export const MAX_MEMBERS = 384;
export const INTERACTION_RADIUS = 200;
export const ENERGY_THRESHOLD = 22;

const DAMPING = 0.985;
const VELOCITY_COUPLING = 1.5;
const POSITIONAL_PULL = 0.2;
const IDLE_WAVE_AMPLITUDE = 0.05;
const MAX_DISPLACEMENT = 120;
// Graded rest springs replace hard perimeter pins: the sheet is stiffest
// near its supports (edges) and loosest in the middle, so the whole
// surface responds to load, including at the borders.
const REST_SPRING_EDGE = 0.05;
const REST_SPRING_CENTER = 0.012;

export interface NetSpec {
  width: number;
  height: number;
  columns?: number;
  rows?: number;
}

/**
 * Caller-owned, fixed-capacity buffers keep the simulation allocation-free
 * after construction. The four corners are the net's fixed supports.
 */
export interface NetState {
  readonly positions: Float32Array;
  readonly previousPositions: Float32Array;
  readonly restPositions: Float32Array;
  readonly memberStart: Int16Array;
  readonly memberEnd: Int16Array;
  readonly restLengths: Float32Array;
  readonly pinned: Uint8Array;
  readonly restSpring: Float32Array;
  width: number;
  height: number;
  columns: number;
  rows: number;
  nodeCount: number;
  memberCount: number;
  fieldX: number;
  fieldY: number;
  fieldDX: number;
  fieldDY: number;
  fieldStrength: number;
  idleTime: number;
  idleEnabled: boolean;
}

function pointIndex(node: number): number {
  return node * 2;
}

function setMember(state: NetState, start: number, end: number): void {
  const member = state.memberCount;
  state.memberStart[member] = start;
  state.memberEnd[member] = end;
  const a = pointIndex(start);
  const b = pointIndex(end);
  state.restLengths[member] = Math.hypot(
    state.restPositions[b] - state.restPositions[a],
    state.restPositions[b + 1] - state.restPositions[a + 1],
  );
  state.memberCount += 1;
}

/** Builds the fully-braced structural field, anchored at its corners. */
export function createNet(spec: NetSpec): NetState {
  const width = Math.max(spec.width, 1);
  const height = Math.max(spec.height, 1);
  const inset = Math.min(32, width * 0.055);
  const top = Math.min(52, height * 0.09);
  const bottom = height - top;
  const columns = clamp(
    spec.columns ?? Math.round((width - inset * 2) / 110) + 1,
    5,
    MAX_COLUMNS,
  );
  const rows = clamp(
    spec.rows ?? Math.round((bottom - top) / 110) + 1,
    5,
    MAX_ROWS,
  );
  const state: NetState = {
    positions: new Float32Array(MAX_NODES * 2),
    previousPositions: new Float32Array(MAX_NODES * 2),
    restPositions: new Float32Array(MAX_NODES * 2),
    memberStart: new Int16Array(MAX_MEMBERS),
    memberEnd: new Int16Array(MAX_MEMBERS),
    restLengths: new Float32Array(MAX_MEMBERS),
    pinned: new Uint8Array(MAX_NODES),
    restSpring: new Float32Array(MAX_NODES),
    width,
    height,
    columns,
    rows,
    nodeCount: columns * rows,
    memberCount: 0,
    fieldX: -10_000,
    fieldY: -10_000,
    fieldDX: 0,
    fieldDY: 0,
    fieldStrength: 0,
    idleTime: 0,
    idleEnabled: true,
  };

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const node = row * columns + column;
      const point = pointIndex(node);
      state.restPositions[point] =
        inset + ((width - inset * 2) * column) / (columns - 1);
      state.restPositions[point + 1] =
        top + ((bottom - top) * row) / (rows - 1);
      // Only the four corners are hard anchors; every other node, edges
      // included, is free and held by a graded spring toward rest.
      state.pinned[node] = Number(
        (row === 0 || row === rows - 1) &&
          (column === 0 || column === columns - 1),
      );
      const edgeCloseness = Math.min(
        Math.min(row, rows - 1 - row) / Math.max(1, (rows - 1) / 2),
        Math.min(column, columns - 1 - column) / Math.max(1, (columns - 1) / 2),
      );
      state.restSpring[node] =
        REST_SPRING_EDGE +
        (REST_SPRING_CENTER - REST_SPRING_EDGE) * Math.min(1, edgeCloseness);
    }
  }
  state.positions.set(state.restPositions);
  state.previousPositions.set(state.restPositions);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const node = row * columns + column;
      if (column + 1 < columns) setMember(state, node, node + 1);
      if (row + 1 < rows) {
        setMember(state, node, node + columns);
        if (column + 1 < columns) {
          // Alternating braces make the square field read as a woven load path.
          if (column % 2 === 0) setMember(state, node, node + columns + 1);
          else setMember(state, node + 1, node + columns);
        }
      }
    }
  }
  return state;
}

/** Sets the local external load used by the next integration step. */
export function setField(
  state: NetState,
  x: number,
  y: number,
  dx: number,
  dy: number,
  strength: number,
): void {
  state.fieldX = x;
  state.fieldY = y;
  state.fieldDX = dx;
  state.fieldDY = dy;
  state.fieldStrength = clamp(strength, 0, 1);
}

/** Clears the local load while preserving the residual velocity to settle. */
export function clearField(state: NetState): void {
  state.fieldStrength = 0;
  state.fieldDX = 0;
  state.fieldDY = 0;
}

/** Advances one compliant (one-constraint-pass) verlet step and returns energy. */
export function stepNet(state: NetState, dt: number): number {
  const boundedDt = clamp(dt, 0, 1 / 20);
  state.idleTime += boundedDt;
  for (let node = 0; node < state.nodeCount; node += 1) {
    if (state.pinned[node]) continue;
    const point = pointIndex(node);
    const x = state.positions[point];
    const y = state.positions[point + 1];
    let velocityX = (x - state.previousPositions[point]) * DAMPING;
    let velocityY = (y - state.previousPositions[point + 1]) * DAMPING;
    state.previousPositions[point] = x;
    state.previousPositions[point + 1] = y;
    velocityX += (state.restPositions[point] - x) * state.restSpring[node];
    velocityY += (state.restPositions[point + 1] - y) * state.restSpring[node];
    if (state.fieldStrength > 0) {
      const dx = state.fieldX - x;
      const dy = state.fieldY - y;
      const distance = Math.hypot(dx, dy);
      if (distance < INTERACTION_RADIUS) {
        const falloff =
          (1 - distance / INTERACTION_RADIUS) ** 2 * state.fieldStrength;
        velocityX +=
          state.fieldDX * falloff * VELOCITY_COUPLING +
          dx * falloff * POSITIONAL_PULL;
        velocityY +=
          state.fieldDY * falloff * VELOCITY_COUPLING +
          dy * falloff * POSITIONAL_PULL;
      }
    } else if (state.idleEnabled) {
      velocityY +=
        Math.sin(
          (state.idleTime / 9) * Math.PI * 2 +
            state.restPositions[point] * 0.018,
        ) * IDLE_WAVE_AMPLITUDE;
    }
    state.positions[point] = x + velocityX;
    state.positions[point + 1] = y + velocityY;
  }

  for (let member = 0; member < state.memberCount; member += 1) {
    const start = state.memberStart[member];
    const end = state.memberEnd[member];
    const a = pointIndex(start);
    const b = pointIndex(end);
    const dx = state.positions[b] - state.positions[a];
    const dy = state.positions[b + 1] - state.positions[a + 1];
    const length = Math.hypot(dx, dy);
    if (length === 0) continue;
    const correction = ((length - state.restLengths[member]) / length) * 0.5;
    const offsetX = dx * correction;
    const offsetY = dy * correction;
    if (!state.pinned[start]) {
      state.positions[a] += state.pinned[end] ? offsetX * 2 : offsetX;
      state.positions[a + 1] += state.pinned[end] ? offsetY * 2 : offsetY;
    }
    if (!state.pinned[end]) {
      state.positions[b] -= state.pinned[start] ? offsetX * 2 : offsetX;
      state.positions[b + 1] -= state.pinned[start] ? offsetY * 2 : offsetY;
    }
  }

  for (let node = 0; node < state.nodeCount; node += 1) {
    const point = pointIndex(node);
    if (state.pinned[node]) {
      state.positions[point] = state.restPositions[point];
      state.positions[point + 1] = state.restPositions[point + 1];
      continue;
    }
    const dx = state.positions[point] - state.restPositions[point];
    const dy = state.positions[point + 1] - state.restPositions[point + 1];
    const displacement = Math.hypot(dx, dy);
    if (displacement > MAX_DISPLACEMENT) {
      const scale = MAX_DISPLACEMENT / displacement;
      state.positions[point] = state.restPositions[point] + dx * scale;
      state.positions[point + 1] = state.restPositions[point + 1] + dy * scale;
    }
  }
  return energy(state);
}

/** Returns aggregate member deformation, the visual system's load metric. */
export function energy(state: NetState): number {
  let total = 0;
  for (let member = 0; member < state.memberCount; member += 1) {
    const a = pointIndex(state.memberStart[member]);
    const b = pointIndex(state.memberEnd[member]);
    total += Math.abs(
      Math.hypot(
        state.positions[b] - state.positions[a],
        state.positions[b + 1] - state.positions[a + 1],
      ) - state.restLengths[member],
    );
  }
  return total;
}

/** Returns unsigned strain for the renderer's amber ramp. */
export function memberStrain(state: NetState, member: number): number {
  const a = pointIndex(state.memberStart[member]);
  const b = pointIndex(state.memberEnd[member]);
  return (
    Math.abs(
      Math.hypot(
        state.positions[b] - state.positions[a],
        state.positions[b + 1] - state.positions[a + 1],
      ) - state.restLengths[member],
    ) / state.restLengths[member]
  );
}
