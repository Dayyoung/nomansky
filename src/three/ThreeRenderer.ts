import * as THREE from 'three';

export class ThreeRenderer {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public starfield: THREE.Points;
  public nebulae: THREE.Points;
  public sunMesh: THREE.Mesh;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    // 1. Perspective Camera with interstellar depth range
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.2, 35000);
    this.camera.position.set(0, 15, 35);

    // 2. High-Fidelity WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 3. Deep Space Lighting
    this.ambientLight = new THREE.AmbientLight(0x1a2634, 0.6);
    this.scene.add(this.ambientLight);

    // Primary Solar Directional Light
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    this.sunLight.position.set(2500, 1800, 1500);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 8000;
    const shadowD = 600;
    this.sunLight.shadow.camera.left = -shadowD;
    this.sunLight.shadow.camera.right = shadowD;
    this.sunLight.shadow.camera.top = shadowD;
    this.sunLight.shadow.camera.bottom = -shadowD;
    this.scene.add(this.sunLight);

    // 4. Glowing Sun Star in the sky
    const sunGeo = new THREE.SphereGeometry(180, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.sunMesh.position.copy(this.sunLight.position);
    this.scene.add(this.sunMesh);

    // Solar Corona Halo
    const coronaGeo = new THREE.SphereGeometry(240, 16, 16);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunMesh.add(corona);

    // 5. Procedural Deep-Space Starfield (5,000 multi-spectral stars)
    const starCount = 5500;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const spectralPalette = [
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#90caf9'), // Blue giant
      new THREE.Color('#fff59d'), // Yellow dwarf
      new THREE.Color('#ffab91'), // Orange star
      new THREE.Color('#e1bee7'), // Violet star
    ];

    for (let i = 0; i < starCount; i++) {
      // Distribute stars on a massive celestial sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 18000 + Math.random() * 4000;

      const sinPhi = Math.sin(phi);
      starPos[i * 3] = r * sinPhi * Math.cos(theta);
      starPos[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const color = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 38,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // 6. Cosmic Nebulae Dust Clouds
    const nebulaCount = 600;
    const nebGeo = new THREE.BufferGeometry();
    const nebPos = new Float32Array(nebulaCount * 3);
    const nebColors = new Float32Array(nebulaCount * 3);

    const nebColorsList = [new THREE.Color('#8b5cf6'), new THREE.Color('#ec4899'), new THREE.Color('#06b6d4'), new THREE.Color('#3b82f6')];

    for (let i = 0; i < nebulaCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = 12000 + Math.random() * 5000;

      nebPos[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      nebPos[i * 3 + 1] = r * Math.sin(phi);
      nebPos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);

      const c = nebColorsList[Math.floor(Math.random() * nebColorsList.length)];
      nebColors[i * 3] = c.r;
      nebColors[i * 3 + 1] = c.g;
      nebColors[i * 3 + 2] = c.b;
    }
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
    nebGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));

    const nebMat = new THREE.PointsMaterial({
      size: 450,
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });
    this.nebulae = new THREE.Points(nebGeo, nebMat);
    this.scene.add(this.nebulae);
  }

  public resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public setAtmosphereFog(colorHex: string | null, density: number = 0.0035) {
    if (colorHex) {
      this.scene.fog = new THREE.FogExp2(colorHex, density);
      this.scene.background = new THREE.Color(colorHex);
    } else {
      this.scene.fog = null;
      this.scene.background = new THREE.Color(0x02040a);
    }
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
