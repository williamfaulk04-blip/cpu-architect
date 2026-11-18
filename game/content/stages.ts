import { GPU_COMPONENTS } from './components';
import type { GpuStage } from '../types';

export const GPU_STAGES: readonly GpuStage[] = [
  {
    id: 'processing-layer',
    name: 'Processing Layer',
    eyebrow: 'GPU LAYER 01',
    introduction: 'Assemble the processing layer that schedules threads, performs specialized calculations, produces pixels, and accesses nearby memory.',
    completionMessage: 'The processing layer can now schedule parallel work, accelerate graphics and AI calculations, produce pixels, and communicate with VRAM.',
    componentIds: ['cuda-cores', 'streaming-multiprocessor', 'tensor-cores', 'rt-cores', 'texture-mapping-units', 'render-output-units', 'gpu-cache', 'memory-controller'],
  },
  {
    id: 'board-hardware-layer',
    name: 'Graphics Card Hardware',
    eyebrow: 'GPU LAYER 02',
    introduction: 'Build the physical graphics card that connects, powers, stores data for, and exposes the GPU to the rest of the computer.',
    completionMessage: 'The graphics card can now receive power, communicate with the motherboard, store active data, and send finished images to displays.',
    componentIds: ['gpu-chip', 'pcb', 'displayport', 'hdmi-port', 'power-connector', 'pcie-connector', 'voltage-regulator-module', 'vram'],
  },
  {
    id: 'cooling-layer',
    name: 'Cooling Assembly',
    eyebrow: 'GPU LAYER 03',
    introduction: 'Complete the thermal path that moves heat from the GPU and nearby components into the surrounding air.',
    completionMessage: 'The cooling assembly now conducts, spreads, and removes heat so the finished GPU can operate safely.',
    componentIds: ['thermal-paste', 'copper-heat-pipes', 'heatsink', 'cooling-fans', 'thermal-pads'],
  },
];

export const TOTAL_COMPONENT_COUNT = GPU_STAGES.reduce((total, stage) => total + stage.componentIds.length, 0);

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
