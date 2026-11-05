/**
 * Web Audio API Romantic Acoustic Synthesizer
 * 100% Procedural & Self-Contained (Zero external audio files needed)
 */

class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentStep = 0;
    this.timerId = null;
    this.tempo = 68; // Slow, romantic lullaby tempo

    // Pentatonic & Lydian chords: Fmaj9 -> G6 -> Em7 -> Am9 (Warm, loving progression)
    this.chords = [
      [174.61, 261.63, 329.63, 392.00, 523.25], // F3, C4, E4, G4, C5
      [196.00, 246.94, 293.66, 392.00, 493.88], // G3, B3, D4, G4, B4
      [164.81, 246.94, 329.63, 392.00, 493.88], // E3, B3, E4, G4, B4
      [220.00, 261.63, 329.63, 440.00, 523.25]  // A3, C4, E4, A4, C5
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMusic() {
    this.init();
    if (this.isPlaying) {
      this.stopMelody();
      return false;
    } else {
      this.startMelody();
      return true;
    }
  }

  startMelody() {
    this.isPlaying = true;
    this.currentStep = 0;
    const intervalMs = (60 / this.tempo / 2) * 1000;

    const playNext = () => {
      if (!this.isPlaying) return;
      const chordIndex = Math.floor((this.currentStep / 8) % this.chords.length);
      const chord = this.chords[chordIndex];
      const noteIndex = this.currentStep % chord.length;
      const freq = chord[noteIndex];

      this.playMusicBoxNote(freq, 1.2, 0.08);

      // On beat 1 of each measure, add warm bass root
      if (this.currentStep % 8 === 0) {
        this.playSoftBass(chord[0] / 2, 2.5, 0.12);
      }

      this.currentStep++;
      this.timerId = setTimeout(playNext, intervalMs);
    };

    playNext();
  }

  stopMelody() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Warm music box / Celesta note
   */
  playMusicBoxNote(freq, duration = 1.0, gainVal = 0.1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Subtle low-pass filtering for gentle acoustic warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Warm low bass note
   */
  playSoftBass(freq, duration = 2.0, gainVal = 0.1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Realistic Wax Seal Crack & Unsealing Sound Effect
   */
  playSealBreak() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Crunch noise for breaking wax
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);

    // 2. Gentle resonant snap
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

    oscGain.gain.setValueAtTime(0.18, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Soft paper sliding rustle
   */
  playPaperSlide() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(400, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  /**
   * Crystal chime sound for plucking sunflower petals
   */
  playPetalChime(index = 0) {
    this.init();
    if (!this.ctx) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5 to C6 pentatonic
    const freq = scale[index % scale.length];
    this.playMusicBoxNote(freq, 1.4, 0.15);
  }
}

// Global audio singleton
window.romanticAudio = new RomanticAudioEngine();
