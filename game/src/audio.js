export class AudioEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.musicOn = true;
    this.musicTimer = null;
    this.step = 0;
    this.sizzle = null;
  }

  unlock() {
    if (this.context) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.42;
      this.master.connect(this.context.destination);
      if (this.musicOn) this.startMusic();
    } catch {
      this.context = null;
    }
  }

  tone(frequency, duration, type = 'sine', volume = 0.18, delay = 0, slide = 0) {
    if (!this.context || !this.master) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(slide, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  noise(duration = 0.06, volume = 0.12) {
    if (!this.context || !this.master) return;
    const length = Math.floor(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.master);
    source.start();
  }

  pickup() { this.tone(580, 0.09, 'sine', 0.2, 0, 820); }
  place() { this.noise(0.06, 0.14); this.tone(230, 0.08, 'triangle', 0.14, 0, 165); }
  chop() { this.noise(0.05, 0.2); this.tone(145, 0.06, 'square', 0.1, 0, 95); }
  chopDone() { this.tone(660, 0.1); this.tone(990, 0.13, 'triangle', 0.14, 0.08); }
  cookDone() { this.tone(880, 0.12); this.tone(1174, 0.16, 'sine', 0.16, 0.1); }
  ding() { this.tone(1318, 0.28, 'sine', 0.22); this.tone(1760, 0.32, 'sine', 0.16, 0.05); }
  coin() { this.tone(988, 0.07, 'square', 0.1); this.tone(1319, 0.18, 'square', 0.1, 0.06); }
  error() { this.tone(175, 0.2, 'sawtooth', 0.15, 0, 110); }
  burn() { this.tone(440, 0.16, 'square', 0.16, 0, 330); }
  heartLost() { this.tone(392, 0.22, 'triangle', 0.17, 0, 196); }
  rush() { this.tone(523, 0.11, 'square', 0.14); this.tone(659, 0.11, 'square', 0.14, 0.11); this.tone(784, 0.18, 'square', 0.16, 0.22); }

  setSizzle(on) {
    if (!this.context || on === Boolean(this.sizzle)) return;
    if (!on) {
      try { this.sizzle.stop(); } catch {}
      this.sizzle = null;
      return;
    }
    const length = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'highpass';
    filter.frequency.value = 2800;
    gain.gain.value = 0.025;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();
    this.sizzle = source;
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;
    if (this.musicOn) this.startMusic();
    else if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
    return this.musicOn;
  }

  startMusic() {
    if (this.musicTimer || !this.context || !this.musicOn) return;
    const melody = [523, 659, 784, 880, 784, 659, 587, 659, 698, 784, 880, 1047, 880, 784, 659, 587];
    this.musicTimer = setInterval(() => {
      if (!this.context || !this.musicOn) return;
      const note = melody[this.step % melody.length];
      this.tone(note, 0.28, 'triangle', 0.035);
      if (this.step % 4 === 0) this.tone(note / 4, 0.5, 'sine', 0.05);
      this.step++;
    }, 220);
  }
}
