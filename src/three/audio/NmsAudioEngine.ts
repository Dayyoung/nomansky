/**
 * Authentic No Man's Sky Real-Time Web Audio Synthesizer Engine
 * 100% procedural, zero external network downloads, zero latency.
 */
export class NmsAudioEngine {
  private static instance: NmsAudioEngine;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Active continuous looping nodes
  private miningLaserOsc: OscillatorNode | null = null;
  private miningLaserGain: GainNode | null = null;
  private jetpackGain: GainNode | null = null;
  private jetpackSource: AudioNode | null = null;

  public static getInstance(): NmsAudioEngine {
    if (!NmsAudioEngine.instance) {
      NmsAudioEngine.instance = new NmsAudioEngine();
    }
    return NmsAudioEngine.instance;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Iconic No Man's Sky Analysis Visor / Planetary Scanner Ping (C/F key)
   * Frequency sweeps from low rumble to crystalline high chime.
   */
  public playScannerPing() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(1250, t + 0.35);
    osc.frequency.setValueAtTime(880, t + 0.4);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.25);
  }

  /**
   * Pulse Drive (펄스 엔진) engagement sound
   */
  public playPulseDrive() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.55);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.6);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.85);
  }

  /**
   * Multi-Tool Mining Laser Continuous Sound (레이저 채굴 빔)
   */
  public setMiningLaser(active: boolean) {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    if (active) {
      if (this.miningLaserOsc) return; // Already running

      const t = this.ctx.currentTime;
      this.miningLaserOsc = this.ctx.createOscillator();
      this.miningLaserGain = this.ctx.createGain();

      this.miningLaserOsc.type = 'sawtooth';
      this.miningLaserOsc.frequency.setValueAtTime(380, t);

      // Lowpass tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(4.0, t);

      this.miningLaserGain.gain.setValueAtTime(0.001, t);
      this.miningLaserGain.gain.linearRampToValueAtTime(0.14, t + 0.05);

      this.miningLaserOsc.connect(filter);
      filter.connect(this.miningLaserGain);
      this.miningLaserGain.connect(this.ctx.destination);

      this.miningLaserOsc.start(t);
    } else {
      if (this.miningLaserOsc && this.miningLaserGain) {
        const t = this.ctx.currentTime;
        this.miningLaserGain.gain.linearRampToValueAtTime(0.0001, t + 0.08);
        try {
          this.miningLaserOsc.stop(t + 0.09);
        } catch {
          // Ignore
        }
        this.miningLaserOsc = null;
        this.miningLaserGain = null;
      }
    }
  }

  /**
   * Exosuit Jetpack Thruster Sound (부스터 화염음)
   */
  public setJetpack(active: boolean) {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    if (active) {
      if (this.jetpackSource) return;

      const t = this.ctx.currentTime;
      // White noise buffer for roaring jetpack
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      this.jetpackGain = this.ctx.createGain();
      this.jetpackGain.gain.setValueAtTime(0.001, t);
      this.jetpackGain.gain.linearRampToValueAtTime(0.18, t + 0.1);

      whiteNoise.connect(filter);
      filter.connect(this.jetpackGain);
      this.jetpackGain.connect(this.ctx.destination);

      whiteNoise.start(t);
      this.jetpackSource = whiteNoise;
    } else {
      if (this.jetpackSource && this.jetpackGain) {
        const t = this.ctx.currentTime;
        this.jetpackGain.gain.linearRampToValueAtTime(0.0001, t + 0.1);
        try {
          (this.jetpackSource as AudioScheduledSourceNode).stop(t + 0.11);
        } catch {
          // Ignore
        }
        this.jetpackSource = null;
        this.jetpackGain = null;
      }
    }
  }

  /**
   * Sentinel Alert Warning Chirp (센티넬 경계 경보음)
   */
  public playSentinelAlert() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.setValueAtTime(1760, t + 0.08);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  /**
   * Multi-Tool Boltcaster Plasma Burst Sound (볼트캐스터 플라즈마 연사음)
   */
  public playBoltcasterShot() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Procedural Alien Creature Vocalization / Chirp (외계 생명체 울음소리)
   */
  public playCreatureCall() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(480, t + 0.15);
    osc.frequency.linearRampToValueAtTime(320, t + 0.35);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.52);
  }

  /**
   * Space Station Docking Tractor Beam Resonance (우주 정거장 트랙터 빔 진입음)
   */
  public playSpaceStationEntry() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(340, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(180, t + 1.2);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 1.65);
  }

  /**
   * Discovery Fanfare (외계 지식 석판 / 생물 발견 팡파레)
   */
  public playDiscoveryFanfare() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  /**
   * Starship Twin Photon Cannon Laser Blast Sound (함선 광자포 쌍발 레이저 발사음)
   */
  public playPhotonCannon() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(820, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.14);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(2.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  /**
   * Planetary Atmospheric Re-entry Plasma Burn Rumble (행성 대기권 재돌입 플라즈마 화염 굉음)
   */
  public playAtmosphereBurn() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);
    filter.frequency.linearRampToValueAtTime(680, t + 0.5);
    filter.frequency.linearRampToValueAtTime(180, t + 1.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.45);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 1.5);
  }

  /**
   * Deflector Shield Impact Flare Sound (디플렉터 방어막 피격 분산음)
   */
  public playShieldHit() {
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.22);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  /**
   * No Man's Sky Robotic Exosuit Synthesizer Voice Alerts (슈트 음성 안내)
   */
  public playExosuitVoice(phrase: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.pitch = 0.85;
      utterance.rate = 1.05;
      utterance.volume = 0.65;
      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis not supported or blocked
    }
  }
}
