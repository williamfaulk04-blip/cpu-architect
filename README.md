# GPU Architect

GPU Architect is a browser-based educational game for CSC 3501. Players assemble a graphics processing unit (GPU) layer by layer by matching components to their functions and learning how GPU hardware works.

## Learning objective

After completing the game, the player should be able to identify major GPU processing, memory, board-level, and cooling components, describe each component's primary responsibility, and explain how the components work together to process and display data.

## How to play

1. Read the functional description in the highlighted socket.
2. Select a component and review its educational definition.
3. Match the correct component to the highlighted socket.
4. Read the Architect Log for explanations, feedback, or corrections.
5. Complete each GPU assembly stage to unlock its achievement.
6. Finish all three stages to view the completed GPU and learn how its components work together.

## Game stages

**Stage 1: Processing Hardware**
- Streaming Multiprocessor
- CUDA Cores
- Tensor Cores
- GPU Cache
- Memory Controller

**Stage 2: Graphics Card Hardware**
- GPU Chip
- Printed Circuit Board (PCB)
- Video RAM (VRAM)
- Voltage Regulator Module (VRM)
- PCIe Connector
- Power Connector
- Display Outputs (HDMI and DisplayPort)

**Stage 3: Cooling Assembly**
- Thermal Paste
- Copper Heat Pipes
- Heatsink

The game includes 15 interactive components across the three stages.

## Scoring system

The planned scoring system starts at 1,000 points. Correct placements earn 100 points, first-attempt placements earn an additional 50 points, incorrect placements subtract 100 points, and completing a stage awards 250 bonus points. The maximum score is 4,000 points.

## Technology

- Phaser.js for the interactive game scene
- React and TypeScript for interface state
- Vinext/Vite for development and deployment
- CSS for the responsive GPU assembly interface

## Development

Install dependencies and run the local development server:

```bash
pnpm install
pnpm dev
```

Create a production build with:

```bash
pnpm build
```

## GitHub Pages

The repository includes a separate static build so the editable source and the deployed site stay in sync. Run `pnpm build:pages` to create `pages-dist/`. Pushing to `main` triggers the included GitHub Actions workflow, which builds and publishes the game automatically.

## Assignment alignment

The game integrates educational content into its central mechanic. Players must identify GPU components, understand their responsibilities, and assemble the graphics card through interactive puzzles rather than answer unrelated quiz questions.

## Accessibility and responsive design

- Responsive layouts for desktop, tablet, and mobile.
- Keyboard-accessible component selection.
- Visible keyboard focus indicators.
- Reduced-motion support.
- Touch-friendly component selection.
- Educational information that does not rely on hover interactions.

## Original CPU Architect

The original CPU Architect implementation is preserved separately in `components/cpu-game.tsx`. GPU Architect maintains its own implementation in `components/gpu-game.tsx`.

## Reference materials

- [Modal CUDA Programming Model](https://modal.com/gpu-glossary/device-software/cuda-programming-model)
- [Modal GPU RAM Glossary](https://modal.com/gpu-glossary/device-hardware/gpu-ram)
