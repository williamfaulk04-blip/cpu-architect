import type { GpuComponent, GpuComponentId } from '../types';

export const GPU_COMPONENTS: Record<GpuComponentId, GpuComponent> = {
  'streaming-multiprocessor': {
    id: 'streaming-multiprocessor',
    name: 'Streaming Multiprocessor',
    shortName: 'SM',
    category: 'CUDA_EXECUTION',
    clue: 'I organize groups of threads and provide the execution resources that run them together.',
    explanation: 'The Streaming Multiprocessor schedules thread groups and coordinates the GPU execution resources assigned to them.',
    color: '#ff7a59',
  },
  'cuda-cores': {
    id: 'cuda-cores',
    name: 'CUDA Cores',
    shortName: 'CUDA',
    category: 'CUDA_EXECUTION',
    clue: 'Thousands of us perform the arithmetic operations that make massively parallel workloads fast.',
    explanation: 'CUDA cores execute many arithmetic instructions in parallel across the threads managed by an SM.',
    color: '#55d6be',
  },
  'gpu-cache': {
    id: 'gpu-cache',
    name: 'GPU Cache',
    shortName: 'CACHE',
    category: 'CUDA_MEMORY',
    clue: 'I keep frequently needed data close to the execution units so they wait less often for memory.',
    explanation: 'GPU cache reduces expensive memory traffic by retaining recently or frequently accessed data near the processors.',
    color: '#6da7ff',
  },
};

export function componentById(id: GpuComponentId) {
  return GPU_COMPONENTS[id];
}
