import { GPU_COMPONENTS } from './content/components';
import { GPU_STAGES, TOTAL_COMPONENT_COUNT } from './content/stages';
import { activeComponentId, activeStage, overallProgress, stageInstalledIds } from './session';
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
  return {
    phase: state.phase,
    score: state.score,
    feedback: state.feedback,
    stageIndex: state.stageIndex,
    stageCount: GPU_STAGES.length,
    stageId: stage.id,
    stageName: stage.name,
    stageEyebrow: stage.eyebrow,
    activeComponentId: activeComponentId(state),
    choices: stage.componentIds.map((id) => {
      const component = GPU_COMPONENTS[id];
      return {
        id,
        name: component.name,
        shortName: component.shortName,
        categoryLabel: component.category.replace('_', ' '),
        color: component.color,
        disabled: state.installedIds.includes(id),
        rejected: state.wrongId === id,
      };
    }),
    installedInStage: installed.length,
    stageComponentCount: stage.componentIds.length,
    installedTotal: state.installedIds.length,
    totalComponentCount: TOTAL_COMPONENT_COUNT,
    stageProgress: installed.length / stage.componentIds.length,
    overallProgress: overallProgress(state),
    canStartStage: state.phase === 'STAGE_INTRO',
    canContinue: state.phase === 'STAGE_COMPLETE',
    isFinalStage: state.stageIndex === GPU_STAGES.length - 1,
    isComplete: state.phase === 'MISSION_COMPLETE',
    hasFailed: state.phase === 'FAILED',
  };
}
