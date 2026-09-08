# CPU Architect

CPU Architect is a browser-based educational game prototype for CSC 3501. Players assemble a simplified processor by dragging the ALU, Control Unit, Register File, and L1 Cache into their correct positions on a processor die.

## Learning objective

After completing the game, the player should be able to identify four major CPU components, describe each component's primary responsibility, and distinguish their roles in a simplified processor datapath.

## How to play

1. Select or drag a colored component from the Component Bay.
2. Drop it into its matching socket on the Processor Die.
3. Read the Architect Log for an explanation or correction.
4. Correctly install all four parts to bring the core online.

Correct placements earn 250 points. Incorrect placements subtract 25 points, to a minimum score of zero.

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

## Assignment alignment

The game integrates educational content into its central mechanic: players must reason about processor components rather than answer unrelated quiz questions. It includes player interaction, immediate feedback, a measurable objective, visible progression, instructions, and a technical visualization.

## Next milestones

- Add guided signal-path animations after assembly.
- Add a second mission covering the fetch-decode-execute cycle.
- Add keyboard-accessible placement controls.
- Create and validate the required 800 x 450 PNG gallery thumbnail.
- Add the team's names and final gallery metadata before submission.
