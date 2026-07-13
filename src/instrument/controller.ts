import {
  ENERGY_THRESHOLD,
  clearField,
  createNet,
  setField,
  stepNet,
  type NetState,
} from './net';
import { createNetRenderer } from './render';

const FRAME_STEP = 1 / 120;
const CALM_DELAY = 2_500;
const ANNOUNCEMENT_INTERVAL = 3_000;
const LOAD_HOLD_DELAY = 180;

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('a, button'));
}

export function mountNet(hero: HTMLElement): () => void {
  const canvas = hero.querySelector<HTMLCanvasElement>('[data-net-canvas]');
  const copy = hero.querySelector<HTMLElement>('[data-net-copy]');
  const status = hero.querySelector<HTMLElement>('[data-net-status]');
  const statusLive = hero.querySelector<HTMLElement>('[data-net-status-live]');
  const loadControl = hero.querySelector<HTMLButtonElement>('[data-net-load]');
  if (!canvas || !copy || !status || !loadControl) return () => undefined;

  const renderer = createNetRenderer(canvas);
  const tieNodes = new Int16Array(3);
  const tieTargets = new Float32Array(6);
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const touchDevice =
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0;
  let state: NetState;
  let frame = 0;
  let lastTime = 0;
  let inView = true;
  let pageVisible = !document.hidden;
  let pointerId = -1;
  let pointerType = '';
  let pointerX = 0;
  let pointerY = 0;
  let downX = 0;
  let downY = 0;
  let mouseDragging = false;
  let touchStrength = 0;
  let holdTimer = 0;
  let resizeTimer = 0;
  let pulseTimer = 0;
  let copyX = 0;
  let copyY = 0;
  let copyRenderedX = Number.NaN;
  let copyRenderedY = Number.NaN;
  let holding = false;
  let calmSince = performance.now();
  let lastAnnouncement = -ANNOUNCEMENT_INTERVAL;
  let pendingStatusTimer = 0;
  let liveTimer = 0;

  const restingText = (): string =>
    touchDevice ? 'Press anywhere. It holds.' : 'Push anywhere. It holds.';

  const setStatus = (nextHolding: boolean): void => {
    if (holding === nextHolding) return;
    holding = nextHolding;
    const text = nextHolding ? 'Still holding.' : restingText();
    // Visible status swaps immediately (180ms crossfade)...
    status.style.opacity = '0';
    window.clearTimeout(pendingStatusTimer);
    pendingStatusTimer = window.setTimeout(() => {
      status.textContent = text;
      status.style.opacity = '1';
    }, 180);
    // ...while the screen-reader announcement is throttled separately.
    if (statusLive) {
      const now = performance.now();
      const delay = Math.max(0, lastAnnouncement + ANNOUNCEMENT_INTERVAL - now);
      window.clearTimeout(liveTimer);
      liveTimer = window.setTimeout(() => {
        statusLive.textContent = holding ? 'Still holding.' : restingText();
        lastAnnouncement = performance.now();
      }, delay);
    }
  };

  const measureTies = (): void => {
    const canvasRect = canvas.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    tieTargets[0] =
      copyRect.left - canvasRect.left - copyX + copyRect.width * 0.12;
    tieTargets[1] = copyRect.top - canvasRect.top - copyY;
    tieTargets[2] =
      copyRect.left - canvasRect.left - copyX + copyRect.width * 0.5;
    tieTargets[3] = tieTargets[1];
    tieTargets[4] =
      copyRect.right - canvasRect.left - copyX - copyRect.width * 0.12;
    tieTargets[5] = tieTargets[1];
    for (let tie = 0; tie < 3; tie += 1) {
      const targetX = tieTargets[tie * 2];
      const targetY = tieTargets[tie * 2 + 1] - 90;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (let node = 0; node < state.nodeCount; node += 1) {
        const point = node * 2;
        const dx = state.restPositions[point] - targetX;
        const dy = state.restPositions[point + 1] - targetY;
        const distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearest = node;
          nearestDistance = distance;
        }
      }
      tieNodes[tie] = nearest;
    }
  };

  const render = (): void => {
    renderer.render(state);
    if (reducedMotion) return;
    let meanX = 0;
    let meanY = 0;
    for (let tie = 0; tie < 3; tie += 1) {
      const point = tieNodes[tie] * 2;
      meanX += state.positions[point] - state.restPositions[point];
      meanY += state.positions[point + 1] - state.restPositions[point + 1];
    }
    copyX += (Math.max(-8, Math.min(8, (meanX / 3) * 0.45)) - copyX) * 0.12;
    copyY += (Math.max(-8, Math.min(8, (meanY / 3) * 0.45)) - copyY) * 0.12;
    const roundedX = Math.round(copyX * 10) / 10;
    const roundedY = Math.round(copyY * 10) / 10;
    if (roundedX !== copyRenderedX || roundedY !== copyRenderedY) {
      copy.style.transform = `translate3d(${roundedX}px, ${roundedY}px, 0)`;
      copyRenderedX = roundedX;
      copyRenderedY = roundedY;
    }
  };

  const settleStatic = (): void => {
    for (let iteration = 0; iteration < 80; iteration += 1)
      stepNet(state, FRAME_STEP);
    render();
  };

  const update = (dt: number): void => {
    const netEnergy = stepNet(state, dt);
    const now = performance.now();
    if (netEnergy > ENERGY_THRESHOLD) {
      calmSince = now;
      setStatus(true);
    } else if (holding && now - calmSince >= CALM_DELAY) {
      setStatus(false);
    }
    render();
  };

  const runFrame = (now: number): void => {
    frame = 0;
    if (!inView || !pageVisible) return;
    const dt = Math.min((now - lastTime) / 1000 || FRAME_STEP, 1 / 20);
    lastTime = now;
    update(dt);
    state.fieldDX *= 0.92;
    state.fieldDY *= 0.92;
    frame = requestAnimationFrame(runFrame);
  };

  const beginLoop = (): void => {
    if (!reducedMotion && !frame && inView && pageVisible)
      frame = requestAnimationFrame(runFrame);
  };
  const stopLoop = (): void => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const fit = (): void => {
    renderer.fit();
    state = createNet({ width: renderer.width(), height: renderer.height() });
    state.idleEnabled = !reducedMotion;
    copyX = 0;
    copyY = 0;
    copyRenderedX = Number.NaN;
    copyRenderedY = Number.NaN;
    copy.style.transform = '';
    measureTies();
    if (reducedMotion) settleStatic();
    else render();
  };
  const applyPoint = (event: PointerEvent, strength: number): void => {
    const rect = canvas.getBoundingClientRect();
    const nextX = event.clientX - rect.left;
    const nextY = event.clientY - rect.top;
    setField(state, nextX, nextY, nextX - pointerX, nextY - pointerY, strength);
    pointerX = nextX;
    pointerY = nextY;
  };
  const release = (event?: PointerEvent): void => {
    if (event && event.pointerId !== pointerId) return;
    window.clearTimeout(holdTimer);
    holdTimer = 0;
    pointerId = -1;
    pointerType = '';
    mouseDragging = false;
    touchStrength = 0;
    hero.classList.remove('is-dragging');
    clearField(state);
    if (reducedMotion) {
      update(FRAME_STEP);
      render();
    }
  };
  const onPointerDown = (event: PointerEvent): void => {
    if (isInteractive(event.target)) return;
    pointerId = event.pointerId;
    pointerType = event.pointerType;
    const rect = canvas.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    downX = pointerX;
    downY = pointerY;
    if (event.pointerType === 'touch') {
      touchStrength = 0.3;
      holdTimer = window.setTimeout(() => {
        if (pointerId === event.pointerId && touchStrength === 0.3)
          touchStrength = 1;
      }, LOAD_HOLD_DELAY);
    }
    setField(state, pointerX, pointerY, 0, 0, 0.3);
    if (reducedMotion) update(FRAME_STEP);
  };
  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && pointerId < 0) {
      applyPoint(event, 0.3);
      return;
    }
    if (event.pointerId !== pointerId) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const moveX = x - downX;
    const moveY = y - downY;
    let strength = 0.3;
    if (pointerType === 'mouse') {
      if (Math.hypot(moveX, moveY) > 3) {
        mouseDragging = true;
        hero.classList.add('is-dragging');
        if (!hero.hasPointerCapture(event.pointerId))
          hero.setPointerCapture(event.pointerId);
      }
      strength = mouseDragging ? 1 : 0.3;
      if (mouseDragging) event.preventDefault();
    } else if (pointerType === 'touch') {
      if (Math.abs(moveX) > 6 || Math.abs(moveY) > 6) {
        window.clearTimeout(holdTimer);
        touchStrength = Math.abs(moveX) > Math.abs(moveY) ? 1 : 0.3;
      }
      strength = touchStrength;
    }
    setField(state, x, y, x - pointerX, y - pointerY, strength);
    pointerX = x;
    pointerY = y;
    if (reducedMotion) update(FRAME_STEP);
  };
  const onPointerLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && pointerId < 0) clearField(state);
  };
  const pulse = (): void => {
    const x = renderer.width() * 0.5;
    const y = renderer.height() * 0.5;
    setField(state, x, y, 0, 74, 1);
    calmSince = performance.now();
    setStatus(true);
    window.clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(() => clearField(state), 180);
    if (reducedMotion) {
      update(FRAME_STEP);
      render();
    } else {
      beginLoop();
    }
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
    resizeTimer = window.setTimeout(fit, 80);
  });

  hero.addEventListener('pointerdown', onPointerDown);
  hero.addEventListener('pointermove', onPointerMove);
  hero.addEventListener('pointerup', release);
  hero.addEventListener('pointercancel', release);
  hero.addEventListener('pointerleave', onPointerLeave);
  loadControl.addEventListener('click', pulse);
  document.addEventListener('visibilitychange', onVisibilityChange);
  observer.observe(hero);
  resizeObserver.observe(hero);
  status.textContent = restingText();
  fit();
  beginLoop();

  return () => {
    stopLoop();
    observer.disconnect();
    resizeObserver.disconnect();
    window.clearTimeout(holdTimer);
    window.clearTimeout(resizeTimer);
    window.clearTimeout(pulseTimer);
    window.clearTimeout(pendingStatusTimer);
    window.clearTimeout(liveTimer);
    hero.removeEventListener('pointerdown', onPointerDown);
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerup', release);
    hero.removeEventListener('pointercancel', release);
    hero.removeEventListener('pointerleave', onPointerLeave);
    loadControl.removeEventListener('click', pulse);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
