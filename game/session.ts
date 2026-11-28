import { GAME_CONFIG } from './config';
import { GPU_COMPONENTS, componentById } from './content/components';
import { GPU_STAGES, TOTAL_COMPONENT_COUNT } from './content/stages';
import type { GpuComponentId, SessionAction, SessionState } from './types';

export function activeStage(state: SessionState) {
  return GPU_STAGES[state.stageIndex];
}

export function stageComponentIds(state: SessionState): GpuComponentId[] {
  return activeStage(state).componentIds.filter(
    (id) => GPU_COMPONENTS[id].enabled,
  );
}

export function stageInstalledIds(state: SessionState) {
  const ids = new Set(stageComponentIds(state));
  return state.installedIds.filter((id) => ids.has(id));
}

export function activeComponentId(state: SessionState): GpuComponentId | null {
  const componentIds = stageComponentIds(state);
  return componentIds[stageInstalledIds(state).length] ?? null;
}

export function overallProgress(state: SessionState) {
  const installedCount = state.installedIds.filter(
    (id) => GPU_COMPONENTS[id]?.enabled,
  ).length;

  return installedCount / TOTAL_COMPONENT_COUNT;
}

export function createInitialSession(): SessionState {
  return {
    phase: 'STAGE_INTRO',
    stageIndex: 0,
    score: GAME_CONFIG.startingScore,
    installedIds: [],
    attemptsForSocket: 0,
    wrongId: null,
    feedback: GPU_STAGES[0].introduction,
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  if (action.type === 'RESTART') return createInitialSession();

  if (action.type === 'START_STAGE' && state.phase === 'STAGE_INTRO') {
    return {
      ...state,
      phase: 'SOCKET_ACTIVE',
      feedback: 'Read the active socket, then choose the component that matches its job.',
    };
  }

  if (action.type === 'NEXT_STAGE' && state.phase === 'STAGE_COMPLETE') {
    const nextIndex = state.stageIndex + 1;

    if (nextIndex >= GPU_STAGES.length) {
      return {
        ...state,
        phase: 'MISSION_COMPLETE',
        feedback: 'Every GPU layer is assembled. The processing, board, and cooling systems now work together as one graphics card.',
      };
    }

    return {
      ...state,
      phase: 'STAGE_INTRO',
      stageIndex: nextIndex,
      attemptsForSocket: 0,
      wrongId: null,
      feedback: GPU_STAGES[nextIndex].introduction,
    };
  }

  if (action.type !== 'SELECT_COMPONENT' || state.phase !== 'SOCKET_ACTIVE') {
    return state;
  }

  const targetId = activeComponentId(state);
  if (!targetId) return state;

  const chosen = componentById(action.componentId);

  if (!chosen.enabled) {
    return {
      ...state,
      wrongId: action.componentId,
      feedback: `${chosen.name} is stretch content and is not enabled in this version.`,
    };
  }

  if (action.componentId !== targetId) {
    const score = Math.max(
      GAME_CONFIG.failureThreshold,
      state.score - GAME_CONFIG.incorrectPlacement,
    );

    return {
      ...state,
      phase: score === GAME_CONFIG.failureThreshold ? 'FAILED' : 'SOCKET_ACTIVE',
      score,
      attemptsForSocket: state.attemptsForSocket + 1,
      wrongId: action.componentId,
      feedback: `${chosen.name} does not perform this socket’s job. ${chosen.incorrectHint} −${GAME_CONFIG.incorrectPlacement} points.`,
    };
  }

  const firstAttemptBonus =
    state.attemptsForSocket === 0 ? GAME_CONFIG.firstAttemptBonus : 0;

  const installedIds = [...state.installedIds, targetId];
  const stage = activeStage(state);
  const enabledStageIds = stageComponentIds(state);

  const completedInStage = installedIds.filter(
    (id) => enabledStageIds.includes(id),
  ).length;

  const stageComplete = completedInStage === enabledStageIds.length;

  const score =
    state.score +
    GAME_CONFIG.correctPlacement +
    firstAttemptBonus +
    (stageComplete ? stage.stageBonus : 0);

  return {
    ...state,
    phase: stageComplete ? 'STAGE_COMPLETE' : 'SOCKET_ACTIVE',
    score,
    installedIds,
    attemptsForSocket: 0,
    wrongId: null,
    feedback: stageComplete
      ? stage.completionMessage
      : `${chosen.name} installed. ${chosen.achievementText} ${chosen.explanation}${firstAttemptBonus ? ` First-attempt bonus: +${firstAttemptBonus}.` : ''}`,
  };
}
