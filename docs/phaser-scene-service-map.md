# Phaser Scene and Shared-Service Map

## Purpose

Define scene boundaries before implementation so navigation and shared state are not duplicated.

This document describes the proposed architecture for the GPU Architect game. The current Phaser game is hosted in `components/gpu-game.tsx`; these scene boundaries are planning targets and do not mean separate Phaser scene classes have already been implemented.

## Scene Map

| Scene | Responsibility |
|---|---|
| BootScene | Preload required assets and validate game configuration |
| MenuScene | Display the title, instructions, and start action |
| AssemblyScene | Manage all three assembly stages, component selection, placement, zoom, score, and progress |
| ResultsScene | Display rating, final score, accuracy, Explore GPU, and rebuild actions |
| ExploreScene | Display the completed interactive GPU diagram |

## Scene Responsibilities

### BootScene

- Load required assets.
- Validate configuration before gameplay begins.
- Transition to MenuScene when initialization succeeds.

### MenuScene

- Display the game title and instructions.
- Provide the start action.
- Transition to AssemblyScene when a new session begins.

### AssemblyScene

- Own the active assembly stage.
- Manage component selection and socket placement.
- Handle zoom and assembly interaction.
- Display score and progress.
- Transition to ResultsScene when the session ends.

### ResultsScene

- Display the final rating, score, and accuracy.
- Provide an Explore GPU action.
- Provide a Rebuild GPU action.

### ExploreScene

- Display the completed GPU diagram.
- Support interactive exploration of the assembled components.
- Provide a way to return to results or rebuild the GPU.

## Reusable Overlays

| Overlay | Responsibility |
|---|---|
| Incorrect-placement hint | Explain an incorrect placement and provide a way to dismiss the hint |
| Stage completion | Show stage completion feedback and allow progression |
| Zero-score failure | Explain that the session has failed and provide the appropriate restart or exit action |
| Pause/settings | Pause gameplay and expose settings if this feature is retained |

### Overlay Rules

- Only the intended overlay should be active at a time unless explicitly designed otherwise.
- An open overlay blocks input to the underlying scene.
- Closing an overlay restores input to the underlying scene.
- Overlay visibility and dismissal must not duplicate session or scoring logic.

## Shared Services

| Service | Responsibility |
|---|---|
| Game/session state controller | Track session progress and coordinate state transitions |
| Component/stage repository | Provide component and stage definitions |
| Scoring service | Calculate score, bonuses, penalties, and accuracy |
| Audio service | Manage sound playback and mute settings |
| Responsive layout helper | Adapt layout to viewport size |
| Accessibility/input adapter | Support keyboard, pointer, and touch input and reduced-motion behavior |

### Shared-Service Rules

- Shared services contain no Phaser display objects.
- Services operate on data and expose clear interfaces.
- Scenes use shared services rather than duplicating their logic.
- Session data is owned by the session state controller.

## Session Data and Transitions

- Starting a new game creates a new session.
- Moving between assembly stages preserves the current session, score, and installed components.
- ResultsScene receives the completed session's score, accuracy, rating, and completion data.
- ExploreScene receives the completed GPU configuration needed to display the diagram.
- Rebuild GPU starts a fresh session and resets gameplay progress.
- Returning from ExploreScene to ResultsScene preserves the completed result data.

## Input Blocking

When an overlay is open:

- The overlay receives relevant input.
- The underlying scene does not process gameplay input.
- Closing the overlay restores the previous scene's input behavior.

## Static GitHub Pages Compatibility

- All scene and service boundaries must work in a client-side static build.
- Asset paths must remain valid under the GitHub Pages repository subpath.
- No required gameplay feature may depend on a server-only runtime.
- Scene transitions must not require a backend service.

## Acceptance Criteria

- Each screen has a named owner in the scene map.
- Shared services contain no Phaser display objects.
- Overlays block underlying input while open.
- Scene transitions preserve only documented session data.
- All planned paths are compatible with the static GitHub Pages build.
