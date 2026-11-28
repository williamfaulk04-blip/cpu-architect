import { GAME_CONFIG } from '../config';
import { GPU_COMPONENTS } from './components';
import type { GpuComponentId, GpuStage } from '../types';

export const GPU_STAGES: readonly GpuStage[] = [
  {
    id: 'processing-layer',
    name: 'Processing Layer',
    eyebrow: 'GPU LAYER 01',
    order: 1,
    introduction: 'Assemble the processing layer that schedules threads, performs specialized calculations, produces pixels, and accesses nearby memory.',
    completionMessage: 'The processing layer can now schedule parallel work, accelerate graphics and AI calculations, produce pixels, and communicate with VRAM.',
    achievementName: 'Parallel Processing',
    artworkKey: 'gpu-stage-processing-layer',
    stageBonus: GAME_CONFIG.stageCompletionBonus,
    componentIds: [
      'streaming-multiprocessor',
      'cuda-cores',
      'tensor-cores',
      'gpu-cache',
      'memory-controller',
      'rt-cores',
      'texture-mapping-units',
      'render-output-units',
    ],
  },
  {
    id: 'board-hardware-layer',
    name: 'Graphics Card Hardware',
    eyebrow: 'GPU LAYER 02',
    order: 2,
    introduction: 'Build the physical graphics card that connects, powers, stores data for, and exposes the GPU to the rest of the computer.',
    completionMessage: 'The graphics card can now receive power, communicate with the motherboard, store active data, and send finished images to displays.',
    achievementName: 'Graphics Card Assembly',
    artworkKey: 'gpu-stage-board-hardware',
    stageBonus: GAME_CONFIG.stageCompletionBonus,
    componentIds: [
      'gpu-chip',
      'pcb',
      'vram',
      'voltage-regulator-module',
      'pcie-connector',
      'power-connector',
      'display-outputs',
      'displayport',
      'hdmi-port',
    ],
  },
  {
    id: 'cooling-layer',
    name: 'Cooling Assembly',
    eyebrow: 'GPU LAYER 03',
    order: 3,
    introduction: 'Complete the thermal path that moves heat from the GPU and nearby components into the surrounding air.',
    completionMessage: 'The cooling assembly now conducts, spreads, and removes heat so the finished GPU can operate safely.',
    achievementName: 'Thermal Management',
    artworkKey: 'gpu-stage-cooling-layer',
    stageBonus: GAME_CONFIG.stageCompletionBonus,
    componentIds: [
      'thermal-paste',
      'copper-heat-pipes',
      'heatsink',
      'cooling-fans',
      'thermal-pads',
    ],
  },
];

export const TOTAL_COMPONENT_COUNT = Object.values(GPU_COMPONENTS).filter(
  (component) => component.enabled,
).length;

function validateStages(stages: readonly GpuStage[]) {
  const stageIds = new Set<string>();
  const stageOrders = new Set<number>();
  const componentIds = new Set<GpuComponentId>();
  const socketIds = new Set<string>();
  const assetKeys = new Set<string>();

  for (const stage of stages) {
    if (stageIds.has(stage.id)) {
      throw new Error(`Duplicate GPU stage id: ${stage.id}`);
    }
    stageIds.add(stage.id);

    if (stageOrders.has(stage.order)) {
      throw new Error(`Duplicate GPU stage order: ${stage.order}`);
    }
    stageOrders.add(stage.order);

    if (stage.componentIds.length === 0) {
      throw new Error(`GPU stage ${stage.id} has no components`);
    }

    const stageSocketOrders = new Set<number>();

    for (const componentId of stage.componentIds) {
      const component = GPU_COMPONENTS[componentId];

      if (!component) {
        throw new Error(`Unknown GPU component id: ${componentId}`);
      }

      if (componentIds.has(componentId)) {
        throw new Error(`GPU component appears in multiple stages: ${componentId}`);
      }
      componentIds.add(componentId);

      if (component.stageId !== stage.id) {
        throw new Error(
          `Component ${componentId} references stage ${component.stageId}, not ${stage.id}`,
        );
      }

      if (component.stageOrder !== stage.order) {
        throw new Error(
          `Component ${componentId} has stage order ${component.stageOrder}, expected ${stage.order}`,
        );
      }

      if (socketIds.has(component.socketId)) {
        throw new Error(`Duplicate GPU socket id: ${component.socketId}`);
      }
      socketIds.add(component.socketId);

      if (stageSocketOrders.has(component.socketOrder)) {
        throw new Error(
          `Duplicate socket order ${component.socketOrder} in stage ${stage.id}`,
        );
      }
      stageSocketOrders.add(component.socketOrder);

      if (assetKeys.has(component.assetKey)) {
        throw new Error(`Duplicate GPU asset key: ${component.assetKey}`);
      }
      assetKeys.add(component.assetKey);

      if (assetKeys.has(component.socketAssetKey)) {
        throw new Error(`Duplicate GPU socket asset key: ${component.socketAssetKey}`);
      }
      assetKeys.add(component.socketAssetKey);

      for (const choiceId of component.choices) {
        if (!GPU_COMPONENTS[choiceId]) {
          throw new Error(`Unknown choice ${choiceId} for component ${componentId}`);
        }
      }

      if (component.enabled && component.availability !== 'MVP') {
        throw new Error(`Enabled component ${componentId} is not marked MVP`);
      }

      if (component.availability === 'MVP' && !component.enabled) {
        throw new Error(`MVP component ${componentId} is disabled`);
      }
    }
  }

  for (const componentId of Object.keys(GPU_COMPONENTS) as GpuComponentId[]) {
    if (!componentIds.has(componentId)) {
      throw new Error(`GPU component is not assigned to a stage: ${componentId}`);
    }
  }

  const enabledComponents = Object.values(GPU_COMPONENTS).filter(
    (component) => component.enabled,
  );

  if (enabledComponents.length !== 15) {
    throw new Error(
      `Expected 15 enabled MVP components, found ${enabledComponents.length}`,
    );
  }

  for (const component of enabledComponents) {
    if (!componentIds.has(component.id)) {
      throw new Error(`Enabled MVP component is missing from stages: ${component.id}`);
    }
  }
}

validateStages(GPU_STAGES);
