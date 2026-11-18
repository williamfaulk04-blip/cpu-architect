# GPU Architect Interface and Accessibility Handoff

This document is the working brief for the teammate responsible for GPU Architect's interface, responsive behavior, and accessibility. It is also written as an instruction source for any AI coding assistant helping with that work.

## Quick links

- GitHub repository: https://github.com/williamfaulk04-blip/cpu-architect
- Your development branch: https://github.com/williamfaulk04-blip/cpu-architect/tree/feature/gpu-responsive-ui
- Shared integration branch: https://github.com/williamfaulk04-blip/cpu-architect/tree/feature/gpu-architect-migration
- Trello board: https://trello.com/b/IwoyH3LX/gpu-architect-development
- Current team planning document: https://docs.google.com/document/d/1COXJryXEHrz7UeO5sBUmf0FNa6hv6cciXJITliC21ps/edit?usp=sharing
- Wireframes: embedded in the current team planning document
- Migration audit in this repository: `docs/gpu-migration-audit.md`

## Project summary

GPU Architect is a browser-based Phaser and React educational game for CSC 3501. It is being migrated from the existing CPU Architect prototype without abandoning the working application shell or GitHub Pages deployment.

Players assemble a GPU in three stages:

1. Processing hardware
2. Graphics-card hardware
3. Cooling assembly

The game presents one active socket at a time. The player reads a functional clue, selects the matching component, and places it into the GPU. Correct choices lock into place and award points. Incorrect choices deduct points and open an educational Windows-blue-screen-style hint. The final experience shows a completed GPU, score, accuracy, Explore GPU mode, and restart action.

The approved MVP contains 15 components. The gameplay/data team is responsible for the component schema, session state, scoring, stage progression, Phaser assembly behavior, and the Stage 1 vertical slice. This branch owns the presentation and accessible input layer described below.

## Your branch and integration target

Work only on:

```text
feature/gpu-responsive-ui
```

Open pull requests into:

```text
feature/gpu-architect-migration
```

Do not open the feature pull request directly into `main`. The `main` branch preserves the working CPU Architect version until the GPU migration is reviewed.

## Your responsibilities

### 1. Reusable assembly interface

Create reusable React presentation components for:

- Header with GPU Architect branding, stage, stage name, and score
- Information panel with the active socket, clue, selected component definition, category badge, and progress
- Component tray with selectable component cards
- Architect Log feedback region
- Responsive assembly-screen layout
- Stage-completion overlay
- Incorrect-placement hint overlay
- Failure overlay
- Final-results actions and score summary shell

These components should work with mock props. They must not depend on named GPU components or own the gameplay rules.

### 2. Responsive behavior

Implement the approved layout behavior.

#### Desktop

- Information panel beside the GPU canvas
- GPU canvas remains the primary visual element
- Component tray below the canvas
- Score and stage information remain visible without covering the game

#### Tablet

- Narrow or collapsible information panel
- Canvas preserves its aspect ratio
- Component tray can scroll horizontally
- Controls remain reachable without precision pointing

#### Mobile

- GPU canvas appears first
- Information panel moves below the canvas
- Component tray scrolls horizontally
- Definitions and hints use collapsible or modal presentation
- Essential information never depends on hover
- Touch targets are at least 44 by 44 CSS pixels

### 3. Keyboard support

Provide a keyboard alternative for every pointer-only action:

- Tab or arrow navigation through available components
- Enter or Space to select a component
- A clear action to install the selected component into the active socket
- Escape to dismiss non-destructive overlays where appropriate
- Predictable focus restoration after closing overlays
- No keyboard traps

Visible focus indicators must remain present in every color theme and state.

### 4. Accessible feedback

- Use `aria-live="polite"` for routine Architect Log updates.
- Use an appropriate dialog role and focus management for blocking hints and failure.
- Announce score changes and placement outcomes without duplicating every visual label.
- Do not use color as the only indicator of active, incorrect, locked, or completed states.
- Pair state colors with text and/or icons.
- Give icon-only buttons accessible names.
- Keep headings in a logical order.

### 5. User preferences

Add presentation support for:

- Mute/unmute control
- `prefers-reduced-motion`
- A programmatic reduced-motion flag that the Phaser/gameplay layer can read later

Reduced motion should remove or simplify zoom, shake, large scaling, and screen-flash effects without removing the instructional feedback.

## Integration contract

Build the presentation components around props rather than importing gameplay state directly. Use this shape as the initial contract; small refinements are allowed if documented in the pull request.

```ts
export type ComponentChoice = {
  id: string;
  name: string;
  shortName: string;
  category: 'CUDA_EXECUTION' | 'CUDA_MEMORY' | 'BOARD_HARDWARE' | 'COOLING';
  color: string;
  disabled?: boolean;
};

export type AssemblyUIProps = {
  stageNumber: number;
  stageCount: number;
  stageName: string;
  activeSocketLabel: string;
  clue: string;
  score: number;
  completedCount: number;
  totalCount: number;
  selectedComponentId: string | null;
  selectedDefinition?: string;
  choices: ComponentChoice[];
  feedback: string;
  feedbackTone: 'instruction' | 'correct' | 'incorrect' | 'complete';
  inputLocked: boolean;
  muted: boolean;
  reducedMotion: boolean;
  onSelectComponent: (id: string) => void;
  onInstallSelected: () => void;
  onToggleMute: () => void;
};
```

The gameplay layer owns all values and callbacks. The interface renders them and sends user intent back through callbacks.

## Recommended files

Create new reusable files where practical:

```text
components/game/
  assembly-shell.tsx
  assembly-header.tsx
  assembly-hud.tsx
  component-tray.tsx
  architect-log.tsx
  hint-overlay.tsx
  stage-complete-overlay.tsx
  failure-overlay.tsx
  accessibility-controls.tsx
app/
  assembly-shell.css
  accessibility.css
```

You may adjust these names, but keep components focused and avoid building another monolithic game file.

## Files and systems you should not own

To prevent merge conflicts and duplicated work, do not redesign or implement:

- GPU component records or educational content
- Stage order or socket order
- Scoring formulas and rating thresholds
- Session-state transition rules
- Phaser scene architecture
- Socket validation or correct-answer logic
- GPU component coordinates or final artwork
- GitHub Pages configuration
- Repository branding outside the reusable UI components

Avoid large edits to `components/cpu-game.tsx`. If a small edit is required to preview a new component, isolate it, explain it in the pull request, and do not combine it with gameplay changes.

## Mock-data development

Use mock data while the gameplay layer is being built. The mock should exercise:

- Long and short component names
- Every category badge
- No selected component
- A selected component with a multi-line definition
- Locked input
- Correct and incorrect feedback
- Zero and full progress
- Desktop, tablet, and narrow phone widths
- Muted and reduced-motion states

Mock data should stay outside production gameplay content and be easy to remove or retain as a development fixture.

## Visual direction

- Preserve the existing CPU Architect mission-control style as the starting point.
- Keep the dark technical background, high-contrast panels, and compact monospace labels.
- Use the GPU canvas as the dominant visual element.
- Category badges should be visually distinct but still understandable without color.
- Avoid decorative animation that competes with functional clues.
- Do not polish component artwork on this branch; use placeholders with stable dimensions.

The wireframes establish hierarchy, not final pixel-perfect styling. Responsive usability and clarity are more important than matching every wireframe measurement.

## Definition of Done

The interface/accessibility feature is ready for review when:

- Components render entirely from props and callbacks.
- Desktop, tablet, and mobile arrangements match the approved hierarchy.
- The component tray works with mouse, touch, and keyboard.
- All interactive controls have visible focus states.
- Blocking overlays manage focus and can be dismissed appropriately.
- Routine feedback is announced without excessive repetition.
- Active, locked, incorrect, and complete states use text/icons as well as color.
- Touch targets meet the 44-by-44-pixel minimum.
- Essential information is available without hover.
- Reduced-motion mode removes major motion while preserving feedback.
- Mute control exposes its current state accessibly.
- The existing static build still succeeds.
- No new console errors, TypeScript errors, lint errors, or broken asset paths are introduced.
- The pull request includes desktop and mobile screenshots plus a short keyboard-testing note.

## Manual testing checklist

### Keyboard

- [ ] Reach every control with the keyboard.
- [ ] See a clear focus indicator at all times.
- [ ] Select a component with Enter or Space.
- [ ] Install a selection without dragging.
- [ ] Open and dismiss each overlay.
- [ ] Confirm focus returns to a logical control.
- [ ] Confirm no keyboard trap exists.

### Touch and responsive layout

- [ ] Test a narrow phone viewport.
- [ ] Test a tablet viewport.
- [ ] Confirm horizontal tray scrolling does not move the entire page.
- [ ] Confirm buttons remain at least 44 by 44 CSS pixels.
- [ ] Confirm no text or control is clipped.
- [ ] Confirm orientation or resizing does not require a reload.

### Visual and motion

- [ ] Check active, locked, incorrect, and complete states without relying on color.
- [ ] Check text contrast against panel backgrounds.
- [ ] Enable reduced motion and verify large motion is removed.
- [ ] Verify focus indicators remain visible on every state color.

### Build

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm build:pages`.
- [ ] Confirm asset paths work beneath `/cpu-architect/`.

## Git workflow

Before starting:

```bash
git fetch github
git switch feature/gpu-responsive-ui
git pull --ff-only github feature/gpu-responsive-ui
pnpm install
```

Use focused conventional commits, for example:

```text
feat(ui): add responsive assembly shell
feat(a11y): add keyboard component selection
feat(a11y): respect reduced motion preference
fix(ui): preserve tray scrolling on mobile
```

Before opening a pull request:

```bash
git fetch github
git merge github/feature/gpu-architect-migration
pnpm lint
pnpm build:pages
git push github feature/gpu-responsive-ui
```

Do not force-push after another teammate begins reviewing or contributing to the branch.

Use this pull-request target:

```text
base: feature/gpu-architect-migration
compare: feature/gpu-responsive-ui
```

## Instructions for the AI coding assistant

Copy the following section into the AI assistant's initial project prompt or point the assistant directly to this file.

### AI scope

You are implementing only the interface, responsive layout, and accessibility layer for GPU Architect on `feature/gpu-responsive-ui`.

You must:

1. Read this entire handoff document and `docs/gpu-migration-audit.md` before editing code.
2. Inspect the existing CPU Architect UI and preserve reusable visual behavior.
3. Prefer new focused React components instead of expanding `components/cpu-game.tsx`.
4. Build against mock props and the documented integration contract.
5. Preserve the Phaser canvas container without implementing Phaser gameplay.
6. Provide keyboard and touch alternatives for component selection.
7. Implement visible focus, dialog focus management, accessible labels, and live feedback.
8. Support desktop, tablet, mobile, mute, and reduced-motion states.
9. Keep the static GitHub Pages build working beneath `/cpu-architect/`.
10. Run lint and the static build before claiming completion.

You must not:

- Change the approved component list, stage order, scoring, or learning content.
- Implement correct-answer logic or session-state transitions.
- Replace Phaser or change the deployment framework.
- Rename the repository or GitHub Pages base path.
- Add a backend, database, authentication system, or secret environment variables.
- Force-push, merge into `main`, or open a pull request against `main`.
- Delete working CPU Architect systems merely because they will later be replaced.

If an integration detail is unclear, expose a typed prop or callback and document the assumption instead of inventing gameplay behavior.

### AI completion report

At completion, report:

- Files created and changed
- Interface states implemented
- Keyboard behavior implemented
- Responsive widths manually checked
- Reduced-motion and mute behavior
- Lint and build results
- Remaining integration assumptions
- The exact commit hashes created

## Coordination note

The gameplay/data team may change the source of the props while this branch is active, but it should not change the meaning of the integration contract without notifying the UI owner. If both branches need the same shared type, coordinate before moving it so neither side creates a competing definition.
