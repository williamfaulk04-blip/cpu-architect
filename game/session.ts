import { GAME_CONFIG } from './config';
import { componentById } from './content/components';
import { PROCESSING_STAGE } from './content/stages';
import type { GpuComponentId, SessionAction, SessionState } from './types';

export function activeComponentId(state: SessionState): GpuComponentId | null {
  return PROCESSING_STAGE.componentIds[state.installedIds.length] ?? null;
}

export function createInitialSession(): SessionState {
  return {
    phase: 'STAGE_INTRO',
    score: GAME_CONFIG.startingScore,
    installedIds: [],
    attemptsForSocket: 0,
    wrongId: null,
    feedback: PROCESSING_STAGE.introduction,
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'RESTART') return createInitialSession();
  if (action.type === 'START_STAGE') {
    return { ...state, phase: 'SOCKET_ACTIVE', feedback: 'Read the active socket, then choose the component that matches its job.' };
  }
  if (state.phase !== 'SOCKET_ACTIVE') return state;

  const targetId = activeComponentId(state);
  if (!targetId) return state;

  const chosen = componentById(action.componentId);
  if (action.componentId !== targetId) {
    const score = Math.max(GAME_CONFIG.failureThreshold, state.score - GAME_CONFIG.incorrectPlacement);
    return {
      ...state,
      phase: score === GAME_CONFIG.failureThreshold ? 'FAILED' : 'SOCKET_ACTIVE',
      score,
      attemptsForSocket: state.attemptsForSocket + 1,
      wrongId: action.componentId,
      feedback: `${chosen.name} does not perform this socket’s job. ${chosen.explanation} −${GAME_CONFIG.incorrectPlacement} points.`,
    };
  }

  const firstAttemptBonus = state.attemptsForSocket === 0 ? GAME_CONFIG.firstAttemptBonus : 0;
  const installedIds = [...state.installedIds, targetId];
  const stageComplete = installedIds.length === PROCESSING_STAGE.componentIds.length;
  const score = state.score
    + GAME_CONFIG.correctPlacement
    + firstAttemptBonus
    + (stageComplete ? GAME_CONFIG.stageCompletionBonus : 0);

  return {
    phase: stageComplete ? 'STAGE_COMPLETE' : 'SOCKET_ACTIVE',
    score,
    installedIds,
    attemptsForSocket: 0,
    wrongId: null,
    feedback: stageComplete
      ? PROCESSING_STAGE.completionMessage
      : `${chosen.name} installed. ${chosen.explanation}${firstAttemptBonus ? ` First-attempt bonus: +${firstAttemptBonus}.` : ''}`,
  };
}
