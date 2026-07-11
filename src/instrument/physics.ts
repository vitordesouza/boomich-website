export const NODE_COUNT = 11;
export const MEMBER_COUNT = 18;
export const HOOK_INDEX = 10;
export const TOP_TIP_INDEX = 4;
export const BOTTOM_TIP_INDEX = 9;
export const ENVELOPE_RADIUS = 88;
export const LOAD_PER_UNIT = 0.136;
export const DEFLECTION_PER_UNIT = 0.35;

export type Status =
  'WITHIN TOLERANCE' | 'APPROACHING LIMIT' | 'AT RATED LIMIT';

export interface TrussState {
  readonly positions: Float32Array;
  readonly previousPositions: Float32Array;
  readonly restPositions: Float32Array;
  readonly memberStart: Int16Array;
  readonly memberEnd: Int16Array;
  readonly restLengths: Float32Array;
  targetX: number;
  targetY: number;
  dragging: boolean;
  idling: boolean;
  idleTime: number;
}

export interface Readout {
  load: number;
  deflection: number;
  status: Status;
  displacement: number;
}

export interface TrussSpec {
  originX?: number;
  originY?: number;
}

const DAMPING = 0.985;
const CONSTRAINT_ITERATIONS = 4;
const HOOK_RESPONSE = 18;

function indexOf(node: number): number {
  return node * 2;
}

function setMember(
  state: TrussState,
  member: number,
  start: number,
  end: number,
): void {
  state.memberStart[member] = start;
  state.memberEnd[member] = end;
  const startIndex = indexOf(start);
  const endIndex = indexOf(end);
  const dx = state.restPositions[endIndex] - state.restPositions[startIndex];
  const dy =
    state.restPositions[endIndex + 1] - state.restPositions[startIndex + 1];
  state.restLengths[member] = Math.hypot(dx, dy);
}

/** Creates the fixed-size cantilever test article in its unloaded configuration. */
export function createTruss(spec: TrussSpec = {}): TrussState {
  const originX = spec.originX ?? 42;
  const originY = spec.originY ?? 102;
  const positions = new Float32Array(NODE_COUNT * 2);
  const previousPositions = new Float32Array(NODE_COUNT * 2);
  const restPositions = new Float32Array(NODE_COUNT * 2);
  const state: TrussState = {
    positions,
    previousPositions,
    restPositions,
    memberStart: new Int16Array(MEMBER_COUNT),
    memberEnd: new Int16Array(MEMBER_COUNT),
    restLengths: new Float32Array(MEMBER_COUNT),
    targetX: 0,
    targetY: 0,
    dragging: false,
    idling: false,
    idleTime: 0,
  };

  // Five stations, 74 units apart. The chord separation narrows from 64 to 34.
  for (let station = 0; station < 5; station += 1) {
    const progress = station / 4;
    const x = originX + station * 74;
    const separation = 64 - progress * 30;
    const top = indexOf(station);
    const bottom = indexOf(station + 5);
    restPositions[top] = x;
    restPositions[top + 1] = originY - separation / 2;
    restPositions[bottom] = x;
    restPositions[bottom + 1] = originY + separation / 2;
  }

  const hook = indexOf(HOOK_INDEX);
  restPositions[hook] = originX + 4 * 74 + 48;
  restPositions[hook + 1] = originY;
  positions.set(restPositions);
  previousPositions.set(restPositions);
  state.targetX = restPositions[hook];
  state.targetY = restPositions[hook + 1];

  let member = 0;
  for (let station = 0; station < 4; station += 1) {
    setMember(state, member++, station, station + 1);
    setMember(state, member++, station + 5, station + 6);
  }
  for (let station = 1; station < 5; station += 1) {
    setMember(state, member++, station, station + 5);
  }
  for (let bay = 0; bay < 4; bay += 1) {
    // Alternating Pratt web: each bay carries toward the anchored wall.
    setMember(
      state,
      member++,
      bay % 2 === 0 ? bay : bay + 5,
      bay % 2 === 0 ? bay + 6 : bay + 1,
    );
  }
  setMember(state, member++, TOP_TIP_INDEX, HOOK_INDEX);
  setMember(state, member, BOTTOM_TIP_INDEX, HOOK_INDEX);
  return state;
}

function clampHookToEnvelope(state: TrussState): void {
  const hook = indexOf(HOOK_INDEX);
  const restX = state.restPositions[hook];
  const restY = state.restPositions[hook + 1];
  const dx = state.positions[hook] - restX;
  const dy = state.positions[hook + 1] - restY;
  const distance = Math.hypot(dx, dy);
  if (distance > ENVELOPE_RADIUS) {
    const scale = ENVELOPE_RADIUS / distance;
    state.positions[hook] = restX + dx * scale;
    state.positions[hook + 1] = restY + dy * scale;
  }
}

function relaxConstraints(state: TrussState): void {
  for (let member = 0; member < MEMBER_COUNT; member += 1) {
    const start = state.memberStart[member];
    const end = state.memberEnd[member];
    const startIndex = indexOf(start);
    const endIndex = indexOf(end);
    const dx = state.positions[endIndex] - state.positions[startIndex];
    const dy = state.positions[endIndex + 1] - state.positions[startIndex + 1];
    const length = Math.hypot(dx, dy);
    if (length === 0) continue;
    const correction = ((length - state.restLengths[member]) / length) * 0.5;
    const offsetX = dx * correction;
    const offsetY = dy * correction;
    const startFixed = start === 0 || start === 5;
    const endFixed = end === 0 || end === 5;
    if (!startFixed) {
      state.positions[startIndex] += endFixed ? offsetX * 2 : offsetX;
      state.positions[startIndex + 1] += endFixed ? offsetY * 2 : offsetY;
    }
    if (!endFixed) {
      state.positions[endIndex] -= startFixed ? offsetX * 2 : offsetX;
      state.positions[endIndex + 1] -= startFixed ? offsetY * 2 : offsetY;
    }
  }
}

/** Advances the truss with no allocations. `dt` is expressed in seconds. */
export function step(state: TrussState, dt: number): void {
  const boundedDt = Math.min(Math.max(dt, 0), 1 / 30);
  const hook = indexOf(HOOK_INDEX);
  const restX = state.restPositions[hook];
  const restY = state.restPositions[hook + 1];
  if (!state.dragging && state.idling) {
    state.idleTime += boundedDt;
    state.targetX = restX;
    state.targetY = restY + Math.sin((state.idleTime / 7) * Math.PI * 2) * 4.5;
  } else if (!state.dragging) {
    state.targetX = restX;
    state.targetY = restY;
  }

  for (let node = 1; node < NODE_COUNT; node += 1) {
    if (node === 5) continue;
    const point = indexOf(node);
    const x = state.positions[point];
    const y = state.positions[point + 1];
    const velocityX = (x - state.previousPositions[point]) * DAMPING;
    const velocityY = (y - state.previousPositions[point + 1]) * DAMPING;
    state.previousPositions[point] = x;
    state.previousPositions[point + 1] = y;
    if (node === HOOK_INDEX) {
      const forceX = (state.targetX - x) * HOOK_RESPONSE * boundedDt;
      const forceY = (state.targetY - y) * HOOK_RESPONSE * boundedDt;
      state.positions[point] = x + velocityX + forceX;
      state.positions[point + 1] = y + velocityY + forceY;
    } else {
      state.positions[point] = x + velocityX;
      state.positions[point + 1] = y + velocityY;
    }
  }

  for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration += 1) {
    relaxConstraints(state);
    clampHookToEnvelope(state);
  }
  state.positions[0] = state.restPositions[0];
  state.positions[1] = state.restPositions[1];
  state.positions[10] = state.restPositions[10];
  state.positions[11] = state.restPositions[11];
}

/** Returns signed axial strain without allocating. Positive is tension. */
export function strain(state: TrussState, member: number): number {
  const startIndex = indexOf(state.memberStart[member]);
  const endIndex = indexOf(state.memberEnd[member]);
  const dx = state.positions[endIndex] - state.positions[startIndex];
  const dy = state.positions[endIndex + 1] - state.positions[startIndex + 1];
  return (
    (Math.hypot(dx, dy) - state.restLengths[member]) / state.restLengths[member]
  );
}

/** Writes the live engineering readout into a caller-owned object. */
export function readout(state: TrussState, output: Readout): void {
  const hook = indexOf(HOOK_INDEX);
  const dx = state.positions[hook] - state.restPositions[hook];
  const dy = state.positions[hook + 1] - state.restPositions[hook + 1];
  const displacement = Math.min(Math.hypot(dx, dy), ENVELOPE_RADIUS);
  const top = indexOf(TOP_TIP_INDEX);
  const bottom = indexOf(BOTTOM_TIP_INDEX);
  const tipX = (state.positions[top] + state.positions[bottom]) * 0.5;
  const tipY = (state.positions[top + 1] + state.positions[bottom + 1]) * 0.5;
  const restTipX =
    (state.restPositions[top] + state.restPositions[bottom]) * 0.5;
  const restTipY =
    (state.restPositions[top + 1] + state.restPositions[bottom + 1]) * 0.5;
  output.displacement = displacement;
  output.load = Math.round(displacement * LOAD_PER_UNIT * 10) / 10;
  output.deflection =
    Math.round(
      Math.hypot(tipX - restTipX, tipY - restTipY) * DEFLECTION_PER_UNIT * 10,
    ) / 10;
  output.status =
    displacement >= ENVELOPE_RADIUS - 0.01
      ? 'AT RATED LIMIT'
      : displacement >= ENVELOPE_RADIUS * 0.7
        ? 'APPROACHING LIMIT'
        : 'WITHIN TOLERANCE';
}

export function setLoadTarget(state: TrussState, x: number, y: number): void {
  const hook = indexOf(HOOK_INDEX);
  const dx = x - state.restPositions[hook];
  const dy = y - state.restPositions[hook + 1];
  const distance = Math.hypot(dx, dy);
  const scale = distance > ENVELOPE_RADIUS ? ENVELOPE_RADIUS / distance : 1;
  state.targetX = state.restPositions[hook] + dx * scale;
  state.targetY = state.restPositions[hook + 1] + dy * scale;
}
