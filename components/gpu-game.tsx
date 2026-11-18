'use client';

import { useEffect, useReducer, useRef } from 'react';
import { GAME_CONFIG } from '../game/config';
import { GPU_COMPONENTS, componentById } from '../game/content/components';
import { PROCESSING_STAGE } from '../game/content/stages';
import { activeComponentId, createInitialSession, sessionReducer } from '../game/session';
import type { GpuComponentId } from '../game/types';
import { playSound } from '../lib/game-audio';

type Bridge = { destroy: (removeCanvas?: boolean) => void; events: { emit: (event: string, ...args: unknown[]) => void } };

const SOCKETS = [
  { id: 'streaming-multiprocessor' as const, x: 460, y: 142 },
  { id: 'cuda-cores' as const, x: 292, y: 350 },
  { id: 'gpu-cache' as const, x: 628, y: 350 },
];

export default function GpuGame() {
  const host = useRef<HTMLDivElement>(null);
  const bridge = useRef<Bridge | null>(null);
  const inputReadyAt = useRef(0);
  const [session, dispatch] = useReducer(sessionReducer, createInitialSession());
  const activeId = activeComponentId(session);
  const progress = session.installedIds.length / PROCESSING_STAGE.componentIds.length * 100;

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
    if (session.phase === 'STAGE_COMPLETE') playSound('success');
  }, [session.phase]);

  useEffect(() => {
    if (!host.current) return;
    let game: Bridge | undefined;
    let mounted = true;
    import('phaser').then((Phaser) => {
      if (!mounted || !host.current) return;
      class AssemblyScene extends Phaser.Scene {
        boxes = new Map<GpuComponentId, any>();
        titles = new Map<GpuComponentId, any>();
        descriptions = new Map<GpuComponentId, any>();
        numbers = new Map<GpuComponentId, any>();
        baseXs = new Map<GpuComponentId, number>();
        activeId: GpuComponentId = PROCESSING_STAGE.componentIds[0];

        create() {
          this.cameras.main.setBackgroundColor('#07111d');
          const graphics = this.add.graphics();
          graphics.fillStyle(0x0b1929, 1).fillRoundedRect(58, 34, 804, 492, 28);
          graphics.lineStyle(2, 0x29425f, 1).strokeRoundedRect(58, 34, 804, 492, 28);
          graphics.lineStyle(5, 0x17304b, .95);
          graphics.lineBetween(460, 196, 330, 296);
          graphics.lineBetween(460, 196, 590, 296);
          graphics.lineBetween(427, 350, 493, 350);
          this.add.text(88, 58, 'GPU DIE / PROCESSING LAYER', { fontFamily: 'monospace', fontSize: '13px', color: '#6f8fad', letterSpacing: 2 });
          this.add.text(790, 58, 'LAYER 01', { fontFamily: 'monospace', fontSize: '11px', color: '#55d6be' }).setOrigin(1, 0);

          SOCKETS.forEach((socket, index) => {
            const component = componentById(socket.id);
            const box = this.add.rectangle(socket.x, socket.y, 278, 112, 0x111f33).setStrokeStyle(2, 0x3b5775);
            const number = this.add.text(socket.x - 120, socket.y - 42, `0${index + 1}`, { fontFamily: 'monospace', fontSize: '10px', color: '#6f8fad' });
            const title = this.add.text(socket.x, socket.y - 28, index === 0 ? 'ACTIVE SOCKET' : 'LOCKED', { fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold', color: index === 0 ? '#f7c948' : '#496783' }).setOrigin(.5);
            const description = this.add.text(socket.x, socket.y + 16, component.clue, { fontFamily: 'Arial', fontSize: '12px', color: '#9fb2c4', align: 'center', wordWrap: { width: 232 } }).setOrigin(.5);
            this.boxes.set(socket.id, box); this.titles.set(socket.id, title); this.descriptions.set(socket.id, description); this.numbers.set(socket.id, number); this.baseXs.set(socket.id, socket.x);
          });
          this.paintActive(this.activeId);

          this.game.events.on('correct', (completedId: GpuComponentId, nextId?: GpuComponentId) => {
            const component = componentById(completedId);
            const color = Phaser.Display.Color.HexStringToColor(component.color).color;
            this.boxes.get(completedId)?.setFillStyle(color, .95).setStrokeStyle(2, 0xffffff, .2);
            this.titles.get(completedId)?.setText(`✓ ${component.name.toUpperCase()}`).setColor('#07101c');
            this.descriptions.get(completedId)?.setColor('#07101c');
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
        }
      }
      game = new Phaser.Game({ type: Phaser.AUTO, parent: host.current, width: 920, height: 560, resolution: Math.min(window.devicePixelRatio || 1, 2), render: { antialias: true, roundPixels: true }, scene: AssemblyScene, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH } }) as Bridge;
      bridge.current = game;
    });
    return () => { mounted = false; game?.destroy(true); bridge.current = null; };
  }, []);

  function chooseComponent(componentId: GpuComponentId) {
    if (session.phase !== 'SOCKET_ACTIVE' || !activeId) return;
    const now = performance.now();
    if (now < inputReadyAt.current) return;
    inputReadyAt.current = now + GAME_CONFIG.inputLockMs;
    const correct = componentId === activeId;
    dispatch({ type: 'SELECT_COMPONENT', componentId });
    if (!correct) return void bridge.current?.events.emit('wrong');
    bridge.current?.events.emit('correct', componentId, PROCESSING_STAGE.componentIds[session.installedIds.length + 1]);
  }

  return <main className="game-shell gpu-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">G</span><div><b>GPU ARCHITECT</b><span>ASSEMBLE • ACCELERATE • RENDER</span></div></div><div className="mission"><span>{PROCESSING_STAGE.eyebrow}</span><b>{PROCESSING_STAGE.name}</b></div><div className="score"><span>SCORE</span><b>{session.score.toString().padStart(4, '0')}</b></div></header>
    <section className="workbench guided"><aside className="intel-panel">
      <span className="eyebrow">{PROCESSING_STAGE.eyebrow}</span>
      <h1>{session.phase === 'STAGE_COMPLETE' ? 'Layer online.' : session.phase === 'STAGE_INTRO' ? 'Build the GPU.' : 'Identify the component.'}</h1>
      <p>{session.phase === 'STAGE_INTRO' ? PROCESSING_STAGE.introduction : session.phase === 'STAGE_COMPLETE' ? PROCESSING_STAGE.completionMessage : 'Read the function inside the highlighted socket and choose the matching GPU component.'}</p>
      {session.phase === 'STAGE_INTRO' && <div className="stage-card"><span>FIRST PLAYABLE SLICE</span><b>3 processing components</b><p>Correct placements earn points. A correct first attempt earns an additional bonus.</p><button onClick={() => dispatch({ type: 'START_STAGE' })}>BEGIN ASSEMBLY</button></div>}
      {session.phase === 'SOCKET_ACTIVE' && <div className="choices" role="group" aria-label="GPU component choices">{PROCESSING_STAGE.componentIds.map((id) => { const component = GPU_COMPONENTS[id]; return <button key={id} className={session.wrongId === id ? 'wrong' : ''} onClick={() => chooseComponent(id)} disabled={session.installedIds.includes(id)}><span style={{ background: component.color }}>{component.shortName}</span><span className="choice-copy"><b>{component.name}</b><em>{component.category.replace('_', ' ')}</em></span><small>INSTALL</small></button>; })}</div>}
      {session.phase === 'STAGE_COMPLETE' && <div className="completion-card"><b>STAGE 01 COMPLETE</b><span>Score: {session.score}</span><p>+{GAME_CONFIG.stageCompletionBonus} stage-completion bonus applied.</p><button onClick={() => location.reload()}>REBUILD LAYER</button></div>}
      <div className="progress-label"><span>PROCESSING LAYER</span><b>{session.installedIds.length}/{PROCESSING_STAGE.componentIds.length}</b></div><div className="progress" role="progressbar" aria-label="Processing layer completion" aria-valuemin={0} aria-valuemax={PROCESSING_STAGE.componentIds.length} aria-valuenow={session.installedIds.length}><i style={{ width: `${progress}%` }} /></div>
    </aside><section className="game-panel"><div ref={host} className="phaser-host" aria-label="GPU processing layer assembly diagram"/><div className={`feedback ${session.phase === 'STAGE_COMPLETE' ? 'complete' : session.wrongId ? 'error' : ''}`} aria-live="polite"><span>{session.phase === 'STAGE_COMPLETE' ? 'LAYER ONLINE' : session.wrongId ? 'POINT PENALTY' : 'ARCHITECT LOG'}</span><p>{session.feedback}</p></div></section></section>
    <footer><span>CSC 3501 • COMPUTER ORGANIZATION & DESIGN</span><span>GPU MIGRATION • STAGE 01</span></footer>
    {session.phase === 'FAILED' && <section className="failure-screen" role="alertdialog" aria-modal="true" aria-labelledby="failure-title"><div className="sad-face">:(</div><h2 id="failure-title">You failed!</h2><p>Your GPU ran into a problem and could not complete the processing layer.</p><p className="failure-detail">SCORE_DEPLETED_TO_ZERO<br/>Stop code: INCORRECT_GPU_COMPONENT_SELECTION</p><div className="fake-progress">0% complete</div><button onClick={() => location.reload()}>Restart assembly</button></section>}
  </main>;
}
