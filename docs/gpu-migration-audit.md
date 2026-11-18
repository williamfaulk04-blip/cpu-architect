# GPU Architect Migration Audit

This document records the first implementation audit for the migration from CPU Architect to GPU Architect. The goal is to preserve the proven application shell and interaction systems while replacing CPU-specific game content with the approved three-stage GPU architecture.

## Migration baseline

- Source branch: `main`
- Migration branch: `feature/gpu-architect-migration`
- Deployment target: static GitHub Pages build under `/cpu-architect/`
- Frameworks retained: React, Phaser, TypeScript, Vite, and the existing CSS application shell
- MVP content target: 15 GPU components across processing, graphics-card hardware, and cooling stages

`main` remains the preserved CPU Architect version. GPU work belongs on the migration branch until it is reviewed and ready to merge.

## Reuse unchanged or with minimal edits

### Static GitHub Pages pipeline

Retain:

- `vite.pages.config.ts`
- `pages/index.html` structure
- `pages/src/main.tsx` entry pattern
- `public/` asset handling
- Relative asset loading through `document.baseURI`
- Current `/cpu-architect/` base path unless the repository is renamed later

The project already builds without a server and is compatible with GitHub Pages. New gameplay must not introduce server-only APIs, database dependencies, secret environment variables, or runtime filesystem access.

### Phaser rendering shell

Retain:

- Dynamic Phaser loading inside the client component
- A single responsive Phaser host
- `P.Scale.FIT` and `P.Scale.CENTER_BOTH`
- Device-pixel-ratio rendering cap
- Phaser event communication with React
- Camera flash and tween feedback patterns

The current CPU diagram geometry is not reusable, but the renderer lifecycle and React-to-Phaser bridge are.

### Responsive application shell

Retain:

- Header, information panel, canvas, feedback area, and footer hierarchy
- Desktop two-column layout
- Tablet and mobile single-column behavior
- Canvas aspect-ratio preservation
- Responsive typography and spacing approach
- Mobile-safe feedback and failure overlays

The information panel and component tray will require GPU-specific content and mobile ordering changes, but their layout principles remain valid.

### Feedback and input safeguards

Retain:

- Central Architect Log feedback area
- Correct, incorrect, complete, and failure feedback states
- Input debounce through `inputReadyAt`
- Killing active tweens before a new reject animation
- Resetting an animated socket to its original X position
- `aria-live` feedback announcements
- Failure overlay and restart behavior

The fixed 350 ms input gate should become a named configuration value rather than remaining inline.

### Audio

Retain:

- `lib/game-audio.ts`
- Procedural click, hover, and success effects
- Windows XP failure audio with procedural fallback
- User-gesture-based AudioContext initialization
- GitHub Pages-safe public asset resolution

The migration should add a mute preference and expose audio keys through centralized configuration.

### Explorer behavior

Retain:

- Post-game Explore mode
- Hover and keyboard focus descriptions
- Live component information readout
- Expand/close animation pattern
- Responsive explorer layout concept

Replace the four-component processor diagram with the completed GPU and its 15 MVP components. Essential information must also be selectable by touch, not hover only.

## Refactor before expanding

### Separate content from gameplay logic

The current component data, order, internal parts, scoring values, UI copy, and Phaser positions are embedded in `components/cpu-game.tsx`. Before adding GPU content, split them into:

- GPU component records
- Stage records
- Scoring and timing configuration
- Session-state controller
- Phaser layout data
- Reusable presentation components or overlays

No scene should require a conditional branch for a named GPU component. Adding or moving a component should be a data change.

### Replace scattered React state with a session model

The current component uses independent state variables for score, step, internal view, wrong selection, failure, exploration, and feedback. Replace these with an explicit session state and documented transitions:

`MISSION_INTRO → STAGE_INTRO → SOCKET_ACTIVE → PLACEMENT_CHECK → FEEDBACK → STAGE_COMPLETE → FINAL_RESULTS`

Incorrect placement returns to the active socket, zero score enters failure, and final results can enter Explore GPU or restart.

### Centralize tuning values

Move these values into configuration:

- Starting score: 1,000
- Correct placement: +100
- First-attempt bonus: +50
- Incorrect placement: -100
- Stage-completion bonus: +250
- Failure threshold: 0
- Input lock duration
- Responsive breakpoints
- Sound keys
- Rating thresholds

Progress must be calculated from installed components rather than score.

## Replace completely

### CPU learning content

Replace:

- Control Unit, Register File, ALU, and L1 Cache records
- CPU internal-part records
- Processor-datapath explanations
- CPU-specific clues, hints, achievements, and completion text
- Four-component ordering and progress calculations

Use the approved GPU component inventory and category badges: CUDA EXECUTION, CUDA MEMORY, BOARD HARDWARE, and COOLING.

### Processor diagram and geometry

Replace:

- Processor die title and connection lines
- Four CPU socket positions
- CPU color and label mapping
- CPU explorer grid areas
- CPU internal-component diagrams

The replacement must support three visual layers and 15 ordered component sockets. Position data should be separate from educational content.

### Branding and metadata

Replace CPU-specific text in:

- Page and application titles
- Open Graph metadata
- `README.md`
- `games-entry.yml`
- Page description
- Header, mission, footer, failure, and completion copy
- Component and CSS names where they encode CPU concepts

Do not change the GitHub Pages base path until the team explicitly decides whether to rename the repository.

## Proposed module boundaries

```text
components/
  gpu-game.tsx
  game/
    assembly-hud.tsx
    component-tray.tsx
    hint-overlay.tsx
    stage-complete-overlay.tsx
    failure-overlay.tsx
    gpu-explorer.tsx
game/
  config.ts
  types.ts
  session.ts
  scoring.ts
  content/
    stages.ts
    components.ts
  phaser/
    assembly-scene.ts
    layout.ts
lib/
  game-audio.ts
```

This is a target structure, not a requirement to split every file immediately. The Stage 1 vertical slice should drive the smallest useful extraction.

## Recommended implementation order

1. Preserve `main` and work only on `feature/gpu-architect-migration`.
2. Add GPU types, scoring configuration, stage records, and the 15-component schema.
3. Add validation for component IDs, socket IDs, choices, ordering, and asset keys.
4. Introduce the explicit session-state controller.
5. Rename the top-level component and neutralize CPU-specific CSS class names where practical.
6. Build a Stage 1 vertical slice with Streaming Multiprocessor, CUDA Cores, and GPU Cache.
7. Validate correct, incorrect, failure, progress, stage-completion, keyboard, touch, and resize behavior.
8. Review the vertical slice before producing the remaining twelve components.
9. Add Stage 2, Stage 3, final results, and Explore GPU.
10. Complete metadata, documentation, asset optimization, browser testing, and GitHub Pages deployment.

## First vertical-slice definition

The first playable migration checkpoint should include:

- GPU Architect branding
- Stage 1 introduction
- Three data-driven Stage 1 components
- One active socket at a time
- Functional clues and category badges
- Pointer and keyboard selection
- Correct-placement lock and score update
- Incorrect-placement penalty and educational hint
- Input lock during feedback
- Progress derived from installed component IDs
- Stage-completion explanation and bonus
- Desktop and mobile layout check
- Successful static GitHub Pages build

The remaining MVP components should not be produced until the team approves this interaction pattern.

## Audit conclusion

CPU Architect is a viable foundation for GPU Architect. The project does not need a rewrite. Its strongest reusable assets are the responsive shell, Phaser lifecycle, feedback loop, sound system, failure experience, input safeguards, and explorer interaction. The migration risk is concentrated in the monolithic CPU-specific game component. Extracting data, configuration, and session transitions before expanding content will keep the implementation maintainable and reduce merge conflicts for the team.
