export class SoundManager {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicTimer?: number;
  private currentTheme: "intro" | "gameover" | null = null;
  private unlocked = false;

  private ensureContext() {
    if (!this.unlocked) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.3;
      this.master.connect(this.ctx.destination);
    }
  }

  private resumeIfNeeded() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  unlock() {
    this.unlocked = true;
    this.ensureContext();
    this.resumeIfNeeded();
  }

  playShoot(owner: "player" | "enemy") {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) return;
    const freq = owner === "player" ? 720 : 500;
    const duration = 0.05;
    this.boop(freq, duration, "square", owner === "player" ? 0.2 : 0.16, false, 0.0015);
    this.boop(freq * 0.55, duration * 0.8, "triangle", 0.09, false, 0.004);
  }

  playExplosion() {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) return;
    this.boop(140, 0.28, "sawtooth", 0.4, true, 0.006);
  }

  playEnemyDestroyed() {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) return;
    this.boop(520, 0.1, "triangle", 0.18, false, 0.002);
    this.boop(392, 0.12, "square", 0.14, false, 0.002);
  }

  playPlayerDestroyed() {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) return;
    this.boop(160, 0.4, "sawtooth", 0.45, true, 0.01);
    this.boop(90, 0.45, "triangle", 0.25, false, 0);
  }

  playPause() {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) return;
    this.boop(440, 0.08, "sine", 0.15, false, 0);
  }

  startIntroTheme() {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) return;
    if (this.currentTheme === "intro") return;
    this.stopMusic();
    this.currentTheme = "intro";

    // Original mellow 80s-style melody (not a licensed tune).
    const bpm = 96;
    const beatMs = (60_000 / bpm);
    type Note = { f: number; beats: number };
    const lead: Note[] = [
      { f: 294, beats: 1 }, { f: 330, beats: 1 }, { f: 392, beats: 1 }, { f: 349, beats: 1 },
      { f: 330, beats: 2 }, { f: 262, beats: 1 },
      { f: 294, beats: 1 }, { f: 330, beats: 1 }, { f: 262, beats: 1 }, { f: 294, beats: 1 },
      { f: 247, beats: 2 },
      { f: 220, beats: 1 }, { f: 247, beats: 1 }, { f: 294, beats: 1 }, { f: 262, beats: 1 },
      { f: 220, beats: 2 },
      { f: 294, beats: 1 }, { f: 330, beats: 1 }, { f: 392, beats: 1 }, { f: 440, beats: 1 },
      { f: 392, beats: 2 },
      { f: 349, beats: 1 }, { f: 330, beats: 1 }, { f: 294, beats: 1 }, { f: 262, beats: 1 },
      { f: 247, beats: 2 },
    ];
    const bass: Note[] = [
      { f: 110, beats: 2 }, { f: 123, beats: 2 }, { f: 98, beats: 2 }, { f: 82, beats: 2 },
      { f: 110, beats: 2 }, { f: 98, beats: 2 }, { f: 82, beats: 2 }, { f: 73, beats: 2 },
    ];
    let leadIdx = 0;
    let bassIdx = 0;

    const playNote = (note: Note, vol: number, type: OscillatorType) => {
      if (!this.ctx || !this.master) return;
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = note.f;
      const gain = this.ctx.createGain();
      gain.gain.value = vol;
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + (note.beats * beatMs) / 1000);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start();
      osc.stop(now + (note.beats * beatMs) / 1000);
    };

    this.musicTimer = window.setInterval(() => {
      playNote(lead[leadIdx % lead.length], 0.12, "triangle");
      if (leadIdx % 2 === 0) {
        playNote(bass[bassIdx % bass.length], 0.1, "square");
        bassIdx++;
      }
      leadIdx++;
    }, beatMs);
  }

  startGameOverTheme() {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) return;
    if (this.currentTheme === "gameover") return;
    this.stopMusic();
    this.currentTheme = "gameover";

    const bpm = 72;
    const beatMs = 60_000 / bpm;
    type Note = { f: number; beats: number };
    const motif: Note[] = [
      { f: 262, beats: 1 }, { f: 247, beats: 1 }, { f: 233, beats: 1 }, { f: 220, beats: 2 },
      { f: 196, beats: 1 }, { f: 174, beats: 1 }, { f: 165, beats: 1 }, { f: 147, beats: 2 },
    ];
    let idx = 0;
    const playNote = (note: Note, vol: number, type: OscillatorType) => {
      if (!this.ctx || !this.master) return;
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = note.f;
      const gain = this.ctx.createGain();
      gain.gain.value = vol;
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.linearRampToValueAtTime(0.0001, now + (note.beats * beatMs) / 1000);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start();
      osc.stop(now + (note.beats * beatMs) / 1000);
    };

    this.musicTimer = window.setInterval(() => {
      playNote(motif[idx % motif.length], 0.12, "sine");
      idx++;
    }, beatMs);
  }

  stopMusic() {
    if (this.musicTimer !== undefined) {
      clearInterval(this.musicTimer);
      this.musicTimer = undefined;
    }
    this.currentTheme = null;
    // Passive one-shots auto-stop; nothing persistent to clear beyond timer.
  }

  private boop(freq: number, duration: number, type: OscillatorType, volume: number, noise: boolean = false, glide: number = 0) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    if (glide > 0) {
      osc.frequency.linearRampToValueAtTime(freq * 0.92, this.ctx.currentTime + glide);
    }
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    const decay = 0.12;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration + decay);

    osc.connect(gain);
    gain.connect(this.master);

    osc.start();
    osc.stop(this.ctx.currentTime + duration + decay);
  }
}
