export type OutlawMarkKind = 'icon' | 'figure' | 'background' | 'mono';
export function outlawMarkSvg(
  kind?: OutlawMarkKind,
  options?: { size?: number; inset?: number },
): string;
