import * as THREE from 'three';

export type NmsGraphicsPreset = 'WORLDS_ULTRA' | 'ATLAS_VIVID' | 'STANDARD';

export class ThreeRenderer {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemiLight: THREE.HemisphereLight;
  public starfield: THREE.Points | null = null;
  public nebulaGroup: THREE.Group;
  public skyDomeMesh: THREE.Mesh | null = null;
  private skyDomeMat: THREE.ShaderMaterial | null = null;
  public graphicsPreset: NmsGraphicsPreset = 'WORLDS_ULTRA';

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.75;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03050d);
    // Ensure no studio IBL environment map causes harsh sunlight specular glare
    this.scene.environment = null;

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      65000
    );
    this.camera.position.set(0, 12, 30);

    // Calm, eye-friendly ambient & hemisphere fill lighting
    this.ambientLight = new THREE.AmbientLight(0x64748b, 0.55);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0x64748b, 0x0f172a, 0.35);
    this.hemiLight.position.set(0, 300, 0);
    this.scene.add(this.hemiLight);

    // Soft Directional Light (No harsh sunlight glare)
    this.sunLight = new THREE.DirectionalLight(0xcbd5e1, 0.72);
    this.sunLight.position.set(600, 900, 500);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 2500;
    const d = 180;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Subtle Fill Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.25);
    rimLight.position.set(-500, -300, -400);
    this.scene.add(rimLight);

    this.nebulaGroup = new THREE.Group();
    this.scene.add(this.nebulaGroup);

    this.initStarfieldAndNebula();
    this.initAtmosphericSkyDome();
  }

  /**
   * Switches between NMS Graphics Presets without harsh sunlight glare
   */
  public setGraphicsPreset(preset: NmsGraphicsPreset) {
    this.graphicsPreset = preset;
    if (preset === 'WORLDS_ULTRA') {
      this.renderer.toneMappingExposure = 0.75;
      this.sunLight.intensity = 0.72;
      this.hemiLight.intensity = 0.35;
    } else if (preset === 'ATLAS_VIVID') {
      this.renderer.toneMappingExposure = 0.85;
      this.sunLight.intensity = 0.85;
      this.hemiLight.intensity = 0.42;
    } else {
      this.renderer.toneMappingExposure = 0.68;
      this.sunLight.intensity = 0.60;
      this.hemiLight.intensity = 0.30;
    }
  }

  public cycleGraphicsPreset(): NmsGraphicsPreset {
    const order: NmsGraphicsPreset[] = ['WORLDS_ULTRA', 'ATLAS_VIVID', 'STANDARD'];
    const nextIdx = (order.indexOf(this.graphicsPreset) + 1) % order.length;
    const nextPreset = order[nextIdx];
    this.setGraphicsPreset(nextPreset);
    return nextPreset;
  }

  private createRadialGlowTexture(size = 128, innerStop = 0.15): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const half = size / 2;
    const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(innerStop, 'rgba(255, 255, 255, 0.55)');
    grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.12)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private initStarfieldAndNebula() {
    const starCount = 5000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color(0xdbeafe),
      new THREE.Color(0x93c5fd),
      new THREE.Color(0xfde68a),
      new THREE.Color(0xfda4af),
      new THREE.Color(0x67e8f9),
      new THREE.Color(0xc4b5fd),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 4500 + Math.random() * 14000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = starPalette[Math.floor(Math.random() * starPalette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starSpriteTex = this.createRadialGlowTexture(64, 0.2);

    const mat = new THREE.PointsMaterial({
      size: 20,
      map: starSpriteTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      alphaTest: 0.01,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);

    // Subtle deep-space nebula clouds
    const nebulaCloudTex = this.createRadialGlowTexture(256, 0.05);
    const nebulaColors = [
      0x0369a1,
      0x4c1d95,
      0x831843,
      0x115e59,
      0x7c2d12,
      0x1e3a8a,
    ];
    for (let i = 0; i < 16; i++) {
      const spriteMat = new THREE.SpriteMaterial({
        map: nebulaCloudTex,
        color: nebulaColors[i % nebulaColors.length],
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const dist = 5500 + Math.random() * 6000;
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const elev = (Math.random() - 0.5) * 3600;
      sprite.position.set(
        Math.cos(angle) * dist,
        elev,
        Math.sin(angle) * dist
      );
      const scale = 2800 + Math.random() * 2000;
      sprite.scale.set(scale, scale * (0.65 + Math.random() * 0.45), 1);
      this.nebulaGroup.add(sprite);
    }
  }

  /**
   * Planetary atmospheric sky dome with zero sun hotspot glare
   */
  private initAtmosphericSkyDome() {
    const skyGeo = new THREE.SphereGeometry(2800, 48, 32);
    this.skyDomeMat = new THREE.ShaderMaterial({
      uniforms: {
        uZenithColor: { value: new THREE.Color(0x050d1a) },
        uHorizonColor: { value: new THREE.Color(0x122b47) },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        varying vec3 vWorldPos;
        void main() {
          vec3 dir = normalize(vWorldPos - cameraPosition);
          float y = clamp(dir.y, 0.0, 1.0);
          float horizonFactor = pow(1.0 - y, 3.0);
          vec3 col = mix(uZenithColor, uHorizonColor, horizonFactor);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyDomeMesh = new THREE.Mesh(skyGeo, this.skyDomeMat);
    this.skyDomeMesh.visible = false;
    this.scene.add(this.skyDomeMesh);
  }

  public setAtmosphereFog(colorHex: string | number | null, density = 0.0022) {
    if (colorHex === null) {
      this.scene.fog = null;
      this.scene.background = new THREE.Color(0x03050d);
      if (this.skyDomeMesh) this.skyDomeMesh.visible = false;
      if (this.starfield) (this.starfield.material as THREE.PointsMaterial).opacity = 0.72;
      this.nebulaGroup.visible = true;
    } else {
      const baseCol = new THREE.Color(colorHex);
      const horizonCol = baseCol.clone().multiplyScalar(0.32);
      const zenithCol = baseCol.clone().multiplyScalar(0.09);

      this.scene.fog = new THREE.FogExp2(horizonCol, density * 0.45);
      this.scene.background = zenithCol;

      if (this.skyDomeMesh && this.skyDomeMat) {
        this.skyDomeMat.uniforms.uHorizonColor.value.copy(horizonCol);
        this.skyDomeMat.uniforms.uZenithColor.value.copy(zenithCol);
        this.skyDomeMesh.position.copy(this.camera.position);
        this.skyDomeMesh.visible = true;
      }
      if (this.starfield) (this.starfield.material as THREE.PointsMaterial).opacity = 0.35;
      this.nebulaGroup.visible = false;
    }
  }

  public resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public render() {
    if (this.skyDomeMesh && this.skyDomeMesh.visible) {
      this.skyDomeMesh.position.copy(this.camera.position);
    }
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
