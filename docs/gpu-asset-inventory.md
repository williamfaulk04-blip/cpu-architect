# GPU Asset Inventory and Naming Convention

## Purpose

This document tracks the visual assets required for the GPU Architect game, defines consistent asset naming conventions, and records the current asset requirements for each game component and stage.

The inventory is intended to help developers and artists create, review, and integrate GPU artwork consistently.

## Asset Naming Convention

Use lowercase kebab-case for all asset keys and filenames.

### Component artwork

Component asset keys are generated using:

`gpu-component-<component-id>`

Example:

`gpu-component-streaming-multiprocessor`

The component ID in `game/content/components.ts` is the source of truth for the asset key.

### Socket artwork

Socket IDs are generated using:

`<stage-id>-socket-<socket-number>`

Socket numbers use two digits and start at `01`.

Socket asset keys are generated using:

`gpu-socket-<socket-id>`

Example:

`gpu-socket-processing-layer-socket-01`

The source code uses zero-based `socketOrder`, but the generated socket ID uses `socketOrder + 1`.

### Stage artwork

Stage asset keys should use:

`gpu-stage-<stage-id>`

Examples:

- `gpu-stage-processing-layer`
- `gpu-stage-board-hardware-layer`
- `gpu-stage-cooling-layer`

### UI and feedback artwork

Use the following prefixes for additional visual assets:

- `gpu-ui-<asset-name>` for interface artwork
- `gpu-icon-<asset-name>` for standalone icons
- `gpu-badge-<asset-name>` for badges
- `gpu-achievement-<asset-name>` for achievement artwork

## Asset Status

Use these status values when tracking assets:

| Status | Meaning |
|---|---|
| Needed | Asset has not been created |
| Draft | Asset exists but needs review |
| Approved | Asset is approved for integration |
| Optimized | Asset is compressed and ready for production |

An asset should not be marked Approved or Optimized until the actual file has been reviewed.

## Component Asset Inventory

The game currently defines 22 GPU components across three stages.

### Processing Layer

| Component | Asset Key | Availability | Status |
|---|---|---|---|
| Streaming Multiprocessors | `gpu-component-streaming-multiprocessor` | MVP | Needed |
| CUDA Cores | `gpu-component-cuda-cores` | MVP | Needed |
| Tensor Cores | `gpu-component-tensor-cores` | MVP | Needed |
| GPU Cache | `gpu-component-gpu-cache` | MVP | Needed |
| Memory Controller | `gpu-component-memory-controller` | MVP | Needed |
| RT Cores | `gpu-component-rt-cores` | Stretch | Needed |
| Texture Mapping Units | `gpu-component-texture-mapping-units` | Stretch | Needed |
| Render Output Units | `gpu-component-render-output-units` | Stretch | Needed |

### Board Hardware Layer

| Component | Asset Key | Availability | Status |
|---|---|---|---|
| GPU Chip | `gpu-component-gpu-chip` | MVP | Needed |
| Printed Circuit Board | `gpu-component-pcb` | MVP | Needed |
| Graphics Memory Chips | `gpu-component-vram` | MVP | Needed |
| Voltage Regulator Module | `gpu-component-voltage-regulator-module` | MVP | Needed |
| PCIe Connector | `gpu-component-pcie-connector` | MVP | Needed |
| Power Connector | `gpu-component-power-connector` | MVP | Needed |
| Display Outputs | `gpu-component-display-outputs` | MVP | Needed |
| DisplayPort Outputs | `gpu-component-displayport` | Stretch | Needed |
| HDMI Port | `gpu-component-hdmi-port` | Stretch | Needed |

### Cooling Layer

| Component | Asset Key | Availability | Status |
|---|---|---|---|
| Thermal Paste | `gpu-component-thermal-paste` | MVP | Needed |
| Copper Heat Pipes | `gpu-component-copper-heat-pipes` | MVP | Needed |
| Heatsink | `gpu-component-heatsink` | MVP | Needed |
| Cooling Fans | `gpu-component-cooling-fans` | Stretch | Needed |
| Thermal Pads | `gpu-component-thermal-pads` | Stretch | Needed |

## Socket Asset Inventory

Socket asset keys are generated from each component's stage and socket order.

### Processing Layer

| Socket ID | Socket Asset Key |
|---|---|
| `processing-layer-socket-01` | `gpu-socket-processing-layer-socket-01` |
| `processing-layer-socket-02` | `gpu-socket-processing-layer-socket-02` |
| `processing-layer-socket-03` | `gpu-socket-processing-layer-socket-03` |
| `processing-layer-socket-04` | `gpu-socket-processing-layer-socket-04` |
| `processing-layer-socket-05` | `gpu-socket-processing-layer-socket-05` |
| `processing-layer-socket-06` | `gpu-socket-processing-layer-socket-06` |
| `processing-layer-socket-07` | `gpu-socket-processing-layer-socket-07` |
| `processing-layer-socket-08` | `gpu-socket-processing-layer-socket-08` |

### Board Hardware Layer

| Socket ID | Socket Asset Key |
|---|---|
| `board-hardware-layer-socket-01` | `gpu-socket-board-hardware-layer-socket-01` |
| `board-hardware-layer-socket-02` | `gpu-socket-board-hardware-layer-socket-02` |
| `board-hardware-layer-socket-03` | `gpu-socket-board-hardware-layer-socket-03` |
| `board-hardware-layer-socket-04` | `gpu-socket-board-hardware-layer-socket-04` |
| `board-hardware-layer-socket-05` | `gpu-socket-board-hardware-layer-socket-05` |
| `board-hardware-layer-socket-06` | `gpu-socket-board-hardware-layer-socket-06` |
| `board-hardware-layer-socket-07` | `gpu-socket-board-hardware-layer-socket-07` |
| `board-hardware-layer-socket-08` | `gpu-socket-board-hardware-layer-socket-08` |
| `board-hardware-layer-socket-09` | `gpu-socket-board-hardware-layer-socket-09` |

### Cooling Layer

| Socket ID | Socket Asset Key |
|---|---|
| `cooling-layer-socket-01` | `gpu-socket-cooling-layer-socket-01` |
| `cooling-layer-socket-02` | `gpu-socket-cooling-layer-socket-02` |
| `cooling-layer-socket-03` | `gpu-socket-cooling-layer-socket-03` |
| `cooling-layer-socket-04` | `gpu-socket-cooling-layer-socket-04` |
| `cooling-layer-socket-05` | `gpu-socket-cooling-layer-socket-05` |

## Additional Visual Assets

| Asset Category | Naming Convention | Status |
|---|---|---|
| Stage backgrounds | `gpu-stage-<stage-id>` | Needed |
| UI icons | `gpu-icon-<asset-name>` | Needed |
| Interface artwork | `gpu-ui-<asset-name>` | Needed |
| Badges | `gpu-badge-<asset-name>` | Needed |
| Achievements | `gpu-achievement-<asset-name>` | Needed |
| Success feedback | `gpu-ui-success-<asset-name>` | Needed |
| Error feedback | `gpu-ui-error-<asset-name>` | Needed |
| Audio | `gpu-audio-<asset-name>` | Needed |

These are proposed naming conventions for additional assets. They do not represent existing asset files.

## Asset Requirements

### Component artwork

- Each component should have a clear, recognizable visual representation.
- Artwork should remain distinguishable at the game's intended display size.
- Component artwork should use a consistent visual style across all stages.
- Components should be visually identifiable without relying only on color.
- Artwork should support the game's placement and assembly interactions.

### Socket artwork

- Sockets should clearly indicate where components can be placed.
- Socket artwork should visually match the component artwork.
- Empty, selected, correct, and incorrect states should be distinguishable where applicable.
- Socket visuals should remain readable on desktop and mobile layouts.

### Stage artwork

- Each stage should have a visual identity that matches its hardware layer.
- Stage backgrounds should provide enough contrast for components and sockets.
- Background artwork should not interfere with component placement or readability.

### UI and feedback artwork

- Icons should communicate their purpose clearly.
- Feedback visuals should be consistent with the game's interface.
- Important feedback should remain understandable without color alone.
- UI artwork should scale appropriately across supported screen sizes.

## File Format and Optimization

Preferred formats:

- SVG for scalable icons and simple vector artwork.
- PNG for transparent raster artwork.
- WebP for optimized raster images where supported.

Assets should be optimized before production use.

Avoid unnecessarily large image dimensions, duplicate assets, and excessive transparency padding.

## Accessibility

- Do not use color as the only way to communicate component states.
- Maintain sufficient contrast between artwork and its background.
- Keep important visual details readable at smaller screen sizes.
- Provide accessible text labels or descriptions for meaningful interface icons when appropriate.

## Attribution

Any third-party artwork must have its source and license recorded before being added to the project.

Do not include assets with unclear usage rights.

## Acceptance Checklist

- [ ] Component asset keys match `game/content/components.ts`.
- [ ] Socket asset keys follow the generated socket naming convention.
- [ ] All 22 components are represented in the inventory.
- [ ] MVP and Stretch availability is recorded accurately.
- [ ] Asset status reflects whether artwork actually exists.
- [ ] Additional asset naming conventions are documented.
- [ ] Asset formats and optimization expectations are documented.
- [ ] Accessibility requirements are included.
- [ ] Third-party asset attribution requirements are included.
- [ ] The document has been reviewed by a teammate.

## Source of Truth

The component IDs, component asset keys, socket IDs, socket asset keys, and availability values are generated by:

`game/content/components.ts`

If component data changes, update this inventory to match the source code.
