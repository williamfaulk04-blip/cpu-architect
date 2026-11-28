import { GPU_COMPONENTS } from './content/components';
import { GPU_STAGES, TOTAL_COMPONENT_COUNT } from './content/stages';
import {
  activeComponentId,
  activeStage,
  overallProgress,
  stageComponentIds,
  stageInstalledIds,
} from './session';
import type { GpuComponentId, SessionState } from './types';

export type GameplayChoiceView = {
  id: GpuComponentId;
  name: string;
  shortName: string;
  categoryLabel: string;
  color: string;
  disabled: boolean;
  rejected: boolean;
};

export type GameplayViewModel = {
  phase: SessionState['phase'];
  score: number;
  feedback: string;
  stageIndex: number;
  stageCount: number;
  stageId: string;
  stageName: string;
  stageEyebrow: string;
  activeComponentId: GpuComponentId | null;
  choices: GameplayChoiceView[];
  installedInStage: number;
  stageComponentCount: number;
  installedTotal: number;
  totalComponentCount: number;
  stageProgress: number;
  overallProgress: number;
  canStartStage: boolean;
  canContinue: boolean;
  isFinalStage: boolean;
  isComplete: boolean;
  hasFailed: boolean;
};

export type GameplayActions = {
  startStage: () => void;
  selectComponent: (componentId: GpuComponentId) => void;
  continueToNextStage: () => void;
  restart: () => void;
};

export function createGameplayViewModel(state: SessionState): GameplayViewModel {
  const stage = activeStage(state);
  const installed = stageInstalledIds(state);
  const enabledStageIds = stageComponentIds(state);
  const targetId = activeComponentId(state);

  const choiceIds = targetId
    ? GPU_COMPONENTS[targetId].choices.filter(
        (id) => GPU_COMPONENTS[id].enabled && enabledStageIds.includes(id),
      )
    : enabledStageIds;

  return {
    phase: state.phase,
    score: state.score,
    feedback: state.feedback,
    stageIndex: state.stageIndex,
    stageCount: GPU_STAGES.length,
    stageId: stage.id,
    stageName: stage.name,
    stageEyebrow: stage.eyebrow,
    activeComponentId: targetId,
    choices: choiceIds.map((id) => {
      const component = GPU_COMPONENTS[id];

      return {
        id,
        name: component.name,
        shortName: component.shortName,
        categoryLabel: component.category.replaceAll('_', ' '),
        color: component.color,
        disabled: state.installedIds.includes(id),
        rejected: state.wrongId === id,
      };
    }),
    installedInStage: installed.length,
    stageComponentCount: enabledStageIds.length,
    installedTotal: state.installedIds.filter(
      (id) => GPU_COMPONENTS[id]?.enabled,
    ).length,
    totalComponentCount: TOTAL_COMPONENT_COUNT,
    stageProgress: enabledStageIds.length
      ? installed.length / enabledStageIds.length
      : 0,
    overallProgress: overallProgress(state),
    canStartStage: state.phase === 'STAGE_INTRO',
    canContinue: state.phase === 'STAGE_COMPLETE',
    isFinalStage: state.stageIndex === GPU_STAGES.length - 1,
    isComplete: state.phase === 'MISSION_COMPLETE',
    hasFailed: state.phase === 'FAILED',
  };
}
