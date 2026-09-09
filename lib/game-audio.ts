let context: AudioContext | null = null;
let failureAudio: HTMLAudioElement | null = null;

function audio() {
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(frequency: number, duration: number, volume = .035, type: OscillatorType = 'sine', delay = 0, endFrequency = frequency) {
  const ctx = audio();
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

export function playSound(sound: 'click' | 'hover-in' | 'failure' | 'success') {
  if (sound === 'click') tone(1250, .045, .025, 'square', 0, 850);
  if (sound === 'hover-in') tone(330, .09, .012, 'sine', 0, 620);
  if (sound === 'failure') {
    failureAudio ??= new Audio(new URL('sounds/windows-xp-error.mp3', document.baseURI).href);
    failureAudio.currentTime = 0;
    void failureAudio.play().catch(() => {
      tone(220, .22, .05, 'square', 0, 180);
      tone(165, .34, .045, 'sawtooth', .16, 82);
    });
  }
  if (sound === 'success') {
    tone(523.25, .42, .045, 'sine');
    tone(659.25, .45, .04, 'sine', .12);
    tone(783.99, .7, .045, 'sine', .25);
    tone(1046.5, .8, .025, 'sine', .38);
  }
}
