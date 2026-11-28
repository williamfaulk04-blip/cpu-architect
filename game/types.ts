export type ComponentCategory = 'CUDA_EXECUTION' | 'CUDA_MEMORY' | 'BOARD_HARDWARE' | 'COOLING';

export type GpuComponentId =
  | 'cuda-cores'
  | 'streaming-multiprocessor'
  | 'tensor-cores'
  | 'rt-cores'
  | 'texture-mapping-units'
  | 'render-output-units'
  | 'gpu-cache'
  | 'memory-controller'
  | 'gpu-chip'
  | 'pcb'
  | 'displayport'
  | 'display-outputs'
  | 'hdmi-port'
  | 'power-connector'
  | 'pcie-connector'
  | 'voltage-regulator-module'
  | 'vram'
  | 'thermal-paste'
  | 'copper-heat-pipes'
  | 'heatsink'
  | 'cooling-fans'
  | 'thermal-pads';

export type GpuComponent = {
  id: GpuComponentId;
  name: string;
  shortName: string;
  category: ComponentCategory;
  clue: string;
  explanation: string;
  color: string;
  stageId: string;
  stageOrder: number;
  socketId: string;
  socketOrder: number;
  incorrectHint: string;
  achievementText: string;
  choices: readonly GpuComponentId[];
  assetKey: string;
  socketAssetKey: string;
  position: {
    desktop: { x: number; y: number };
    mobile: { x: number; y: number };
  };
  availability: 'MVP' | 'STRETCH';
  enabled: boolean;
};

export type GpuStage = {
  id: string;
  name: string;
  eyebrow: string;
  order: number;
  introduction: string;
  completionMessage: string;
  achievementName: string;
  artworkKey: string;
  stageBonus: number;
  componentIds: readonly GpuComponentId[];
};

export type SessionPhase = 'STAGE_INTRO' | 'SOCKET_ACTIVE' | 'STAGE_COMPLETE' | 'MISSION_COMPLETE' | 'FAILED';

export type SessionState = {
  phase: SessionPhase;
  stageIndex: number;
  score: number;
  installedIds: GpuComponentId[];
  attemptsForSocket: number;
  wrongId: GpuComponentId | null;
  feedback: string;
};

export type SessionAction =
  | { type: 'START_STAGE' }
  | { type: 'SELECT_COMPONENT'; componentId: GpuComponentId }
  | { type: 'NEXT_STAGE' }
  | { type: 'RESTART' };
