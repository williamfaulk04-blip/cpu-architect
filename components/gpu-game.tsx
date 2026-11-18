'use client';

import type { GameObjects } from 'phaser';
import { useEffect, useReducer, useRef } from 'react';
import { GAME_CONFIG } from '../game/config';
import { GPU_COMPONENTS, componentById } from '../game/content/components';
import { GPU_STAGES, TOTAL_COMPONENT_COUNT } from '../game/content/stages';
import { activeComponentId, activeStage, createInitialSession, overallProgress, sessionReducer, stageInstalledIds } from '../game/session';
import type { GpuComponentId } from '../game/types';
import { playSound } from '../lib/game-audio';

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
  const installedInStage = stageInstalledIds(session);
  const activeId = activeComponentId(session);
  const stageProgress = installedInStage.length / stage.componentIds.length * 100;
  const totalProgress = overallProgress(session) * 100;
  const finalStage = session.stageIndex === GPU_STAGES.length - 1;

  useEffect(() => {
    const buttonFor = (target: EventTarget | null) => target instanceof Element ? target.closest('button') : null;
    const click = (event: MouseEvent) => { if (buttonFor(event.target)) playSound('click'); };
    const over = (event: PointerEvent) => {
      const button = buttonFor(event.target);
      if (button && !button.contains(event.relatedTarget as Node | null)) playSound('hover-in');
    };
    document.addEventListener('click', click, true);
    document.addEventListener('pointerover', over);
    return () => { document.removeEventListener('click', click, true); document.removeEventListener('pointerover', over); };
  }, []);

  useEffect(() => {
    if (session.phase === 'FAILED') playSound('failure');
    if (session.phase === 'STAGE_COMPLETE' || session.phase === 'MISSION_COMPLETE') playSound('success');
  }, [session.phase]);

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

          this.game.events.on('correct', (completedId: GpuComponentId, nextId?: GpuComponentId) => {
            const component = componentById(completedId);
            const color = Phaser.Display.Color.HexStringToColor(component.color).color;
            this.boxes.get(completedId)?.setFillStyle(color, .95).setStrokeStyle(2, 0xffffff, .2);
            this.titles.get(completedId)?.setText(`✓ ${component.shortName}`).setColor('#07101c');
            this.descriptions.get(completedId)?.setText(component.name).setColor('#07101c');
            this.numbers.get(completedId)?.setColor('#07101c');
            if (nextId) this.paintActive(nextId); else this.cameras.main.flash(500, 85, 214, 190, false);
          });
          this.game.events.on('wrong', () => {
            const box = this.boxes.get(this.activeId);
            if (!box) return;
            const baseX = this.baseXs.get(this.activeId) ?? box.x;
            this.tweens.killTweensOf(box); box.setX(baseX);
            this.tweens.add({ targets: box, x: baseX + 8, yoyo: true, repeat: 3, duration: 45, onComplete: () => box.setX(baseX) });
            this.cameras.main.flash(120, 255, 80, 70, false);
          });
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
    return () => { mounted = false; game?.destroy(true); bridge.current = null; };
  }, [session.stageIndex, stage]);

  function chooseComponent(componentId: GpuComponentId) {
    if (session.phase !== 'SOCKET_ACTIVE' || !activeId) return;
    const now = performance.now();
    if (now < inputReadyAt.current) return;
    inputReadyAt.current = now + GAME_CONFIG.inputLockMs;
    const correct = componentId === activeId;
    dispatch({ type: 'SELECT_COMPONENT', componentId });
    if (!correct) {
      bridge.current?.events.emit('wrong');
      return;
    }
    bridge.current?.events.emit('correct', componentId, stage.componentIds[installedInStage.length + 1]);
  }

  const heading = session.phase === 'MISSION_COMPLETE' ? 'GPU online.' : session.phase === 'STAGE_COMPLETE' ? 'Layer online.' : session.phase === 'STAGE_INTRO' ? `Build layer ${session.stageIndex + 1}.` : 'Identify the component.';
  const instructions = session.phase === 'MISSION_COMPLETE' ? session.feedback : session.phase === 'STAGE_INTRO' ? stage.introduction : session.phase === 'STAGE_COMPLETE' ? stage.completionMessage : 'Read the function inside the highlighted socket and choose the matching GPU component.';

  return <main className="game-shell gpu-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">G</span><div><b>GPU ARCHITECT</b><span>ASSEMBLE • ACCELERATE • RENDER</span></div></div><div className="mission"><span>{stage.eyebrow}</span><b>{stage.name}</b></div><div className="score"><span>SCORE</span><b>{session.score.toString().padStart(4, '0')}</b></div></header>
    <section className="workbench guided"><aside className="intel-panel">
      <span className="eyebrow">{stage.eyebrow} • {session.stageIndex + 1}/{GPU_STAGES.length}</span><h1>{heading}</h1><p>{instructions}</p>
      {session.phase === 'STAGE_INTRO' && <div className="stage-card"><span>{stage.name.toUpperCase()}</span><b>{stage.componentIds.length} components</b><p>Correct placements earn points. A correct first attempt earns an additional bonus.</p><button onClick={() => dispatch({ type: 'START_STAGE' })}>BEGIN LAYER {session.stageIndex + 1}</button></div>}
      {session.phase === 'SOCKET_ACTIVE' && <fieldset className="choices"><legend className="visually-hidden">{stage.name} component choices</legend>{stage.componentIds.map((id) => { const component = GPU_COMPONENTS[id]; return <button key={id} className={session.wrongId === id ? 'wrong' : ''} onClick={() => chooseComponent(id)} disabled={session.installedIds.includes(id)}><span style={{ background: component.color }}>{component.shortName}</span><span className="choice-copy"><b>{component.name}</b><em>{component.category.replace('_', ' ')}</em></span><small>INSTALL</small></button>; })}</fieldset>}
      {session.phase === 'STAGE_COMPLETE' && <div className="completion-card"><b>LAYER {session.stageIndex + 1} COMPLETE</b><span>Score: {session.score}</span><p>+{GAME_CONFIG.stageCompletionBonus} stage-completion bonus applied.</p><button onClick={() => dispatch({ type: 'NEXT_STAGE' })}>{finalStage ? 'FINISH GPU' : 'CONTINUE TO NEXT LAYER'}</button></div>}
      {session.phase === 'MISSION_COMPLETE' && <div className="completion-card mission-complete"><b>GPU ASSEMBLY COMPLETE</b><span>Final score: {session.score}</span><p>All {TOTAL_COMPONENT_COUNT} approved components are installed across three working layers.</p><button onClick={() => location.reload()}>REBUILD GPU</button></div>}
      <div className="progress-label"><span>{stage.name.toUpperCase()}</span><b>{installedInStage.length}/{stage.componentIds.length}</b></div><div className="progress" aria-hidden="true"><i style={{ width: `${stageProgress}%` }} /></div>
      <div className="progress-label overall-progress-label"><span>WHOLE GPU</span><b>{session.installedIds.length}/{TOTAL_COMPONENT_COUNT}</b></div><div className="progress overall-progress" aria-hidden="true"><i style={{ width: `${totalProgress}%` }} /></div>
      <progress className="visually-hidden" aria-label="Whole GPU completion" max={TOTAL_COMPONENT_COUNT} value={session.installedIds.length}>{session.installedIds.length} of {TOTAL_COMPONENT_COUNT}</progress>
    </aside><section className="game-panel"><div ref={host} className="phaser-host" aria-label={`${stage.name} assembly diagram`}/><div className={`feedback ${session.phase === 'STAGE_COMPLETE' || session.phase === 'MISSION_COMPLETE' ? 'complete' : session.wrongId ? 'error' : ''}`} aria-live="polite"><span>{session.phase === 'MISSION_COMPLETE' ? 'GPU ONLINE' : session.phase === 'STAGE_COMPLETE' ? 'LAYER ONLINE' : session.wrongId ? 'POINT PENALTY' : 'ARCHITECT LOG'}</span><p>{session.feedback}</p></div></section></section>
    <footer><span>CSC 3501 • COMPUTER ORGANIZATION & DESIGN</span><span>GPU ASSEMBLY • LAYER {session.stageIndex + 1} OF {GPU_STAGES.length}</span></footer>
    {session.phase === 'FAILED' && <section className="failure-screen" role="alertdialog" aria-modal="true" aria-labelledby="failure-title"><div className="sad-face">:(</div><h2 id="failure-title">You failed!</h2><p>Your GPU ran into a problem while assembling {stage.name.toLowerCase()}.</p><p className="failure-detail">SCORE_DEPLETED_TO_ZERO<br/>Stop code: INCORRECT_GPU_COMPONENT_SELECTION</p><div className="fake-progress">{Math.round(totalProgress)}% complete</div><button onClick={() => location.reload()}>Restart assembly</button></section>}
  </main>;
}

function columnsFor(count: number) {
  return count > 6 ? 4 : count > 3 ? 3 : count;
}
