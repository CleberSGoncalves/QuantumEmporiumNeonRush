// src/audio.js
// Procedural Web Audio API Synthesizer (Zero External Assets, Zero 404s)

class ProceduralAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isAdMuted = false;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isBgmPlaying = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    this._updateVolume();
  }

  setAdMuted(adMuted) {
    this.isAdMuted = !!adMuted;
    this._updateVolume();
  }

  _updateVolume() {
    if (!this.masterGain || !this.ctx) return;
    const vol = (this.isMuted || this.isAdMuted) ? 0.0001 : 0.35;
    try {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playOsc(type, startFreq, endFreq, duration, peakGain = 0.2, dest = null) {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, startFreq), now);
      if (endFreq && endFreq !== startFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + duration * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(dest || this.sfxGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {}
  }

  playNoise(duration, peakGain = 0.15) {
    if (this.isMuted || this.isAdMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {}
  }

  // FluidCleb Interactive Cosmic Chime
  playFluidClebIntro() {
    this.init();
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    const freqs = [330, 440, 554.37, 659.25, 880, 1318.5];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playOsc('sine', freq, freq * 1.02, 0.45, 0.18);
      }, idx * 110);
    });
    setTimeout(() => {
      this.playOsc('triangle', 880, 1760, 0.8, 0.25);
    }, 700);
  }

  // Item pickup from fabricator
  playPickup() {
    this.playOsc('sine', 480, 720, 0.08, 0.15);
  }

  // Restocking item onto shelf
  playRestock() {
    this.playOsc('triangle', 320, 640, 0.1, 0.18);
    setTimeout(() => {
      this.playOsc('sine', 640, 960, 0.09, 0.14);
    }, 40);
  }

  // Cash Register ring / Cha-ching
  playCashRegister() {
    this.init();
    if (!this.ctx || this.isMuted || this.isAdMuted) return;
    // Bell chime
    this.playOsc('sine', 1318.5, 1318.5, 0.25, 0.25);
    setTimeout(() => {
      this.playOsc('triangle', 1567.98, 1567.98, 0.35, 0.28);
    }, 80);
    setTimeout(() => {
      this.playOsc('sine', 2093.0, 2093.0, 0.45, 0.22);
      this.playNoise(0.09, 0.08); // Coin clink texture
    }, 160);
  }

  // Impatient or angry android leaving
  playAngryClient() {
    this.playOsc('sawtooth', 220, 110, 0.22, 0.2);
    setTimeout(() => {
      this.playOsc('sawtooth', 180, 90, 0.25, 0.18);
    }, 120);
  }

  // Purchase upgrade in shop
  playUpgrade() {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playOsc('sine', freq, freq * 1.05, 0.15, 0.18);
      }, idx * 60);
    });
  }

  // Milestone Star Chime
  playStarChime(starIdx = 1) {
    const root = starIdx === 1 ? 523.25 : starIdx === 2 ? 659.25 : 783.99;
    this.playOsc('triangle', root, root * 1.5, 0.3, 0.25);
    setTimeout(() => {
      this.playOsc('sine', root * 2, root * 2, 0.4, 0.22);
    }, 90);
  }

  // Victory Fanfare
  playVictory() {
    const sequence = [
      { f: 440, d: 0.15 },
      { f: 554, d: 0.15 },
      { f: 659, d: 0.15 },
      { f: 880, d: 0.45 },
      { f: 1108, d: 0.6 }
    ];
    let time = 0;
    sequence.forEach((s) => {
      setTimeout(() => {
        this.playOsc('triangle', s.f, s.f, s.d, 0.22);
      }, time);
      time += s.d * 800;
    });
  }

  // Player Dash
  playDash() {
    this.playOsc('sawtooth', 400, 120, 0.14, 0.15);
    this.playNoise(0.12, 0.1);
  }

  // Clean UI Click
  playClick() {
    this.playOsc('sine', 650, 400, 0.04, 0.1);
  }

  // Cyberpunk Adaptive BGM Engine
  startBgm() {
    if (this.isBgmPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    const tempo = 126; // Cyberpunk house/electro bpm
    const beatInterval = (60 / tempo) * 1000 / 2; // eighth note
    this.bgmStep = 0;

    // Bassline in A minor: A1 (55), C2 (65.4), D2 (73.4), E2 (82.4), G1 (49)
    const bassline = [
      55, 55, 55, 65.4, 55, 55, 73.4, 82.4,
      55, 55, 55, 65.4, 49, 49, 55, 55
    ];

    // Neon lead melody snippets (higher pentatonic)
    const melody = [
      440, 0, 523, 0, 587, 659, 0, 523,
      440, 0, 392, 0, 440, 0, 0, 0
    ];

    this.bgmTimer = setInterval(() => {
      if (this.isMuted || this.isAdMuted || !this.ctx) return;

      const step = this.bgmStep % 16;
      const bassFreq = bassline[step];
      const melodyFreq = melody[step];

      // Bass synth
      if (bassFreq) {
        this.playOsc('sawtooth', bassFreq, bassFreq * 0.98, 0.12, 0.12, this.bgmGain);
      }

      // Melodic neon arpeggio
      if (melodyFreq && step % 2 === 0) {
        this.playOsc('sine', melodyFreq, melodyFreq, 0.18, 0.07, this.bgmGain);
      }

      // Subtle percussive tick on beats
      if (step % 4 === 0) {
        this.playOsc('triangle', 90, 35, 0.06, 0.14, this.bgmGain); // Kick
      } else if (step % 4 === 2) {
        this.playNoise(0.04, 0.03); // Snare/HiHat tap
      }

      this.bgmStep++;
    }, beatInterval);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.isBgmPlaying = false;
  }
}

export const sound = new ProceduralAudio();
