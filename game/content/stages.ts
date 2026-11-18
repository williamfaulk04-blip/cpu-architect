import { GPU_COMPONENTS } from './components';
import type { GpuStage } from '../types';

export const PROCESSING_STAGE: GpuStage = {
  id: 'processing-layer',
  name: 'Processing Layer',
  eyebrow: 'GPU LAYER 01',
  introduction: 'Build the processing layer by matching each socket function to the GPU component that performs it.',
  completionMessage: 'The GPU processing layer can now schedule parallel work, execute arithmetic, and reuse nearby data.',
  componentIds: ['streaming-multiprocessor', 'cuda-cores', 'gpu-cache'],
};

export const GPU_STAGES = [PROCESSING_STAGE] as const;

function validateStages(stages: readonly GpuStage[]) {
  const stageIds = new Set<string>();
  const componentIds = new Set<string>();

  for (const stage of stages) {
    if (stageIds.has(stage.id)) throw new Error(`Duplicate GPU stage id: ${stage.id}`);
    stageIds.add(stage.id);
    if (stage.componentIds.length === 0) throw new Error(`GPU stage ${stage.id} has no components`);

    for (const componentId of stage.componentIds) {
      if (!GPU_COMPONENTS[componentId]) throw new Error(`Unknown GPU component id: ${componentId}`);
      if (componentIds.has(componentId)) throw new Error(`GPU component appears in multiple sockets: ${componentId}`);
      componentIds.add(componentId);
    }
  }
}

validateStages(GPU_STAGES);
