# GPU Asset Inventory and Naming Convention

## Purpose

Track the GPU Architect visual and audio assets, their data-model keys, source information, licensing, target specifications, and readiness.

This inventory documents planned and existing assets. An entry marked `needed` does not mean the asset has been created.

## Naming Convention

- Use lowercase kebab-case filenames.
- Use descriptive names that match the component or visual purpose.
- Phaser keys must be unique and use the same naming style.
- Use `.webp` for optimized opaque or transparent images where supported.
- Use `.png` when lossless transparency or crisp UI artwork is required.
- Use `.mp3` for compressed audio effects.
- Record the actual source and license before approving an asset.

Examples:

- `gpu-stage-1-blueprint.webp`
- `component-streaming-multiprocessor.webp`
- `socket-streaming-multiprocessor-active.webp`
- `sfx-placement-correct.mp3`

## Status Values

- `needed` — not created or selected
- `draft` — work in progress
- `approved` — reviewed and ready to use
- `optimized` — compressed and ready for production

## Asset Requirements

For every asset, record:

- Purpose and owning screen
- Filename and Phaser key
- Source/creator and license
- Target dimensions and format
- Transparent or opaque background
- Desktop/mobile variants, if needed
- Status

## GPU Blueprint and Layer Visuals

| Purpose | Filename | Phaser key | Target | Background | Source / License | Status |
|---|---|---|---|---|---|---|
| Full GPU blueprint | `gpu-blueprint.webp` | `gpu-blueprint` | TBD | TBD | TBD | needed |
| Processing layer | `gpu-stage-1-blueprint.webp` | `gpu-stage-1-blueprint` | TBD | TBD | TBD | needed |
| Board hardware layer | `gpu-stage-2-blueprint.webp` | `gpu-stage-2-blueprint` | TBD | TBD | TBD | needed |
| Cooling layer | `gpu-stage-3-blueprint.webp` | `gpu-stage-3-blueprint` | TBD | TBD | TBD | needed |

## Component Pieces

The data model currently generates `gpu-component-<component-id>` keys for all 22 components. The 15 MVP components and 7 stretch components are listed below.

| Component ID | Filename | Phaser key | Scope | Status |
|---|---|---|---|---|
| `streaming-multiprocessor` | `component-streaming-multiprocessor.webp` | `gpu-component-streaming-multiprocessor` | MVP | needed |
| `cuda-cores` | `component-cuda-cores.webp` | `gpu-component-cuda-cores` | MVP | needed |
| `tensor-cores` | `component-tensor-cores.webp` | `gpu-component-tensor-cores` | MVP | needed |
| `gpu-cache` | `component-gpu-cache.webp` | `gpu-component-gpu-cache` | MVP | needed |
| `memory-controller` | `component-memory-controller.webp` | `gpu-component-memory-controller` | MVP | needed |
| `rt-cores` | `component-rt-cores.webp` | `gpu-component-rt-cores` | Stretch | needed |
| `texture-mapping-units` | `component-texture-mapping-units.webp` | `gpu-component-texture-mapping-units` | Stretch | needed |
| `render-output-units` | `component-render-output-units.webp` | `gpu-component-render-output-units` | Stretch | needed |
| `gpu-chip` | `component-gpu-chip.webp` | `gpu-component-gpu-chip` | MVP | needed |
| `pcb` | `component-pcb.webp` | `gpu-component-pcb` | MVP | needed |
| `vram` | `component-vram.webp` | `gpu-component-vram` | MVP | needed |
| `voltage-regulator-module` | `component-voltage-regulator-module.webp` | `gpu-component-voltage-regulator-module` | MVP | needed |
| `pcie-connector` | `component-pcie-connector.webp` | `gpu-component-pcie-connector` | MVP | needed |
| `power-connector` | `component-power-connector.webp` | `gpu-component-power-connector` | MVP | needed |
| `display-outputs` | `component-display-outputs.webp` | `gpu-component-display-outputs` | MVP | needed |
| `displayport` | `component-displayport.webp` | `gpu-component-displayport` | Stretch | needed |
| `hdmi-port` | `component-hdmi-port.webp` | `gpu-component-hdmi-port` | Stretch | needed |
| `thermal-paste` | `component-thermal-paste.webp` | `gpu-component-thermal-paste` | MVP | needed |
| `copper-heat-pipes` | `component-copper-heat-pipes.webp` | `gpu-component-copper-heat-pipes` | MVP | needed |
| `heatsink` | `component-heatsink.webp` | `gpu-component-heatsink` | MVP | needed |
| `cooling-fans` | `component-cooling-fans.webp` | `gpu-component-cooling-fans` | Stretch | needed |
| `thermal-pads` | `component-thermal-pads.webp` | `gpu-component-thermal-pads` | Stretch | needed |

## Socket States

The data model generates a base socket key from each socket ID:

`gpu-socket-<stage-id>-socket-<two-digit-order>`

Each socket needs three visual states:

- `inactive`
- `active`
- `completed`

Use this filename/key pattern for each socket state:

- `socket-<component-id>-inactive.webp` / `socket-<component-id>-inactive`
- `socket-<component-id>-active.webp` / `socket-<component-id>-active`
- `socket-<component-id>-completed.webp` / `socket-<component-id>-completed`

The 15 MVP socket visuals are required for the initial release. Stretch component sockets should be tracked as stretch assets. Confirm the exact socket-to-component mapping against `game/content/components.ts` before implementation.

## Category Badges and UI Icons

| Purpose | Filename | Phaser key | Target | Status |
|---|---|---|---|---|
| CUDA execution badge | `badge-cuda-execution.webp` | `badge-cuda-execution` | TBD | needed |
| CUDA memory badge | `badge-cuda-memory.webp` | `badge-cuda-memory` | TBD | needed |
| Board hardware badge | `badge-board-hardware.webp` | `badge-board-hardware` | TBD | needed |
| Cooling badge | `badge-cooling.webp` | `badge-cooling` | TBD | needed |
| Selection icon | `icon-selection.webp` | `icon-selection` | TBD | needed |
| Hint icon | `icon-hint.webp` | `icon-hint` | TBD | needed |
| Audio on/off icons | `icon-audio-on.webp`, `icon-audio-off.webp` | `icon-audio-on`, `icon-audio-off` | TBD | needed |
| Explore icon | `icon-explore.webp` | `icon-explore` | TBD | needed |
| Restart icon | `icon-restart.webp` | `icon-restart` | TBD | needed |

## Stage Achievement Visuals

| Purpose | Filename | Phaser key | Owning screen | Status |
|---|---|---|---|---|
| Processing layer achievement | `achievement-processing-layer.webp` | `achievement-processing-layer` | Results / stage feedback | needed |
| Board hardware achievement | `achievement-board-hardware-layer.webp` | `achievement-board-hardware-layer` | Results / stage feedback | needed |
| Cooling layer achievement | `achievement-cooling-layer.webp` | `achievement-cooling-layer` | Results / stage feedback | needed |
| Final completion achievement | `achievement-gpu-complete.webp` | `achievement-gpu-complete` | Results | needed |

## Final GPU and Explore View

| Purpose | Filename | Phaser key | Target | Status |
|---|---|---|---|---|
| Completed GPU overview | `gpu-completed.webp` | `gpu-completed` | TBD | needed |
| Explore view GPU visual | `gpu-explore-overview.webp` | `gpu-explore-overview` | TBD | needed |
| Explore view component highlight | `gpu-explore-highlight.webp` | `gpu-explore-highlight` | TBD | needed |

## Audio

| Purpose | Filename | Phaser key | Format | Status |
|---|---|---|---|---|
| UI click | `sfx-ui-click.mp3` | `sfx-ui-click` | MP3 | needed |
| Hover | `sfx-ui-hover.mp3` | `sfx-ui-hover` | MP3 | needed |
| Correct placement | `sfx-placement-correct.mp3` | `sfx-placement-correct` | MP3 | needed |
| Incorrect placement | `sfx-placement-failure.mp3` | `sfx-placement-failure` | MP3 | needed |
| Stage success | `sfx-stage-success.mp3` | `sfx-stage-success` | MP3 | needed |
| Game completion | `sfx-game-success.mp3` | `sfx-game-success` | MP3 | needed |

## Fonts and Attribution

| Purpose | Filename | Phaser key | Source / Creator | License | Status |
|---|---|---|---|---|---|
| Primary UI font | TBD | TBD | TBD | TBD | needed |
| Display / heading font | TBD | TBD | TBD | TBD | needed |
| Asset attribution record | `asset-credits.md` | N/A | Project documentation | N/A | needed |

Do not mark fonts or assets approved until their license and attribution requirements are recorded.

## Performance Targets

Final targets should be confirmed before asset production.

| Asset type | Target format | Target dimensions / size |
|---|---|---|
| Blueprint / layer visual | WebP or PNG | TBD |
| Component pieces | WebP or PNG with transparency | TBD |
| Socket states | WebP or PNG | TBD |
| UI icons / badges | WebP or PNG | TBD |
| Audio effects | MP3 | Keep each effect small and short |
| Fonts | WOFF2 where supported | Use only required font weights |

Optimize assets for GitHub Pages: avoid unnecessarily large images, audio files, and font files. Use mobile variants only when responsive scaling is insufficient.

## Acceptance Checklist

- [ ] Every data-model asset key has an inventory entry.
- [ ] No two assets share a Phaser key.
- [ ] Source, creator, and license information are recorded.
- [ ] Target dimensions, format, background, and variants are documented.
- [ ] Status is recorded for every asset.
- [ ] Image, audio, and font sizes are optimized for GitHub Pages loading.
- [ ] MVP assets are distinguished from stretch assets.
