import { memberStrain, type NetState } from './net';

const MEMBER_COLORS = [
  'oklch(0.95 0.01 100 / 0.3)',
  'oklch(0.937 0.023 97.6 / 0.355)',
  'oklch(0.924 0.036 95.2 / 0.41)',
  'oklch(0.911 0.049 92.8 / 0.465)',
  'oklch(0.898 0.062 90.4 / 0.52)',
  'oklch(0.885 0.075 88 / 0.575)',
  'oklch(0.872 0.088 85.6 / 0.63)',
  'oklch(0.859 0.101 83.2 / 0.685)',
  'oklch(0.846 0.114 80.8 / 0.74)',
  'oklch(0.833 0.127 78.4 / 0.795)',
  'oklch(0.82 0.14 76 / 0.85)',
] as const;

const NODE_COLOR = 'oklch(0.95 0.01 100 / 0.58)';

export interface NetRenderer {
  fit(): void;
  width(): number;
  height(): number;
  render(state: NetState): void;
}

export function createNetRenderer(canvas: HTMLCanvasElement): NetRenderer {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D rendering is required for The Net.');
  let cssWidth = 1;
  let cssHeight = 1;

  const fit = (): void => {
    const rect = canvas.getBoundingClientRect();
    cssWidth = Math.max(rect.width, 1);
    cssHeight = Math.max(rect.height, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  return {
    fit,
    width: () => cssWidth,
    height: () => cssHeight,
    render(state) {
      context.clearRect(0, 0, cssWidth, cssHeight);
      context.lineWidth = 1;
      for (let member = 0; member < state.memberCount; member += 1) {
        const a = state.memberStart[member] * 2;
        const b = state.memberEnd[member] * 2;
        const color = Math.min(
          Math.round((memberStrain(state, member) / 0.07) * 10),
          10,
        );
        context.strokeStyle = MEMBER_COLORS[color];
        context.beginPath();
        context.moveTo(state.positions[a], state.positions[a + 1]);
        context.lineTo(state.positions[b], state.positions[b + 1]);
        context.stroke();
      }
      context.fillStyle = NODE_COLOR;
      for (let node = 0; node < state.nodeCount; node += 1) {
        const point = node * 2;
        context.fillRect(
          state.positions[point] - 1,
          state.positions[point + 1] - 1,
          2,
          2,
        );
      }
    },
  };
}
