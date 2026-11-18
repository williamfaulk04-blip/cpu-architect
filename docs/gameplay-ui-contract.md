# GPU Architect Gameplay and Interface Contract

This contract lets the interface and accessibility branch render the game without importing Phaser objects or duplicating scoring and progression rules. Gameplay owns state transitions. The interface owns presentation and invokes the provided actions.

## Source files

- `game/ui-contract.ts` defines `GameplayViewModel`, `GameplayChoiceView`, and `GameplayActions`.
- `game/session.ts` owns the reducer and progression rules.
- `game/content/` owns stage order and educational content.
- `components/gpu-game.tsx` currently connects React, the session reducer, audio, and Phaser.

## Read-only interface model

The UI should render only values from `GameplayViewModel`:

- `phase`, `score`, and `feedback`
- stage identity and position
- active component ID and available choices
- installed counts and normalized progress values
- start, continue, final-stage, complete, and failure flags

Progress values are normalized from `0` through `1`. Choice records contain display labels, color, installed state, and rejected state. UI code must not calculate scores, decide whether an answer is correct, or advance a stage itself.

## Actions

The interface may call only these gameplay actions:

- `startStage()`
- `selectComponent(componentId)`
- `continueToNextStage()`
- `restart()`

The eventual integration wrapper will translate these functions into reducer actions. Phaser animation events remain an implementation detail of the gameplay container.

## Ownership boundaries

Gameplay owns component order, correctness, scoring, penalties, bonuses, failure, completion, and educational feedback. The interface owns layout, semantic HTML, focus management, visible controls, responsive behavior, reduced motion, and presentation of progress and feedback.

The interface branch should not edit `game/session.ts`, `game/config.ts`, or `game/content/` during normal UI work. The gameplay branch should avoid restructuring shared CSS or replacing accessible interface components during integration.

## Integration checks

Before merging the branches, confirm that:

1. Every visible state is derived from `GameplayViewModel`.
2. Pointer, keyboard, and touch interactions call the same action functions.
3. Disabled choices cannot be selected again.
4. Rejected choices and feedback remain perceivable without relying only on color.
5. Focus moves predictably after stage transitions and failure or completion overlays.
6. Reduced-motion mode suppresses nonessential movement without changing game rules.
7. The full gameplay test suite and GitHub Pages build pass after the merge.
