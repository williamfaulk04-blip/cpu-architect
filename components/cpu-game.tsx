'use client';
import { useEffect, useRef, useState } from 'react';
type ComponentKey = 'alu' | 'control' | 'registers' | 'cache';
const COMPONENTS: Record<ComponentKey, { name: string; short: string; role: string; color: string }> = {
  alu: { name: 'Arithmetic Logic Unit', short: 'ALU', role: 'Performs arithmetic and logical operations.', color: '#f7c948' },
  control: { name: 'Control Unit', short: 'CU', role: 'Decodes instructions and directs the datapath.', color: '#ff7a59' },
  registers: { name: 'Register File', short: 'REG', role: 'Stores the CPU’s fastest working values.', color: '#55d6be' },
  cache: { name: 'L1 Cache', short: 'L1', role: 'Keeps frequently used data close to the CPU.', color: '#6da7ff' },
};
export default function CpuGame() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0); const [placed, setPlaced] = useState(0);
  const [feedback, setFeedback] = useState('Drag a component into its matching socket.');
  const [selected, setSelected] = useState<ComponentKey>('alu');
  useEffect(() => {
    if (!hostRef.current) return; let game: { destroy: (removeCanvas?: boolean) => void } | undefined; let active = true;
    import('phaser').then((Phaser) => {
      if (!active || !hostRef.current) return;
      const slots = [{ key:'control' as const,x:525,y:120 },{ key:'registers' as const,x:360,y:260 },{ key:'alu' as const,x:690,y:260 },{ key:'cache' as const,x:525,y:405 }];
      const tray = [{key:'alu' as const,y:105},{key:'control' as const,y:215},{key:'registers' as const,y:325},{key:'cache' as const,y:435}];
      class ArchitectScene extends Phaser.Scene {
        completed = new Set<ComponentKey>();
        create() {
          this.cameras.main.setBackgroundColor('#08111f'); const g=this.add.graphics();
          g.fillStyle(0x0d1b2d,1).fillRoundedRect(245,36,630,488,26); g.lineStyle(2,0x29425f,1).strokeRoundedRect(245,36,630,488,26);
          g.lineStyle(5,0x17304b,.9); g.lineBetween(525,150,525,375); g.lineBetween(400,260,650,260); g.lineBetween(525,150,360,230); g.lineBetween(525,150,690,230); g.lineBetween(360,290,525,375); g.lineBetween(690,290,525,375);
          this.add.text(36,36,'COMPONENT BAY',{fontFamily:'monospace',fontSize:'15px',color:'#7e9bb8',letterSpacing:2}); this.add.text(270,56,'PROCESSOR DIE',{fontFamily:'monospace',fontSize:'14px',color:'#6f8fad',letterSpacing:2});
          slots.forEach(slot=>{ this.add.rectangle(slot.x,slot.y,174,82,0x111f33).setStrokeStyle(2,0x3b5775); this.add.text(slot.x,slot.y-2,'DROP HERE',{fontFamily:'monospace',fontSize:'14px',color:'#496783'}).setOrigin(.5); this.add.text(slot.x,slot.y+25,COMPONENTS[slot.key].short,{fontFamily:'monospace',fontSize:'11px',color:'#324e68'}).setOrigin(.5); });
          tray.forEach(item=>{ const data=COMPONENTS[item.key]; const card=this.add.container(120,item.y); const shadow=this.add.rectangle(4,5,176,78,0x000000,.3); const body=this.add.rectangle(0,0,176,78,Phaser.Display.Color.HexStringToColor(data.color).color,1).setStrokeStyle(2,0xffffff,.18); const label=this.add.text(-68,-15,data.short,{fontFamily:'monospace',fontSize:'25px',fontStyle:'bold',color:'#07101c'}); const name=this.add.text(-68,18,data.name.toUpperCase(),{fontFamily:'monospace',fontSize:'9px',color:'#172337'}); card.add([shadow,body,label,name]).setSize(176,78).setInteractive({draggable:true,useHandCursor:true}); card.setData({key:item.key,homeX:120,homeY:item.y}); card.on('pointerdown',()=>{setSelected(item.key);setFeedback(data.role)}); this.input.setDraggable(card);
            this.input.on('drag',(_p:unknown,obj:typeof card,x:number,y:number)=>{if(obj===card)obj.setPosition(x,y)});
            this.input.on('dragend',(_p:unknown,obj:typeof card)=>{ if(obj!==card||this.completed.has(item.key))return; const target=slots.find(s=>Phaser.Math.Distance.Between(obj.x,obj.y,s.x,s.y)<90); if(target?.key===item.key){obj.setPosition(target.x,target.y).disableInteractive();label.setText(`✓ ${data.short}`);this.completed.add(item.key);setScore(v=>v+250);setPlaced(this.completed.size);setFeedback(`${data.name} installed: ${data.role}`);this.tweens.add({targets:card,scale:{from:1.08,to:1},duration:240,ease:'Back.Out'});}else{setScore(v=>Math.max(0,v-25));setFeedback(target?`Not quite. ${data.short} does not belong in the ${COMPONENTS[target.key].short} socket.`:'Place the component inside one of the processor sockets.');this.tweens.add({targets:card,x:card.getData('homeX'),y:card.getData('homeY'),duration:320,ease:'Power2'});}});
          });
        }
      }
      game=new Phaser.Game({type:Phaser.AUTO,parent:hostRef.current,width:920,height:560,backgroundColor:'#08111f',scene:ArchitectScene,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH}});
    }); return()=>{active=false;game?.destroy(true)};
  },[]);
  return <main className="game-shell"><header className="topbar"><div className="brand"><span className="brand-mark">μ</span><div><b>CPU ARCHITECT</b><span>BUILD • CONNECT • EXECUTE</span></div></div><div className="mission"><span>MISSION 01</span><b>Assemble the Core</b></div><div className="score"><span>SCORE</span><b>{score.toString().padStart(4,'0')}</b></div></header><section className="workbench"><aside className="intel-panel"><span className="eyebrow">SYSTEM BRIEF</span><h1>Bring the processor online.</h1><p>Install each component in the correct place on the processor die. Every part has a distinct job in the datapath.</p><ol><li><span>1</span>Drag a module from the component bay.</li><li><span>2</span>Match it to the labeled socket.</li><li><span>3</span>Learn why the placement works.</li></ol><div className="lesson-card"><span style={{background:COMPONENTS[selected].color}}>{COMPONENTS[selected].short}</span><div><b>{COMPONENTS[selected].name}</b><p>{COMPONENTS[selected].role}</p></div></div><div className="progress-label"><span>CORE COMPLETION</span><b>{placed}/4</b></div><div className="progress"><i style={{width:`${placed*25}%`}}/></div></aside><section className="game-panel"><div ref={hostRef} className="phaser-host" aria-label="Interactive CPU component placement game"/><div className={`feedback ${placed===4?'complete':''}`} aria-live="polite"><span>{placed===4?'CORE ONLINE':'ARCHITECT LOG'}</span><p>{placed===4?'Processor assembly complete. All four components are correctly positioned.':feedback}</p></div></section></section><footer><span>CSC 3501 • COMPUTER ORGANIZATION & DESIGN</span><span>PHASER.JS PROTOTYPE</span></footer></main>;
}
