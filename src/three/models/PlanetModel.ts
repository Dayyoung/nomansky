import * as THREE from 'three';
import { PlanetEntity } from '../../types';

export class PlanetBuilder {
  private static textureLoader = new THREE.TextureLoader();

  /**
   * Generates a realistic 3D No Man's Sky planet sphere with Kenney Planets textures,
   * atmospheric glow, cloud layer, and optional planetary rings.
   */
  public static createPlanet(planetData: PlanetEntity): THREE.Group {
    const group = new THREE.Group();
    group.name = `planet_${planetData.name}`;

    // Compute relative 3D scale based on 2D radius (0.1 scale factor consistent with world coordinates)
    const planetRadius = Math.max(85, Math.min(135, planetData.r * 0.1));

    // 1. Procedural Fallback Textures (Immediate rendering)
    const surfaceTexture = this.generatePlanetTexture(planetData);
    const bumpTexture = this.generateBumpTexture(planetData);

    const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      map: surfaceTexture,
      bumpMap: bumpTexture,
      bumpScale: 3.5,
      roughness: 0.85,
      metalness: 0.1,
    });

    // 1-A. Load Authentic Kenney Planets Texture (planet00.png ~ planet09.png)
    const nameHash = Math.abs(planetData.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
    const kenneyTexIndex = nameHash % 10;
    const kenneyTexUrl = `/assets/kenney/planets/planet0${kenneyTexIndex}.png`;
    const kenneyBumpUrl = `/assets/kenney/planets/noise0${nameHash % 6}.png`;

    this.textureLoader.load(
      kenneyTexUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        planetMat.map = tex;
        planetMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        // Fallback already assigned
      }
    );

    this.textureLoader.load(
      kenneyBumpUrl,
      (bumpTex) => {
        bumpTex.wrapS = THREE.RepeatWrapping;
        bumpTex.wrapT = THREE.RepeatWrapping;
        bumpTex.repeat.set(2, 2);
        planetMat.bumpMap = bumpTex;
        planetMat.bumpScale = 4.0;
        planetMat.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    group.add(planetMesh);

    // 2. Cloud Layer (Slightly larger sphere with transparency & rotation)
    const cloudTexture = this.generateCloudTexture();
    const cloudGeo = new THREE.SphereGeometry(planetRadius * 1.018, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      roughness: 1.0,
      metalness: 0.0,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMesh.name = 'clouds';
    group.add(cloudMesh);

    // 3. Atmospheric Halo Glow (Outer luminous shell)
    const atmoColor = new THREE.Color(planetData.color || '#38bdf8');
    const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.06, 32, 32);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 uColor;
        void main() {
          // Fresnel rim glow
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(uColor, intensity * 0.75);
        }
      `,
      uniforms: {
        uColor: { value: atmoColor },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    group.add(atmoMesh);

    // 4. Planetary Rings (Only for designated 2-3 planets in the system)
    if (Boolean(planetData.hasRings)) {
      const ringGroup = this.createPlanetaryRings(planetRadius, atmoColor);
      group.add(ringGroup);
    }

    return group;
  }

  /**
   * Generates a high-res procedural surface map canvas
   */
  private static generatePlanetTexture(planetData: PlanetEntity): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const baseHex = planetData.color || '#2e8b57';
    const type = (planetData.type || '').toUpperCase();

    // Base background
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw continental landmasses & biome patches
    const numPatches = 45;
    for (let i = 0; i < numPatches; i++) {
      const px = Math.random() * canvas.width;
      const py = Math.random() * canvas.height;
      const pr = 40 + Math.random() * 120;

      const grad = ctx.createRadialGradient(px, py, pr * 0.1, px, py, pr);
      if (type.includes('SCORCHED') || type.includes('LAVA')) {
        grad.addColorStop(0, '#ff4500');
        grad.addColorStop(0.6, '#8b0000');
        grad.addColorStop(1, '#2b1111');
      } else if (type.includes('TOXIC') || type.includes('ACID')) {
        grad.addColorStop(0, '#76ff03');
        grad.addColorStop(0.5, '#2e7d32');
        grad.addColorStop(1, '#1b5e20');
      } else if (type.includes('RADIOACTIVE') || type.includes('IRRADIATED')) {
        grad.addColorStop(0, '#eeff41');
        grad.addColorStop(0.7, '#c6ff00');
        grad.addColorStop(1, '#827717');
      } else if (type.includes('FROZEN') || type.includes('ICE')) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#b0bec5');
        grad.addColorStop(1, '#37474f');
      } else {
        // Lush / Paradise Earth-like
        grad.addColorStop(0, '#00e676');
        grad.addColorStop(0.5, '#00b0ff');
        grad.addColorStop(1, '#0d47a1');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar ice caps
    const northIce = ctx.createLinearGradient(0, 0, 0, 80);
    northIce.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    northIce.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = northIce;
    ctx.fillRect(0, 0, canvas.width, 80);

    const southIce = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
    southIce.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
    southIce.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    ctx.fillStyle = southIce;
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  /**
   * Generates bump map texture for mountain elevations and crater depths
   */
  private static generateBumpTexture(planetData: PlanetEntity): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 60; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const cr = 10 + Math.random() * 40;

      const grad = ctx.createRadialGradient(cx, cy, cr * 0.2, cx, cy, cr);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.7, '#404040');
      grad.addColorStop(1, '#808080');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Generates procedural cloud texture
   */
  private static generateCloudTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Swirling cloud bands
    for (let i = 0; i < 35; i++) {
      const cx = Math.random() * canvas.width;
      const cy = 60 + Math.random() * (canvas.height - 120);
      const rw = 90 + Math.random() * 220;
      const rh = 25 + Math.random() * 50;

      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rw);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw, rh, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Generates Saturn-style Planetary Rings
   */
  private static createPlanetaryRings(planetRadius: number, atmoColor: THREE.Color): THREE.Group {
    const ringGroup = new THREE.Group();
    ringGroup.name = 'rings';

    const innerRadius = planetRadius * 1.35;
    const outerRadius = planetRadius * 2.3;

    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    ringGeo.rotateX(Math.PI / 2);

    // Generate banded translucent ring texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0.0)');
      grad.addColorStop(0.2, atmoColor.getStyle());
      grad.addColorStop(0.4, 'rgba(255,255,255,0.7)');
      grad.addColorStop(0.6, 'rgba(180,220,255,0.1)'); // Cassini division gap
      grad.addColorStop(0.8, 'rgba(255,240,200,0.6)');
      grad.addColorStop(1, 'rgba(255,255,255,0.0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const ringTexture = new THREE.CanvasTexture(canvas);

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.5,
      metalness: 0.2,
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = 0.35;
    ringMesh.rotation.z = -0.2;
    ringGroup.add(ringMesh);

    return ringGroup;
  }
}
