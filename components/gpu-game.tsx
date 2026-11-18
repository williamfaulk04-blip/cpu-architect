'use client';

import type { GameObjects } from 'phaser';
import { useEffect, useReducer, useRef, useState } from 'react';
import { GAME_CONFIG } from '../game/config';
import { componentById } from '../game/content/components';
import { activeStage, createInitialSession, sessionReducer } from '../game/session';
import type { GpuComponentId } from '../game/types';
import { createGameplayViewModel } from '../game/ui-contract';
import { playSound } from '../lib/game-audio';
import AssemblyUI from './game/assembly-ui';

type Bridge = { destroy: (removeCanvas?: boolean) => void; events: { emit: (event: string, ...args: unknown[]) => void } };
type SocketLayout = { id: GpuComponentId; x: number; y: number; width: number; height: number };

function createSocketLayout(ids: readonly GpuComponentId[]): SocketLayout[] {
  const columns = ids.length > 6 ? 4 : ids.length > 3 ? 3 : ids.length;
  const rows = Math.ceil(ids.length / columns);
  const width = columns === 4 ? 180 : columns === 3 ? 235 : 278;
  const height = rows === 1 ? 150 : 166;
  const xGap = columns === 1 ? 0 : (760 - width) / (columns - 1);
  const yGap = rows === 1 ? 0 : 210;
  return ids.map((id, index) => ({ id, x: 80 + width / 2 + index % columns * xGap, y: 170 + Math.floor(index / columns) * yGap, width, height }));
}

export default function GpuGame() {
  const host = useRef<HTMLDivElement>(null);
  const bridge = useRef<Bridge | null>(null);
  const inputReadyAt = useRef(0);
  const [session, dispatch] = useReducer(sessionReducer, createInitialSession());
  const stage = activeStage(session);
  const view = createGameplayViewModel(session);
  const activeId = view.activeComponentId;
  const [selected, setSelected] = useState<GpuComponentId | null>(null);
  const [hint, setHint] = useState<{ title: string; message: string }>();
  const [muted, setMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [boardRevision, setBoardRevision] = useState(0);
  const motion = useRef(reducedMotion);
  const canDropAt = useRef<(x: number, y: number) => boolean>(() => false);
  const boardKey = `${stage.id}:${boardRevision}`;
  const [readyBoard, setReadyBoard] = useState<string>();

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      motion.current = preference.matches;
      setReducedMotion(preference.matches);
      bridge.current?.events.emit('motion');
    };
    preference.addEventListener('change', update);
    update();
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (muted) return;
    const buttonFor = (target: EventTarget | null) => target instanceof Element ? target.closest('button') : null;
    const click = (event: MouseEvent) => { if (buttonFor(event.target)) playSound('click'); };
    const over = (event: PointerEvent) => {
      const button = buttonFor(event.target);
      if (button && !button.contains(event.relatedTarget as Node | null)) playSound('hover-in');
    };
    document.addEventListener('click', click, true);
    document.addEventListener('pointerover', over);
    return () => { document.removeEventListener('click', click, true); document.removeEventListener('pointerover', over); };
  }, [muted]);

  useEffect(() => {
    if (muted) return;
    if (session.phase === 'FAILED') playSound('failure');
    if (session.phase === 'STAGE_COMPLETE' || session.phase === 'MISSION_COMPLETE') playSound('success');
  }, [session.phase, muted]);

  useEffect(() => {
    if (!host.current) return;
    const sockets = createSocketLayout(stage.componentIds);
    let game: Bridge | undefined;
    let mounted = true;
    void import('phaser').then((Phaser) => {
      if (!mounted || !host.current) return;
      class AssemblyScene extends Phaser.Scene {
        boxes = new Map<GpuComponentId, GameObjects.Rectangle>();
        titles = new Map<GpuComponentId, GameObjects.Text>();
        descriptions = new Map<GpuComponentId, GameObjects.Text>();
        numbers = new Map<GpuComponentId, GameObjects.Text>();
        baseXs = new Map<GpuComponentId, number>();
        activeId: GpuComponentId = stage.componentIds[0];

        create() {
          this.cameras.main.setBackgroundColor('#07111d');
          const graphics = this.add.graphics();
          graphics.fillStyle(0x0b1929, 1).fillRoundedRect(48, 28, 824, 504, 28);
          graphics.lineStyle(2, 0x29425f, 1).strokeRoundedRect(48, 28, 824, 504, 28);
          this.add.text(76, 52, `GPU ASSEMBLY / ${stage.name.toUpperCase()}`, { fontFamily: 'monospace', fontSize: '13px', color: '#6f8fad', letterSpacing: 2 });
          this.add.text(842, 52, `LAYER ${String(session.stageIndex + 1).padStart(2, '0')}`, { fontFamily: 'monospace', fontSize: '11px', color: '#55d6be' }).setOrigin(1, 0);

          sockets.forEach((socket, index) => {
            const box = this.add.rectangle(socket.x, socket.y, socket.width, socket.height, 0x111f33).setStrokeStyle(2, 0x3b5775);
            const number = this.add.text(socket.x - socket.width / 2 + 12, socket.y - socket.height / 2 + 10, String(index + 1).padStart(2, '0'), { fontFamily: 'monospace', fontSize: '9px', color: '#6f8fad' });
            const title = this.add.text(socket.x, socket.y - socket.height / 2 + 28, index === 0 ? 'ACTIVE SOCKET' : 'LOCKED', { fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color: index === 0 ? '#f7c948' : '#496783', align: 'center', wordWrap: { width: socket.width - 24 } }).setOrigin(.5, 0);
            const description = this.add.text(socket.x, socket.y + 10, index === 0 ? componentById(socket.id).clue : 'Awaiting previous component.', { fontFamily: 'Arial', fontSize: columnsFor(stage.componentIds.length) === 4 ? '10px' : '11px', color: '#9fb2c4', align: 'center', wordWrap: { width: socket.width - 22 } }).setOrigin(.5);
            this.boxes.set(socket.id, box); this.titles.set(socket.id, title); this.descriptions.set(socket.id, description); this.numbers.set(socket.id, number); this.baseXs.set(socket.id, socket.x);
          });
          this.paintActive(this.activeId);
          canDropAt.current = (x, y) => {
            const canvas = this.game.canvas.getBoundingClientRect();
            const world = this.cameras.main.getWorldPoint(
              (x - canvas.left) * 920 / canvas.width,
              (y - canvas.top) * 560 / canvas.height,
            );
            const box = this.boxes.get(this.activeId);
            return box?.getBounds().contains(world.x, world.y) ?? false;
          };
          this.game.events.on('begin', () => this.focusActive());
          this.game.events.on('motion', () => this.focusActive());

          this.game.events.on('correct', (completedId: GpuComponentId, nextId?: GpuComponentId) => {
            const component = componentById(completedId);
            const color = Phaser.Display.Color.HexStringToColor(component.color).color;
            this.boxes.get(completedId)?.setFillStyle(color, .95).setStrokeStyle(2, 0xffffff, .2);
            this.titles.get(completedId)?.setText(`✓ ${component.shortName}`).setColor('#07101c');
            this.descriptions.get(completedId)?.setText(component.name).setColor('#07101c');
            this.numbers.get(completedId)?.setColor('#07101c');
            if (nextId) {
              this.paintActive(nextId);
              this.focusActive();
            } else {
              this.cameras.main.setZoom(1).centerOn(460, 280);
              if (!motion.current) this.cameras.main.flash(500, 85, 214, 190, false);
            }
          });
          this.game.events.on('wrong', () => {
            if (motion.current) return;
            const box = this.boxes.get(this.activeId);
            if (!box) return;
            const baseX = this.baseXs.get(this.activeId) ?? box.x;
            this.tweens.killTweensOf(box); box.setX(baseX);
            this.tweens.add({ targets: box, x: baseX + 8, yoyo: true, repeat: 3, duration: 45, onComplete: () => box.setX(baseX) });
            this.cameras.main.flash(120, 255, 80, 70, false);
          });
          if (mounted) setReadyBoard(boardKey);
        }

        focusActive() {
          const camera = this.cameras.main;
          camera.zoomEffect.reset();
          camera.panEffect.reset();
          if (motion.current) {
            camera.setZoom(1).centerOn(460, 280);
            return;
          }
          const socket = sockets.find(({ id }) => id === this.activeId);
          if (!socket) return;
          camera.zoomTo(1.25, 240);
          camera.pan(460 + (socket.x - 460) * .32, 280 + (socket.y - 280) * .32, 240);
        }

        paintActive(id: GpuComponentId) {
          this.activeId = id;
          this.boxes.get(id)?.setStrokeStyle(4, 0xf7c948).setFillStyle(0x172a40);
          this.titles.get(id)?.setText('ACTIVE SOCKET').setColor('#f7c948');
          this.descriptions.get(id)?.setText(componentById(id).clue).setColor('#9fb2c4');
        }
      }
      // oxlint-disable-next-line react/react-compiler -- Phaser owns and mutates its scene instance outside React.
      game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current, width: 920, height: 560, render: { antialias: true, roundPixels: true }, scene: AssemblyScene, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH } }) as Bridge;
      bridge.current = game;
    });
    return () => {
      mounted = false;
      canDropAt.current = () => false;
      game?.destroy(true);
      bridge.current = null;
    };
  }, [boardKey, session.stageIndex, stage]);

  function installComponent(componentId: GpuComponentId) {
    if (session.phase !== 'SOCKET_ACTIVE' || !activeId || hint || session.installedIds.includes(componentId)) return;
    const now = performance.now();
    if (now < inputReadyAt.current) return;
    inputReadyAt.current = now + GAME_CONFIG.inputLockMs;

    const correct = componentId === activeId;
    dispatch({ type: 'SELECT_COMPONENT', componentId });
    if (!correct) {
      const rejected = componentById(componentId);
      setSelected(componentId);
      setHint({
        title: 'Placement rejected',
        message: `${rejected.name} returned to the tray. ${rejected.explanation} Active socket clue: ${componentById(activeId).clue}`,
      });
      bridge.current?.events.emit('wrong');
    } else {
      setSelected(null);
      bridge.current?.events.emit('correct', componentId, stage.componentIds[view.installedInStage + 1]);
    }
  }

  function restart() {
    setSelected(null);
    setHint(undefined);
    inputReadyAt.current = 0;
    setBoardRevision((revision) => revision + 1);
    dispatch({ type: 'RESTART' });
  }

  const hasSocket = session.phase === 'SOCKET_ACTIVE' && activeId !== null;
  const phaseAction = view.canStartStage
    ? {
        label: `Begin layer ${view.stageIndex + 1}`,
        disabled: readyBoard !== boardKey,
        run: () => {
          dispatch({ type: 'START_STAGE' });
          bridge.current?.events.emit('begin');
        },
      }
    : view.canContinue
      ? {
          label: view.isFinalStage ? 'Finish GPU' : 'Continue to next layer',
          run: () => dispatch({ type: 'NEXT_STAGE' }),
        }
      : view.isComplete ? { label: 'Rebuild GPU', run: restart } : undefined;

  const heading = view.isComplete ? 'GPU assembly complete'
    : view.canContinue ? 'Layer complete'
    : view.canStartStage ? stage.name : 'Active socket';
  const clue = view.isComplete
    ? 'The board delivers power and moves data between the host, GPU, and graphics memory. The processing layer runs parallel workloads and renders frames, while the cooling assembly carries heat away so the card can keep working.'
    : view.canContinue ? stage.completionMessage
    : view.canStartStage ? stage.introduction
    : activeId ? componentById(activeId).clue : '';

  return (
    <AssemblyUI
      {...view}
      activeSocketLabel={heading}
      clue={clue}
      selectedComponentId={selected}
      selectedDefinition={selected ? componentById(selected).explanation : undefined}
      inputLocked={!hasSocket || !!hint}
      muted={muted}
      reducedMotion={reducedMotion}
      canvas={<div ref={host} className="assembly-phaser-host" aria-label={`${stage.name} assembly diagram`} />}
      phaseAction={phaseAction}
      hint={view.hasFailed ? {
        title: 'Assembly stopped',
        message: `${hint?.message ?? view.feedback} Your score reached zero. Restart to try again.`,
        actionLabel: 'Restart assembly',
        dismissible: false,
      } : hint}
      onSelectComponent={setSelected}
      onInstallSelected={() => { if (selected) installComponent(selected); }}
      canDropAt={(x, y) => canDropAt.current(x, y)}
      onDropComponent={installComponent}
      onDismissHint={() => {
        if (view.hasFailed) restart();
        else {
          inputReadyAt.current = 0;
          setHint(undefined);
        }
      }}
      onToggleMute={() => setMuted((value) => !value)}
    />
  );
}

function columnsFor(count: number) {
  return count > 6 ? 4 : count > 3 ? 3 : count;
}
