'use client';

import { useEffect, useRef, useState } from 'react';
import { playSound } from '../lib/game-audio';

type Key = 'control' | 'registers' | 'alu' | 'cache';
type Bridge = { destroy: (x?: boolean) => void; events: { emit: (e: string, ...a: unknown[]) => void } };
type Part = { name: string; short: string; clue: string; role: string };

const C: Record<Key, { name: string; short: string; role: string; clue: string; color: string }> = {
  control: { name: 'Control Unit', short: 'CU', role: 'Decodes instructions and directs the datapath.', clue: 'I decode each instruction and tell the rest of the processor what to do.', color: '#ff7a59' },
  registers: { name: 'Register File', short: 'REG', role: 'Stores the CPU’s fastest working values.', clue: 'I hold the operands and results the CPU needs right now.', color: '#55d6be' },
  alu: { name: 'Arithmetic Logic Unit', short: 'ALU', role: 'Performs arithmetic and logical operations.', clue: 'I add, subtract, compare, and perform logical operations.', color: '#f7c948' },
  cache: { name: 'L1 Cache', short: 'L1', role: 'Keeps frequently used data close to the CPU.', clue: 'I keep recently used instructions and data nearby to reduce memory delays.', color: '#6da7ff' },
};
const ORDER: Key[] = ['control', 'registers', 'alu', 'cache'];
const PARTS: Record<Key, Part[]> = {
  control: [
    { name: 'Instruction Decoder', short: 'DEC', clue: 'I translate an instruction’s opcode into actions the processor understands.', role: 'interprets the opcode' },
    { name: 'Sequence Controller', short: 'SEQ', clue: 'I order control steps so operations happen at the correct time.', role: 'coordinates timing and order' },
    { name: 'Control-Signal Generator', short: 'SIG', clue: 'I enable registers, select datapath routes, and command memory operations.', role: 'produces datapath control signals' },
  ],
  registers: [
    { name: 'Register Cells', short: 'CELL', clue: 'We are the small, fast storage locations that hold binary words.', role: 'store working values' },
    { name: 'Read Ports', short: 'READ', clue: 'We let the datapath retrieve selected operands without erasing them.', role: 'output selected operands' },
    { name: 'Write Port', short: 'WRITE', clue: 'I place a result into the selected register when write-enable is active.', role: 'stores a new result' },
  ],
  alu: [
    { name: 'Adder', short: 'ADD', clue: 'I produce sums and also support subtraction using two’s complement.', role: 'handles addition and subtraction' },
    { name: 'Logic Unit', short: 'LOGIC', clue: 'I perform bitwise AND, OR, XOR, and related Boolean operations.', role: 'handles Boolean operations' },
    { name: 'Status Flags', short: 'FLAGS', clue: 'I record conditions such as zero, negative, carry, and overflow.', role: 'report operation results' },
  ],
  cache: [
    { name: 'Tag Array', short: 'TAG', clue: 'I store address identifiers that reveal which memory block is present.', role: 'identifies cached blocks' },
    { name: 'Data Array', short: 'DATA', clue: 'I hold the actual bytes copied from main memory.', role: 'stores cached data' },
    { name: 'Tag Comparator', short: 'CMP', clue: 'I compare the requested address tag to the stored tag to detect a hit.', role: 'determines hits and misses' },
  ],
};

export default function CpuGame() {
  const host = useRef<HTMLDivElement>(null);
  const bridge = useRef<Bridge | null>(null);
  const inputReadyAt = useRef(0);
  const [score, setScore] = useState(1000);
  const [step, setStep] = useState(0);
  const [inside, setInside] = useState<Key | null>(null);
  const [partStep, setPartStep] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [exploreInfo, setExploreInfo] = useState({ title: 'Completed Processor Core', text: 'Hover over or focus a component to inspect what it does.' });
  const [feedback, setFeedback] = useState('Read the highlighted socket, then choose the component that matches its job.');
  const complete = step === ORDER.length;
  const current = ORDER[step];

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

  useEffect(() => { if (failed) playSound('failure'); }, [failed]);
  useEffect(() => { if (complete) playSound('success'); }, [complete]);

  useEffect(() => {
    if (!host.current) return;
    let game: Bridge | undefined;
    let active = true;
    import('phaser').then((P) => {
      if (!active || !host.current) return;
      const slots = [{ key: 'control' as Key, x: 460, y: 130 }, { key: 'registers' as Key, x: 270, y: 300 }, { key: 'alu' as Key, x: 650, y: 300 }, { key: 'cache' as Key, x: 460, y: 455 }];
      class Scene extends P.Scene {
        boxes = new Map<Key, any>(); titles = new Map<Key, any>(); descriptions = new Map<Key, any>(); numbers = new Map<Key, any>(); baseXs = new Map<Key, number>(); activeKey: Key = ORDER[0];
        create() {
          this.cameras.main.setBackgroundColor('#08111f'); const g = this.add.graphics();
          g.fillStyle(0x0d1b2d, 1).fillRoundedRect(62, 35, 796, 490, 28); g.lineStyle(2, 0x29425f, 1).strokeRoundedRect(62, 35, 796, 490, 28);
          g.lineStyle(5, 0x17304b, .95); g.lineBetween(460, 184, 460, 401); g.lineBetween(405, 300, 515, 300); g.lineBetween(460, 184, 320, 246); g.lineBetween(460, 184, 600, 246); g.lineBetween(320, 354, 460, 401); g.lineBetween(600, 354, 460, 401);
          this.add.text(92, 58, 'PROCESSOR DIE / GUIDED ASSEMBLY', { fontFamily: 'monospace', fontSize: '13px', color: '#6f8fad', letterSpacing: 2 });
          slots.forEach((s, i) => { const b = this.add.rectangle(s.x, s.y, 270, 108, 0x111f33).setStrokeStyle(2, 0x3b5775); const n = this.add.text(s.x - 116, s.y - 39, `0${i + 1}`, { fontFamily: 'monospace', fontSize: '10px', color: '#6f8fad' }); const t = this.add.text(s.x, s.y - 25, i ? 'LOCKED' : 'ACTIVE SOCKET', { fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold', color: i ? '#496783' : '#f7c948' }).setOrigin(.5); const d = this.add.text(s.x, s.y + 16, C[s.key].clue, { fontFamily: 'Arial', fontSize: '12px', color: '#9fb2c4', align: 'center', wordWrap: { width: 226 } }).setOrigin(.5); this.boxes.set(s.key, b); this.titles.set(s.key, t); this.descriptions.set(s.key, d); this.numbers.set(s.key, n); this.baseXs.set(s.key, s.x); });
          this.paint(ORDER[0]);
          this.game.events.on('correct', (key: Key, next?: Key) => { this.boxes.get(key)?.setFillStyle(P.Display.Color.HexStringToColor(C[key].color).color, .95).setStrokeStyle(2, 0xffffff, .2); this.titles.get(key)?.setText(`✓ ${C[key].name.toUpperCase()}`).setColor('#07101c'); this.descriptions.get(key)?.setColor('#07101c'); this.numbers.get(key)?.setColor('#07101c'); if (next) this.paint(next); else this.cameras.main.flash(500, 85, 214, 190, false); });
          this.game.events.on('wrong', () => { const b = this.boxes.get(this.activeKey); const baseX = this.baseXs.get(this.activeKey) ?? b.x; this.tweens.killTweensOf(b); b.setX(baseX); this.tweens.add({ targets: b, x: baseX + 8, yoyo: true, repeat: 3, duration: 45, onComplete: () => b.setX(baseX) }); this.cameras.main.flash(120, 255, 80, 70, false); });
        }
        paint(key: Key) { this.activeKey = key; this.boxes.get(key)?.setStrokeStyle(4, 0xf7c948).setFillStyle(0x172a40); this.titles.get(key)?.setText('ACTIVE SOCKET').setColor('#f7c948'); }
      }
      game = new P.Game({ type: P.AUTO, parent: host.current, width: 920, height: 560, resolution: Math.min(window.devicePixelRatio || 1, 2), render: { antialias: true, roundPixels: true }, scene: Scene, scale: { mode: P.Scale.FIT, autoCenter: P.Scale.CENTER_BOTH } }) as Bridge; bridge.current = game;
    });
    return () => { active = false; game?.destroy(true); bridge.current = null; };
  }, []);

  function penalize(message: string, id: string) { setScore(v => { const next = Math.max(0, v - 100); if (next === 0) setFailed(true); return next; }); setWrong(id); setFeedback(`${message} −100 points.`); bridge.current?.events.emit('wrong'); }
  function acceptInput() { const now = performance.now(); if (now < inputReadyAt.current) return false; inputReadyAt.current = now + 350; return true; }
  function chooseComponent(key: Key) {
    if (!current || failed || !acceptInput()) return;
    if (key !== current) return penalize(`${C[key].name} ${C[key].role.toLowerCase()} Re-read the socket and try again.`, key);
    setScore(v => v + 250); setWrong(null); setInside(key); setPartStep(0); setFeedback(`${C[key].name} identified. Zooming inside—assemble its three internal systems.`);
  }
  function choosePart(index: number) {
    if (!inside || failed || !acceptInput()) return;
    const target = PARTS[inside][partStep]; const chosen = PARTS[inside][index];
    if (index !== partStep) return penalize(`${chosen.name} ${chosen.role}; it does not match this internal socket.`, `${inside}-${index}`);
    setScore(v => v + 150); setWrong(null); setFeedback(`${target.name} installed correctly—it ${target.role}.`);
    if (partStep < 2) setPartStep(v => v + 1);
    else { const next = step + 1; bridge.current?.events.emit('correct', inside, ORDER[next]); setInside(null); setPartStep(0); setStep(next); setFeedback(`${C[inside].name} fully assembled and installed in the processor.`); }
  }

  const options = inside ? PARTS[inside] : [];
  return <main className="game-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">μ</span><div><b>CPU ARCHITECT</b><span>BUILD • CONNECT • EXECUTE</span></div></div><div className="mission"><span>{inside ? 'COMPONENT LAB' : 'MISSION 01'}</span><b>{inside ? `Inside the ${C[inside].name}` : 'Assemble the Core'}</b></div><div className="score"><span>SCORE</span><b>{score.toString().padStart(4, '0')}</b></div></header>
    <section className="workbench guided"><aside className="intel-panel"><span className="eyebrow">{inside ? `INTERNAL PART ${partStep + 1} OF 3` : `INSTALLATION ${Math.min(step + 1, 4)} OF 4`}</span><h1>{complete ? 'Core online.' : inside ? `Build the ${C[inside].short}.` : 'Identify the component.'}</h1><p>{complete ? 'Every component and internal system is installed.' : inside ? 'Read the highlighted internal socket and choose the subcomponent that performs that job.' : 'Read the function shown in the highlighted socket. Choose the CPU component that performs that job.'}</p>
      {!complete && !inside && <div className="choices" role="group">{ORDER.map(k => <button key={k} className={wrong === k ? 'wrong' : ''} onClick={() => chooseComponent(k)}><span style={{ background: C[k].color }}>{C[k].short}</span><b>{C[k].name}</b><small>SELECT</small></button>)}</div>}
      {inside && <div className="choices internal-choices" role="group">{options.map((p, i) => <button key={p.name} className={wrong === `${inside}-${i}` ? 'wrong' : ''} onClick={() => choosePart(i)}><span style={{ background: C[inside].color }}>{p.short}</span><b>{p.name}</b><small>INSTALL</small></button>)}</div>}
      {complete && <div className="completion-card"><b>MISSION COMPLETE</b><span>Final score: {score}</span><button onClick={() => location.reload()}>REBUILD CORE</button><button onClick={() => setExploring(true)}>EXPLORE CORE</button></div>}
      <div className="progress-label"><span>{inside ? `${C[inside].short} ASSEMBLY` : 'CORE COMPLETION'}</span><b>{inside ? `${partStep}/3` : `${step}/4`}</b></div><div className="progress"><i style={{ width: `${inside ? partStep / 3 * 100 : step * 25}%`, background: inside ? C[inside].color : undefined }} /></div>
    </aside><section className="game-panel component-stage"><div ref={host} className="phaser-host"/>{inside && <div className="component-interior" style={{ '--component-color': C[inside].color } as React.CSSProperties}><span className="zoom-label">MICROSCOPIC VIEW • {C[inside].short}</span><h2>{C[inside].name}</h2><div className="internal-board">{PARTS[inside].map((p, i) => <div key={p.name} className={`internal-socket ${i < partStep ? 'installed' : i === partStep ? 'active' : 'locked'}`}><span>{i < partStep ? `✓ ${p.short}` : i === partStep ? 'ACTIVE SOCKET' : 'LOCKED'}</span><p>{p.clue}</p></div>)}</div></div>}{exploring && <div className="core-explorer"><header><div><span>POST-MISSION ANALYSIS</span><h2>Completed Processor Core</h2></div><button onClick={() => setExploring(false)} aria-label="Close core explorer">×</button></header><div className="explorer-die">{ORDER.map(key => <section key={key} className={`explore-component explore-${key}`} style={{ '--component-color': C[key].color } as React.CSSProperties} tabIndex={0} onMouseEnter={() => setExploreInfo({ title: C[key].name, text: C[key].role })} onFocus={() => setExploreInfo({ title: C[key].name, text: C[key].role })}><div className="component-heading"><span>{C[key].short}</span><b>{C[key].name}</b></div><div className="explore-parts">{PARTS[key].map(part => <button key={part.name} onMouseEnter={(event) => { event.stopPropagation(); setExploreInfo({ title: part.name, text: part.clue }); }} onFocus={() => setExploreInfo({ title: part.name, text: part.clue })}><small>{part.short}</small><b>{part.name}</b></button>)}</div></section>)}</div><output className="explore-readout" aria-live="polite"><span>COMPONENT DATA</span><div><b>{exploreInfo.title}</b><p>{exploreInfo.text}</p></div></output></div>}<div className={`feedback ${complete ? 'complete' : wrong ? 'error' : ''}`} aria-live="polite"><span>{complete ? 'CORE ONLINE' : wrong ? 'POINT PENALTY' : 'ARCHITECT LOG'}</span><p>{feedback}</p></div></section></section>
    <footer><span>CSC 3501 • COMPUTER ORGANIZATION & DESIGN</span><span>PHASER.JS PROTOTYPE</span></footer>
    {failed && <section className="failure-screen" role="alertdialog" aria-modal="true"><div className="sad-face">:(</div><h2>You failed!</h2><p>Your CPU ran into a problem and could not complete its assembly.</p><p className="failure-detail">SCORE_DEPLETED_TO_ZERO<br/>Stop code: INCORRECT_COMPONENT_SELECTION</p><div className="fake-progress">0% complete</div><button onClick={() => location.reload()}>Restart assembly</button></section>}
  </main>;
}
