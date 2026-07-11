import { HOOK_INDEX, MEMBER_COUNT, type TrussState, strain } from './physics';

const FIT_WIDTH = 440;
const FIT_HEIGHT = 200;
const ZERO_STRAIN = 'oklch(0.95 0.01 100 / 0.7)';
const STRESS_COLORS = [
  ZERO_STRAIN,
  'oklch(0.935 0.023 98 / 0.59)',
  'oklch(0.92 0.036 96 / 0.64)',
  'oklch(0.905 0.049 94 / 0.68)',
  'oklch(0.89 0.062 92 / 0.73)',
  'oklch(0.875 0.075 90 / 0.78)',
  'oklch(0.86 0.088 87 / 0.82)',
  'oklch(0.85 0.101 84 / 0.87)',
  'oklch(0.84 0.114 81 / 0.91)',
  'oklch(0.83 0.127 78 / 0.96)',
  'oklch(0.82 0.14 76)',
] as const;

export interface InstrumentRenderer {
  fit(): void;
  render(state: TrussState, hoverStrength: number): void;
  getPoint(clientX: number, clientY: number): { x: number; y: number };
  getClientPoint(x: number, y: number): { x: number; y: number };
}

function pointIndex(node: number): number {
  return node * 2;
}

export function createRenderer(canvas: HTMLCanvasElement): InstrumentRenderer {
  const context = canvas.getContext('2d');
  if (!context)
    throw new Error('Canvas 2D rendering is required for the test article.');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let cssWidth = 1;
  let cssHeight = 1;

  const fit = (): void => {
    const rect = canvas.getBoundingClientRect();
    cssWidth = Math.max(rect.width, 1);
    cssHeight = Math.max(rect.height, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(cssWidth / FIT_WIDTH, cssHeight / FIT_HEIGHT);
    offsetX = (cssWidth - FIT_WIDTH * scale) * 0.5;
    offsetY = (cssHeight - FIT_HEIGHT * scale) * 0.5;
  };

  const drawAnchor = (x: number, y: number): void => {
    const plateWidth = 16;
    const plateHeight = 12;
    context.fillStyle = 'oklch(0.95 0.01 100 / 0.55)';
    context.beginPath();
    context.moveTo(x - plateWidth, y - plateHeight / 2);
    context.lineTo(x - 3, y - plateHeight / 2);
    context.lineTo(x, y - 3);
    context.lineTo(x, y + 3);
    context.lineTo(x - 3, y + plateHeight / 2);
    context.lineTo(x - plateWidth, y + plateHeight / 2);
    context.closePath();
    context.fill();
  };

  const render = (state: TrussState, hoverStrength: number): void => {
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.save();
    context.translate(offsetX, offsetY);
    context.scale(scale, scale);

    context.strokeStyle = 'oklch(0.95 0.01 100 / 0.16)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(29, 26);
    context.lineTo(29, 190);
    context.stroke();

    for (let member = 0; member < MEMBER_COUNT; member += 1) {
      const start = pointIndex(state.memberStart[member]);
      const end = pointIndex(state.memberEnd[member]);
      const amount = Math.min(Math.abs(strain(state, member)) / 0.12, 1);
      context.strokeStyle = STRESS_COLORS[Math.round(amount * 10)];
      context.lineWidth = 1.45 + (strain(state, member) < 0 ? 0.5 : 0);
      context.beginPath();
      context.moveTo(state.positions[start], state.positions[start + 1]);
      context.lineTo(state.positions[end], state.positions[end + 1]);
      context.stroke();
    }

    drawAnchor(state.positions[0], state.positions[1]);
    drawAnchor(state.positions[10], state.positions[11]);
    context.fillStyle = 'oklch(0.95 0.01 100 / 0.78)';
    for (let node = 0; node < HOOK_INDEX; node += 1) {
      const point = pointIndex(node);
      context.fillRect(
        state.positions[point] - 1.75,
        state.positions[point + 1] - 1.75,
        3.5,
        3.5,
      );
    }

    const hook = pointIndex(HOOK_INDEX);
    context.fillStyle = 'oklch(0.95 0.01 100)';
    context.fillRect(
      state.positions[hook] - 3.5,
      state.positions[hook + 1] - 3.5,
      7,
      7,
    );
    context.globalAlpha = 0.32 + hoverStrength * 0.6;
    context.strokeStyle = 'oklch(0.95 0.01 100 / 0.55)';
    context.lineWidth = 1;
    context.beginPath();
    context.arc(
      state.positions[hook],
      state.positions[hook + 1],
      10 + hoverStrength * 4,
      0,
      Math.PI * 2,
    );
    context.stroke();
    if (hoverStrength > 0.01) {
      context.globalAlpha = hoverStrength * 0.5;
      context.strokeStyle = 'oklch(0.95 0.01 100 / 0.55)';
      context.lineWidth = 1;
      context.beginPath();
      context.arc(
        state.positions[hook],
        state.positions[hook + 1],
        44,
        0,
        Math.PI * 2,
      );
      context.stroke();
    }
    context.restore();
  };

  return {
    fit,
    render,
    getPoint(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left - offsetX) / scale,
        y: (clientY - rect.top - offsetY) / scale,
      };
    },
    getClientPoint(x: number, y: number) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.left + offsetX + x * scale,
        y: rect.top + offsetY + y * scale,
      };
    },
  };
}
