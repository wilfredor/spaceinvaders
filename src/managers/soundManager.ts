export class SoundManager {
  private ctx?: AudioContext;
  private master?: GainNode;
  private musicTimer?: number;
  private currentTheme: "intro" | "gameover" | null = null;
  private unlocked = false;
  private suspendedFallbackSet = false;
  private pendingIntro = false;
  private audioBuffer?: AudioBuffer;
  private musicSource?: AudioBufferSourceNode;

  private ensureContext() {
    if (!this.unlocked) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
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
    if (this.ctx) {
      this.ctx.resume().catch(() => {
        // Some browsers need a user gesture; rely on the fallback listeners.
        if (!this.suspendedFallbackSet) {
          this.suspendedFallbackSet = true;
          const resume = () => {
            this.ctx?.resume();
            window.removeEventListener("pointerdown", resume);
            window.removeEventListener("touchstart", resume);
            window.removeEventListener("keydown", resume);
          };
          window.addEventListener("pointerdown", resume, { once: true, passive: true });
          window.addEventListener("touchstart", resume, { once: true, passive: true });
          window.addEventListener("keydown", resume, { once: true });
        }
      });
    }
    if (this.pendingIntro) {
      this.pendingIntro = false;
      this.startIntroTheme();
    }
  }

  private async loadMusicBuffer(url: string) {
    this.ensureContext();
    if (!this.ctx) return;
    if (this.audioBuffer) return;
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    this.audioBuffer = await this.ctx.decodeAudioData(arr);
  }

  private playMusicBuffer(loop: boolean = true) {
    if (!this.ctx || !this.master || !this.audioBuffer) return;
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource.disconnect();
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.audioBuffer;
    src.loop = loop;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.35;
    src.connect(gain);
    gain.connect(this.master);
    src.start();
    this.musicSource = src;
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

  async startIntroTheme() {
    this.ensureContext();
    this.resumeIfNeeded();
    if (!this.ctx) {
      this.pendingIntro = true;
      return;
    }
    if (this.currentTheme === "intro") return;
    this.stopMusic();
    this.currentTheme = "intro";

    try {
      await this.loadMusicBuffer("/assets/music.mp3");
      this.playMusicBuffer(true);
      return;
    } catch (e) {
      console.warn("Falling back to synth theme:", e);
    }

    const bpm = 92;
    const beatMs = 60_000 / bpm;
    type Note = { f: number; beats: number };
    // Original multi-voice piece inspired by Baroque counterpoint (no external melody used).
    const soprano: Note[] = [
      { f: 392.0, beats: 1 }, { f: 440.0, beats: 1 }, { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 },
      { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 },
      { f: 494.0, beats: 2 },
      { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 }, { f: 698.5, beats: 1 },
      { f: 740.0, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 },
      { f: 494.0, beats: 2 },
      { f: 440.0, beats: 1 }, { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 },
      { f: 659.3, beats: 1 }, { f: 698.5, beats: 1 }, { f: 659.3, beats: 1 }, { f: 587.3, beats: 1 },
      { f: 523.3, beats: 2 },
      { f: 494.0, beats: 1 }, { f: 523.3, beats: 1 }, { f: 587.3, beats: 1 }, { f: 659.3, beats: 1 },
      { f: 587.3, beats: 1 }, { f: 523.3, beats: 1 }, { f: 494.0, beats: 1 }, { f: 440.0, beats: 1 },
      { f: 392.0, beats: 2 },
    ];
    const alto: Note[] = [
      { f: 261.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 329.6, beats: 2 }, { f: 349.2, beats: 2 },
      { f: 392.0, beats: 2 }, { f: 440.0, beats: 2 }, { f: 392.0, beats: 2 }, { f: 349.2, beats: 2 },
      { f: 329.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 261.6, beats: 2 }, { f: 246.9, beats: 2 },
      { f: 261.6, beats: 2 }, { f: 293.7, beats: 2 }, { f: 329.6, beats: 2 }, { f: 349.2, beats: 2 },
      { f: 392.0, beats: 2 }, { f: 349.2, beats: 2 }, { f: 329.6, beats: 2 }, { f: 293.7, beats: 2 },
    ];
    const bass: Note[] = [
      { f: 130.8, beats: 2 }, { f: 146.8, beats: 2 }, { f: 164.8, beats: 2 }, { f: 174.6, beats: 2 },
      { f: 196.0, beats: 2 }, { f: 174.6, beats: 2 }, { f: 164.8, beats: 2 }, { f: 146.8, beats: 2 },
      { f: 130.8, beats: 2 }, { f: 123.5, beats: 2 }, { f: 110.0, beats: 2 }, { f: 98.0, beats: 2 },
      { f: 110.0, beats: 2 }, { f: 123.5, beats: 2 }, { f: 130.8, beats: 2 }, { f: 146.8, beats: 2 },
      { f: 164.8, beats: 2 }, { f: 146.8, beats: 2 }, { f: 130.8, beats: 2 }, { f: 110.0, beats: 2 },
    ];
    const progression: number[][][] = [
      [
        [392.0, 494.0, 587.3],   // G
        [293.7, 369.9, 440.0],   // D
        [329.6, 392.0, 493.9],   // Em
        [261.6, 329.6, 392.0],   // C
      ],
      [
        [293.7, 349.2, 440.0],   // D
        [329.6, 415.3, 493.9],   // E7ish
        [220.0, 261.6, 329.6],   // Am
        [293.7, 369.9, 440.0],   // D
      ],
      [
        [261.6, 329.6, 415.3],   // Cmaj7
        [246.9, 311.1, 392.0],   // Bdim-ish
        [293.7, 349.2, 440.0],   // D
        [329.6, 392.0, 493.9],   // Em
      ],
    ];
    let sopIdx = 0;
    let altoIdx = 0;
    let bassIdx = 0;
    let chordIdx = 0;
    let blockIdx = 0;

    const playVoice = (note: Note, vol: number, type: OscillatorType, detune: number = 0) => {
      if (!this.ctx || !this.master) return;
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = note.f;
      osc.detune.value = detune;
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      const durSec = (note.beats * beatMs) / 1000;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.linearRampToValueAtTime(vol * 0.65, now + durSec * 0.6);
      gain.gain.linearRampToValueAtTime(0.0001, now + durSec);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start();
      osc.stop(now + durSec + 0.05);
    };

    this.musicTimer = window.setInterval(() => {
      playVoice(soprano[sopIdx % soprano.length], 0.18, "triangle");
      playVoice(soprano[sopIdx % soprano.length], 0.06, "sawtooth", 6); // light shimmer

      if (sopIdx % 2 === 0) {
        playVoice(alto[altoIdx % alto.length], 0.12, "sine");
        playVoice(bass[bassIdx % bass.length], 0.1, "sawtooth");
        altoIdx++;
        bassIdx++;
      }
      if (sopIdx % 4 === 0) {
        const block = progression[blockIdx % progression.length];
        const chord = block[chordIdx % block.length];
        chord.forEach((f, i) =>
          playVoice({ f, beats: 2 }, 0.07 - i * 0.01, "triangle", i === 0 ? -4 : i === 2 ? 4 : 0)
        );
        chordIdx++;
        if (chordIdx % block.length === 0) {
          blockIdx++;
        }
      }
      sopIdx++;
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
