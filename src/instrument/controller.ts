import {
  HOOK_INDEX,
  createTruss,
  readout,
  setLoadTarget,
  step,
  type Readout,
} from './physics';
import { createRenderer } from './render';

const STATIC_SETTLE_STEPS = 160;
const FRAME_STEP = 1 / 120;
const READOUT_NUMBERS: string[] = [];

for (let tenths = 0; tenths <= 1_200; tenths += 1) {
  READOUT_NUMBERS[tenths] = (tenths / 10).toFixed(1);
}

function renderedNumber(value: number): string {
  return READOUT_NUMBERS[Math.min(Math.max(Math.round(value * 10), 0), 1_200)];
}

export function mountInstrument(container: HTMLElement): () => void {
  const canvas = container.querySelector<HTMLCanvasElement>(
    '[data-instrument-canvas]',
  );
  const hookButton = container.querySelector<HTMLButtonElement>(
    '[data-instrument-hook]',
  );
  const load = container.querySelector<HTMLElement>('[data-readout-load]');
  const deflection = container.querySelector<HTMLElement>(
    '[data-readout-deflection]',
  );
  const status = container.querySelector<HTMLElement>('[data-readout-status]');
  const live = container.querySelector<HTMLElement>('[data-readout-live]');
  if (!canvas || !hookButton || !load || !deflection || !status || !live)
    return () => undefined;

  const state = createTruss();
  const renderer = createRenderer(canvas);
  const values: Readout = {
    load: 0,
    deflection: 0,
    displacement: 0,
    status: 'WITHIN TOLERANCE',
  };
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  let frame = 0;
  let lastTime = 0;
  let inView = true;
  let pageVisible = !document.hidden;
  let hoverStrength = 0;
  let hookHovered = false;
  let lastLiveUpdate = 0;
  let lastInteraction = performance.now();
  let resizeTimer = 0;

  const updateReadout = (now: number): void => {
    readout(state, values);
    load.textContent = renderedNumber(values.load);
    deflection.textContent = renderedNumber(values.deflection);
    status.textContent = values.status;
    if (now - lastLiveUpdate >= 1200) {
      live.textContent = `LOAD ${renderedNumber(values.load)} kN · DEFLECTION ${renderedNumber(values.deflection)} mm · ${values.status}`;
      lastLiveUpdate = now;
    }
  };

  const renderStatic = (): void => {
    const restoringRest = !state.dragging;
    if (restoringRest) {
      const hook = HOOK_INDEX * 2;
      state.dragging = true;
      setLoadTarget(
        state,
        state.restPositions[hook],
        state.restPositions[hook + 1],
      );
    }
    for (let iteration = 0; iteration < STATIC_SETTLE_STEPS; iteration += 1)
      step(state, FRAME_STEP);
    if (restoringRest) state.dragging = false;
    renderer.render(state, hoverStrength);
    updateReadout(performance.now());
  };

  const runFrame = (now: number): void => {
    frame = 0;
    if (!inView || !pageVisible) return;
    const elapsed = Math.min((now - lastTime) / 1000 || FRAME_STEP, 1 / 20);
    lastTime = now;
    const active = state.dragging || now - lastInteraction < 4000;
    state.idling = !state.dragging && !active;
    if (active) {
      step(state, Math.min(elapsed * 0.5, FRAME_STEP));
      step(state, Math.min(elapsed * 0.5, FRAME_STEP));
    } else {
      step(state, FRAME_STEP);
    }
    hoverStrength +=
      ((state.dragging || hookHovered ? 1 : 0) - hoverStrength) *
      Math.min(elapsed / 0.16, 1);
    renderer.render(state, hoverStrength);
    updateReadout(now);
    frame = requestAnimationFrame(runFrame);
  };

  const beginLoop = (): void => {
    if (!reduceMotion && !frame && inView && pageVisible)
      frame = requestAnimationFrame(runFrame);
  };
  const stopLoop = (): void => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const hookPoint = (): { x: number; y: number } => {
    const point = HOOK_INDEX * 2;
    return { x: state.positions[point], y: state.positions[point + 1] };
  };
  const pointerTarget = (event: PointerEvent): void => {
    const point = renderer.getPoint(event.clientX, event.clientY);
    setLoadTarget(state, point.x, point.y);
    lastInteraction = performance.now();
  };
  const release = (): void => {
    state.dragging = false;
    lastInteraction = performance.now();
    if (reduceMotion) renderStatic();
  };

  const onPointerDown = (event: PointerEvent): void => {
    const point = renderer.getPoint(event.clientX, event.clientY);
    const hook = hookPoint();
    if (Math.hypot(point.x - hook.x, point.y - hook.y) > 44) return;
    state.dragging = true;
    canvas.setPointerCapture(event.pointerId);
    pointerTarget(event);
    event.preventDefault();
    if (reduceMotion) renderStatic();
  };
  const onPointerMove = (event: PointerEvent): void => {
    const point = renderer.getPoint(event.clientX, event.clientY);
    const hook = hookPoint();
    const hovering = Math.hypot(point.x - hook.x, point.y - hook.y) <= 44;
    if (!state.dragging) hookHovered = hovering;
    if (state.dragging) {
      pointerTarget(event);
      if (reduceMotion) renderStatic();
    }
  };
  const onPointerLeave = (): void => {
    if (!state.dragging) hookHovered = false;
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    let deltaX = 0;
    let deltaY = 0;
    if (event.key === 'ArrowLeft') deltaX = -8;
    if (event.key === 'ArrowRight') deltaX = 8;
    if (event.key === 'ArrowUp') deltaY = -8;
    if (event.key === 'ArrowDown') deltaY = 8;
    if (event.key === 'Escape') {
      release();
      return;
    }
    if (!deltaX && !deltaY) return;
    event.preventDefault();
    state.dragging = true;
    setLoadTarget(state, state.targetX + deltaX, state.targetY + deltaY);
    lastInteraction = performance.now();
    if (reduceMotion) renderStatic();
  };
  const onVisibilityChange = (): void => {
    pageVisible = !document.hidden;
    if (pageVisible) beginLoop();
    else stopLoop();
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (inView) beginLoop();
      else stopLoop();
    },
    { threshold: 0.05 },
  );
  const resizeObserver = new ResizeObserver(() => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      renderer.fit();
      if (reduceMotion) renderStatic();
    }, 80);
  });

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  hookButton.addEventListener('keydown', onKeyDown);
  hookButton.addEventListener('blur', release);
  observer.observe(container);
  resizeObserver.observe(container);
  document.addEventListener('visibilitychange', onVisibilityChange);
  renderer.fit();
  if (reduceMotion) renderStatic();
  else beginLoop();

  return () => {
    stopLoop();
    observer.disconnect();
    resizeObserver.disconnect();
    window.clearTimeout(resizeTimer);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('pointerup', release);
    canvas.removeEventListener('pointercancel', release);
    hookButton.removeEventListener('keydown', onKeyDown);
    hookButton.removeEventListener('blur', release);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
