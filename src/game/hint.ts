import { listValidMoves } from './moveRules';
import { rankMoves, solve } from './solverValidator';
import type { ContainerState, Move } from './types';

/**
 * Suggests a move. First asks the solver for a move that keeps the board solvable. If the
 * board can no longer be solved (or the search runs out of budget), falls back to the brief's
 * priorities, which `rankMoves` scores in order: complete a prism, stack same colour on same
 * colour, use an empty prism usefully. As a last resort, any legal move.
 * Returns undefined only when no legal move exists.
 */
export const findBestMove = (containers: readonly ContainerState[]): Move | undefined => {
  const solution = solve(containers, 15000);
  if (solution.solved && solution.moves.length) return solution.moves[0];
  return rankMoves(containers)[0] ?? listValidMoves(containers)[0];
};
