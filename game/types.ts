export type ComponentCategory = 'CUDA_EXECUTION' | 'CUDA_MEMORY' | 'BOARD_HARDWARE' | 'COOLING';

export type GpuComponentId = 'streaming-multiprocessor' | 'cuda-cores' | 'gpu-cache';

export type GpuComponent = {
  id: GpuComponentId;
  name: string;
  shortName: string;
  category: ComponentCategory;
  clue: string;
  explanation: string;
  color: string;
};

export type GpuStage = {
  id: string;
  name: string;
  eyebrow: string;
  introduction: string;
  completionMessage: string;
  componentIds: readonly GpuComponentId[];
};

export type SessionPhase = 'STAGE_INTRO' | 'SOCKET_ACTIVE' | 'STAGE_COMPLETE' | 'FAILED';

export type SessionState = {
  phase: SessionPhase;
  score: number;
  installedIds: GpuComponentId[];
  attemptsForSocket: number;
  wrongId: GpuComponentId | null;
  feedback: string;
};

export type SessionAction =
  | { type: 'START_STAGE' }
  | { type: 'SELECT_COMPONENT'; componentId: GpuComponentId }
  | { type: 'RESTART' };
