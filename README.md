# CPU Architect

CPU Architect is a browser-based educational game prototype for CSC 3501. Players assemble a simplified processor one socket at a time by matching functional descriptions to the ALU, Control Unit, Register File, and L1 Cache.

## Learning objective

After completing the game, the player should be able to identify four major CPU components, describe each component's primary responsibility, and distinguish their roles in a simplified processor datapath.

## How to play

1. Read the functional description in the highlighted socket.
2. Choose the component that performs that job.
3. Read the Architect Log for an explanation or correction.
4. Enter the correctly identified component and assemble its three internal systems.
5. Return to the processor die and complete all four components to bring the core online.

The game starts at 1,000 points. Correct top-level choices earn 250 points, correct internal choices earn 150 points, and incorrect choices subtract 100 points. Reaching zero triggers a failure screen and restart option.

## Technology

- Phaser.js for the interactive game scene
- React and TypeScript for interface state
- Vinext/Vite for development and deployment
- CSS for the responsive mission-control interface

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

The game integrates educational content into its central mechanic: players must reason about processor components rather than answer unrelated quiz questions. It includes player interaction, immediate feedback, a measurable objective, visible progression, instructions, and a technical visualization.

## Next milestones

- Add guided signal-path animations after assembly.
- Add a second mission covering the fetch-decode-execute cycle.
- Add keyboard-accessible placement controls.
- Create and validate the required 800 x 450 PNG gallery thumbnail.
- Add the team's names and final gallery metadata before submission.
