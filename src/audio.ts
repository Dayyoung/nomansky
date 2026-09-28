// Web Audio API Synthesizer with Mobile Touch Unlock

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    }
  }

  public unlockOnFirstInteraction() {
    this.init();
    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
  }

  public playNote(freq: number, type: OscillatorType, duration: number, vol = 0.25) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }

  public playScanPulse() {
    this.init();
    this.playNote(260, 'sine', 0.6, 0.35);
    setTimeout(() => this.playNote(520, 'sine', 0.8, 0.25), 120);
    this.vibrate(20);
  }

  public playMineBeam() {
    this.playNote(120 + Math.random() * 40, 'sawtooth', 0.08, 0.12);
  }

  public playBoltcaster() {
    this.playNote(380 + Math.random() * 60, 'sawtooth', 0.1, 0.3);
    this.vibrate(15);
  }

  public playTerrainDig() {
    this.playNote(75 + Math.random() * 25, 'square', 0.09, 0.18);
  }

  public playPulseDrive() {
    this.playNote(180, 'sine', 0.2, 0.3);
  }

  public playOverheat() {
    this.playNote(180, 'square', 0.25, 0.3);
    this.vibrate([30, 40, 30]);
  }

  public playJetpack() {
    this.playNote(90, 'triangle', 0.09, 0.16);
  }

  public playRecharge() {
    this.playNote(400, 'sine', 0.1, 0.25);
    setTimeout(() => this.playNote(620, 'sine', 0.18, 0.25), 70);
    this.vibrate(18);
  }

  public playWarning() {
    this.playNote(700, 'square', 0.14, 0.3);
    setTimeout(() => this.playNote(500, 'square', 0.18, 0.3), 140);
    this.vibrate([40, 60, 40]);
  }

  public playPhotonCannon() {
    this.playNote(480, 'sawtooth', 0.08, 0.3);
    setTimeout(() => this.playNote(220, 'sine', 0.06, 0.2), 20);
    this.vibrate(12);
  }

  public playDiscoveryFanfare() {
    const notes = [392, 523, 659, 784, 1046];
    notes.forEach((f, i) => {
      setTimeout(() => this.playNote(f, 'triangle', 0.3, 0.32), i * 80);
    });
    this.vibrate([20, 30, 40]);
  }

  public playPirateAlert() {
    this.playNote(620, 'sawtooth', 0.2, 0.35);
    setTimeout(() => this.playNote(440, 'sawtooth', 0.22, 0.35), 160);
    this.vibrate([50, 50, 50]);
  }

  public playWarp() {
    this.playNote(80, 'sawtooth', 2.2, 0.4);
    setTimeout(() => this.playNote(140, 'square', 1.8, 0.3), 260);
    setTimeout(() => this.playNote(320, 'sine', 1.4, 0.25), 700);
    this.vibrate([30, 40, 60, 40]);
  }

  public playExplosion() {
    this.playNote(60, 'sawtooth', 0.4, 0.45);
    this.vibrate([40, 30, 60]);
  }

  public playFishingBite() {
    [660, 880, 1100].forEach((f, i) => {
      setTimeout(() => this.playNote(f, 'sine', 0.08, 0.35), i * 50);
    });
    this.vibrate([30, 30, 40]);
  }

  public playReelClick() {
    this.playNote(520, 'sawtooth', 0.03, 0.15);
  }

  public playHarmonicChime() {
    [523.25, 622.25, 783.99, 932.33].forEach((f, i) => {
      setTimeout(() => this.playNote(f, 'sine', 0.3, 0.25), i * 85);
    });
  }

  public playVoltaicStaff() {
    this.playNote(220 + Math.random() * 260, 'sawtooth', 0.06, 0.2);
  }

  public playSentinelCannon() {
    this.playNote(160, 'sawtooth', 0.1, 0.35);
    setTimeout(() => this.playNote(320, 'square', 0.12, 0.3), 20);
    this.vibrate(15);
  }

  public playBlackHoleTransit() {
    [80, 110, 150, 220, 330, 440, 660].forEach((f, i) => {
      setTimeout(() => this.playNote(f, 'sawtooth', 0.22, 0.3), i * 75);
    });
    setTimeout(() => this.playNote(55, 'triangle', 1.0, 0.45), 550);
    this.vibrate([40, 50, 70]);
  }

  public vibrate(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  }
}

export const AudioSys = new SoundSystem();
