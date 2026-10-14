import * as THREE from 'three';
import { game } from '../gameEngine';
import { ThreeRenderer } from './ThreeRenderer';
import { StarshipBuilder } from './models/StarshipModel';
import { PlanetBuilder } from './models/PlanetModel';
import { TerrainBuilder, getTerrainHeight } from './models/TerrainModel';
import { TravelerBuilder } from './models/TravelerModel';
import { SpaceStationBuilder } from './models/SpaceStationModel';
import { AsteroidFieldBuilder, AsteroidItem } from './models/AsteroidField';
import { PlanetEntity, ShipType, PlanetSentinelEntity, FaunaEntity } from '../types';
import { SentinelDroneModel } from './models/SentinelDroneModel';
import { AlienFaunaModel } from './models/AlienFaunaModel';
import { NmsAudioEngine } from './audio/NmsAudioEngine';
import { PirateShipBuilder, PirateShipEntity3D } from './models/PirateShipModel';
import { DerelictFreighterBuilder } from './models/DerelictFreighterModel';
import { BlackHoleBuilder } from './models/BlackHoleModel';
import { CockpitCanopyBuilder } from './models/CockpitCanopyModel';

export type CameraViewMode = 'CHASE' | 'COCKPIT' | 'ORBIT';

export type Three3DSceneMode =
  | 'FLIGHT' // Standard 3D Space Flight
  | 'PLANET' // Standard 3D Planet Surface Exploration
  | 'WARP' // Relativistic 3D Hyperspace Warp
  | 'DERELICT_FREIGHTER' // 3D Derelict Capital Freighter Salvage
  | 'EVA_SPACEWALK' // 3D Zero-G Spacewalk
  | 'BLACK_HOLE' // 3D Supermassive Black Hole & Accretion Disk
  | 'SPACE_STATION' // 3D Space Station Core & Docking Bay
  | 'SHIP_HANGAR' // 3D Starship Inspection Hangar & Color Customizer
  | 'GALAXY_MAP' // 3D Holographic Stellar Constellation Map
  | 'BASE_BUILDING' // 3D Planetary Base Construction
  | 'FAUNA_INSPECT' // 3D Alien Creature Compendium & Mount Riding
  | 'OCEAN_FISHING'; // 3D Aquarius Ocean & Deep Sea Fishing

export interface FlightInputState {
  steerX: number; // -1 (left) to +1 (right)
  steerY: number; // -1 (pitch down) to +1 (pitch up)
  throttle: number; // -1 (brake) to +1 (accelerate)
  boost: boolean; // Shift
  pulse: boolean; // Space
  fire: boolean;
  scan: boolean;
  interact: boolean;
}

export class ThreeGameEngine {
  public rendererSys: ThreeRenderer;
  private starshipGroup: THREE.Group | null = null;
  private currentShipType: ShipType = 'MECHANICAL';
  private travelerGroup: THREE.Group | null = null;
  private spaceStationGroup: THREE.Group | null = null;
  private asteroidItems: AsteroidItem[] = [];
  private planetGroups: Map<string, THREE.Group> = new Map();
  private surfaceTerrainGroup: THREE.Group | null = null;
  private sentinelDroneGroup: THREE.Group | null = null;
  private faunaGroupMap: Map<string, THREE.Group> = new Map();
  private currentPlanetName: string | null = null;
  private lastPulseActive: boolean = false;
  private lastToolShotTime: number = 0;

  // Camera settings
  public cameraMode: CameraViewMode = 'CHASE';
  private cameraPos = new THREE.Vector3(0, 10, -25);
  private cameraLookAt = new THREE.Vector3(0, 0, 10);
  private targetCamPos = new THREE.Vector3();
  private targetCamLookAt = new THREE.Vector3();

  // 3D Starship Flight State (Authentic No Man's Sky 3D Flight Physics)
  private shipPos = new THREE.Vector3(0, 0, 0);
  private shipYaw = 0; // Horizontal heading (radians)
  private shipPitch = 0; // Vertical nose tilt (radians)
  private shipRoll = 0; // Wing banking roll (radians)
  private shipSpeed = 6.0; // Current flight speed
  private shipTargetSpeed = 6.0;

  // 3D Traveler Astronaut State (Authentic No Man's Sky Planet Exploration)
  private travelerPos = new THREE.Vector3(0, 0, 0);
  private travelerYaw = 0; // Direction traveler is facing
  private travelerVelY = 0; // Vertical velocity for jetpack & gravity
  private travelerWalkCycle = 0;
  private isGrounded = true;

  // Orbit / Free Camera Angles (for on-foot & orbit mode)
  public orbitYaw = 0; // radians
  public orbitPitch = 0.25; // radians (clamped -0.3 to +1.2)
  public orbitDist = 8.5; // distance behind traveler/ship

  // Mining Beam & FX
  private laserBeams: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number }> = [];
  private miningBeamMesh: THREE.Line | null = null;
  private miningSparksMesh: THREE.Points | null = null;
  private scannerSphere: THREE.Mesh | null = null;
  private scannerRadius: number = 0;
  private isScanning: boolean = false;

  // New Immersive 3D Space & Planet Systems
  private derelictFreighterGroup: THREE.Group | null = null;
  private blackHoleGroup: THREE.Group | null = null;
  private pirateShips: PirateShipEntity3D[] = [];
  private weatherParticles: THREE.Points | null = null;
  private cockpitCanopyGroup: THREE.Group | null = null;
  private explosionParticles: Array<{ mesh: THREE.Points; velocities: THREE.Vector3[]; life: number; maxLife: number }> = [];
  private enemyLaserBeams: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number }> = [];

  // Thruster particle trails
  private thrusterParticles: THREE.Points | null = null;
  private thrusterPosArray: Float32Array = new Float32Array(300 * 3);
  private thrusterLifetime: Float32Array = new Float32Array(300);
  private lastFireTime: number = 0;

  // Warp tunnel FX
  private warpTunnelGroup: THREE.Group | null = null;

  // Rock-Solid High-Precision Monotonic Timer (Eliminates all frame delta stutter!)
  private lastPerfTime = performance.now();
  private totalElapsedTime = 0;

  // Pointer & Input tracking
  public mouseLookDelta = { x: 0, y: 0 };
  public isPointerDown = false;
  private lastGameState: string = 'SPACE';
  private lastInsidePlanet: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.rendererSys = new ThreeRenderer(canvas);
    this.initScene();
    this.initPositionsFromGame();
  }

  private initScene() {
    // 1. Create Space Station
    this.spaceStationGroup = SpaceStationBuilder.createSpaceStation();
    const stData = game.entities.station;
    if (stData) {
      this.spaceStationGroup.position.set(stData.x * 0.1, 0, stData.y * 0.1);
    }
    this.rendererSys.scene.add(this.spaceStationGroup);

    // 1-B. Create Derelict Capital Freighter (Desolation)
    this.derelictFreighterGroup = DerelictFreighterBuilder.createDerelictFreighter();
    this.derelictFreighterGroup.position.set(-180, 25, 260);
    this.rendererSys.scene.add(this.derelictFreighterGroup);

    // 1-C. Create Supermassive Black Hole (Singularity & Event Horizon)
    this.blackHoleGroup = BlackHoleBuilder.createBlackHole();
    this.blackHoleGroup.position.set(380, 0, -420);
    this.rendererSys.scene.add(this.blackHoleGroup);

    // 1-D. Cockpit First-Person Canopy
    this.cockpitCanopyGroup = CockpitCanopyBuilder.createCockpitCanopy();
    this.cockpitCanopyGroup.visible = false;
    this.rendererSys.scene.add(this.cockpitCanopyGroup);

    // 1-E. Planetary Weather Particle Field
    this.initWeatherParticles();

    // 2. Create Asteroid Field
    const { group: astGroup, asteroids } = AsteroidFieldBuilder.createAsteroidField(120, 2500);
    this.asteroidItems = asteroids;
    this.rendererSys.scene.add(astGroup);

    // 3. Create Starship
    this.updateStarship(game.data.shipType);

    // 4. Create Traveler Astronaut
    this.travelerGroup = TravelerBuilder.createTraveler();
    this.rendererSys.scene.add(this.travelerGroup);

    // 5. Create Planets
    this.syncPlanets();

    // 6. Multi-Tool Mining Beam line
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    this.miningBeamMesh = new THREE.Line(lineGeo, lineMat);
    this.miningBeamMesh.visible = false;
    this.rendererSys.scene.add(this.miningBeamMesh);

    // Mining Spark Particles at impact point
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(30 * 3);
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 1.2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.miningSparksMesh = new THREE.Points(sparkGeo, sparkMat);
    this.miningSparksMesh.visible = false;
    this.rendererSys.scene.add(this.miningSparksMesh);

    // 7. Scanner Pulse Sphere
    const scanGeo = new THREE.SphereGeometry(1, 32, 16);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    this.scannerSphere = new THREE.Mesh(scanGeo, scanMat);
    this.scannerSphere.visible = false;
    this.rendererSys.scene.add(this.scannerSphere);

    // 8. Thruster Trail Particles
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.thrusterPosArray, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00d2ff,
      size: 1.8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.thrusterParticles = new THREE.Points(pGeo, pMat);
    this.rendererSys.scene.add(this.thrusterParticles);

    // 9. Warp Hyperspace Tunnel
    this.initWarpTunnel();
  }

  private initPositionsFromGame() {
    this.shipPos.set(game.player.x * 0.1, 0, game.player.y * 0.1);
    this.shipYaw = game.player.angle || 0;
    const tX = (game.player.px || 0) * 0.15;
    const tZ = (game.player.py || 0) * 0.15;
    const groundY = getTerrainHeight(tX, tZ);
    this.travelerPos.set(tX, groundY, tZ);
    this.travelerYaw = 0;
    this.orbitYaw = 0;
    this.cameraPos.copy(this.shipPos).add(new THREE.Vector3(0, 8, -25));
    this.cameraLookAt.copy(this.shipPos);
    this.lastGameState = game.currState;
  }

  private initWarpTunnel() {
    this.warpTunnelGroup = new THREE.Group();
    this.warpTunnelGroup.visible = false;

    for (let i = 0; i < 40; i++) {
      const ringGeo = new THREE.TorusGeometry(35, 1.2, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0xbf00ff,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = -i * 50;
      this.warpTunnelGroup.add(ring);
    }
    this.rendererSys.scene.add(this.warpTunnelGroup);
  }

  private initWeatherParticles() {
    const count = 240;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.9,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    this.weatherParticles = new THREE.Points(geo, mat);
    this.weatherParticles.visible = false;
    this.rendererSys.scene.add(this.weatherParticles);
  }

  public current3DSceneMode: Three3DSceneMode = 'FLIGHT';
  private customShipColor: number | undefined = undefined;

  public updateStarship(type: ShipType, customColor?: number) {
    if (this.starshipGroup) {
      this.rendererSys.scene.remove(this.starshipGroup);
    }
    this.currentShipType = type;
    if (customColor !== undefined) this.customShipColor = customColor;
    this.starshipGroup = StarshipBuilder.createStarship(type, this.customShipColor);
    this.rendererSys.scene.add(this.starshipGroup);
  }

  public setCustomShipColor(colorHex: number) {
    this.customShipColor = colorHex;
    this.updateStarship(this.currentShipType, colorHex);
  }

  private syncPlanets() {
    game.entities.planets.forEach((p) => {
      if (!this.planetGroups.has(p.name)) {
        const pGroup = PlanetBuilder.createPlanet(p);
        pGroup.position.set(p.x * 0.1, 0, p.y * 0.1);
        this.rendererSys.scene.add(pGroup);
        this.planetGroups.set(p.name, pGroup);
      }
    });
  }

  public triggerScanner() {
    this.isScanning = true;
    this.scannerRadius = 2;
    if (this.scannerSphere) {
      this.scannerSphere.visible = true;
      const origin = game.currState === 'SPACE' ? this.shipPos : this.travelerPos;
      this.scannerSphere.position.copy(origin);
    }
  }

  public fireLaser() {
    if (game.currState !== 'SPACE' || !this.starshipGroup) return;

    // Authentic No Man's Sky Photon Cannon sound
    NmsAudioEngine.getInstance().playPhotonCannon();

    // Get starship world forward vector
    const forward = new THREE.Vector3(
      Math.sin(this.shipYaw) * Math.cos(this.shipPitch),
      Math.sin(this.shipPitch),
      Math.cos(this.shipYaw) * Math.cos(this.shipPitch)
    ).normalize();

    const right = new THREE.Vector3(Math.cos(this.shipYaw), 0, -Math.sin(this.shipYaw)).normalize();

    // Spawn twin photon cannon laser bolts
    [-1.2, 1.2].forEach((offsetSide) => {
      const boltGeo = new THREE.CylinderGeometry(0.18, 0.18, 6.5, 8);
      boltGeo.rotateX(Math.PI / 2);
      const boltMat = new THREE.MeshBasicMaterial({ color: 0xff3344 });
      const bolt = new THREE.Mesh(boltGeo, boltMat);

      const spawnPos = this.shipPos.clone()
        .addScaledVector(right, offsetSide)
        .addScaledVector(forward, 4.5);
      bolt.position.copy(spawnPos);
      bolt.quaternion.copy(this.starshipGroup!.quaternion);

      this.rendererSys.scene.add(bolt);
      this.laserBeams.push({
        mesh: bolt,
        vel: forward.clone().multiplyScalar(55),
        life: 1.6,
      });
    });
  }

  /**
   * Main 3D simulation tick called each frame
   */
  public update(delta: number) {
    this.totalElapsedTime += delta;

    // Ship class upgrade sync
    if (game.data.shipType !== this.currentShipType) {
      this.updateStarship(game.data.shipType);
    }

    // 1. STATE HANDLING: SPACE vs PLANET vs WARP
    if (this.lastGameState !== game.currState) {
      if (game.currState === 'PLANET') {
        const curPlanet = game.data.activePlanet || game.entities.planets[0];
        if (curPlanet) this.transitionToPlanetSurface(curPlanet);
      } else if (game.currState === 'SPACE') {
        this.transitionToSpaceFlight();
      }
      this.lastGameState = game.currState;
    }

    if (game.currState === 'WARP') {
      this.handleWarpMode(delta);
    } else if (game.currState === 'PLANET') {
      this.handlePlanetMode(delta);
    } else {
      this.handleSpaceMode(delta);
    }

    // 2. Animate Space Station
    if (this.spaceStationGroup) {
      const ring = this.spaceStationGroup.getObjectByName('station_ring');
      if (ring) ring.rotation.z += delta * 0.5;
      this.spaceStationGroup.rotation.y += delta * 0.15;
    }

    // 3. Animate Asteroids
    this.asteroidItems.forEach((ast) => {
      ast.mesh.rotation.x += ast.rotSpeed.x;
      ast.mesh.rotation.y += ast.rotSpeed.y;
      ast.mesh.rotation.z += ast.rotSpeed.z;
    });

    // 4. Update Laser Projectiles
    for (let i = this.laserBeams.length - 1; i >= 0; i--) {
      const bolt = this.laserBeams[i];
      bolt.mesh.position.addScaledVector(bolt.vel, delta);
      bolt.life -= delta;

      // Asteroid collision detection
      for (const ast of this.asteroidItems) {
        if (ast.hp > 0 && bolt.mesh.position.distanceTo(ast.mesh.position) < 18) {
          ast.hp -= 20;
          bolt.life = 0;
          this.spawnExplosion(bolt.mesh.position, 8, 0x67e8f9);
          if (ast.hp <= 0) {
            ast.mesh.scale.setScalar(0.001);
            this.spawnExplosion(ast.mesh.position, 25, 0x00f5ff);
            if (ast.resourceType === 'tritium') {
              game.data.inv.tritium = (game.data.inv.tritium || 0) + 35;
              game.spawnFloatText('+35 삼중수소 (Tritium)', ast.mesh.position.x * 10, ast.mesh.position.z * 10, '#4fd1c5');
            } else if (ast.resourceType === 'gold') {
              game.data.units += 45000;
              game.spawnFloatText('+45,000 ₩ (Gold)', ast.mesh.position.x * 10, ast.mesh.position.z * 10, '#ffd700');
            } else {
              game.data.inv.ferrite = (game.data.inv.ferrite || 0) + 50;
              game.spawnFloatText('+50 페라이트 (Ferrite)', ast.mesh.position.x * 10, ast.mesh.position.z * 10, '#a0aec0');
            }
          }
          break;
        }
      }

      // 3D Pirate Interceptor collision detection
      for (let pIdx = this.pirateShips.length - 1; pIdx >= 0; pIdx--) {
        const pirate = this.pirateShips[pIdx];
        if (pirate.hp > 0 && bolt.mesh.position.distanceTo(pirate.pos) < 9.5) {
          bolt.life = 0;
          pirate.hp -= 35;
          this.spawnExplosion(bolt.mesh.position, 12, 0xffaa00);
          NmsAudioEngine.getInstance().playDiscoveryFanfare();
          if (pirate.hp <= 0) {
            this.spawnExplosion(pirate.pos, 45, 0xff3b30);
            this.rendererSys.scene.remove(pirate.mesh);
            this.pirateShips.splice(pIdx, 1);
            game.data.units += 25000;
            game.data.nanites += 150;
            game.spawnFloatText('💥 해적선 격침! (+25,000 ₩, +150 ⬡ 현상금)', undefined, undefined, '#f43f5e');
          }
          break;
        }
      }

      if (bolt.life <= 0) {
        this.rendererSys.scene.remove(bolt.mesh);
        this.laserBeams.splice(i, 1);
      }
    }

    // 4-B. Update Enemy Pirate Laser Bolts
    for (let i = this.enemyLaserBeams.length - 1; i >= 0; i--) {
      const bolt = this.enemyLaserBeams[i];
      bolt.mesh.position.addScaledVector(bolt.vel, delta);
      bolt.life -= delta;
      if (bolt.mesh.position.distanceTo(this.shipPos) < 5.0) {
        bolt.life = 0;
        game.data.shield = Math.max(0, game.data.shield - 8);
        this.spawnExplosion(this.shipPos, 8, 0x00e5ff);
      }
      if (bolt.life <= 0) {
        this.rendererSys.scene.remove(bolt.mesh);
        this.enemyLaserBeams.splice(i, 1);
      }
    }

    // 4-C. Update Active 3D Particle Explosions
    for (let e = this.explosionParticles.length - 1; e >= 0; e--) {
      const exp = this.explosionParticles[e];
      exp.life -= delta;
      const posAttr = exp.mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let p = 0; p < posAttr.count; p++) {
        const vel = exp.velocities[p];
        posAttr.setXYZ(p, posAttr.getX(p) + vel.x * delta, posAttr.getY(p) + vel.y * delta, posAttr.getZ(p) + vel.z * delta);
      }
      posAttr.needsUpdate = true;
      (exp.mesh.material as THREE.PointsMaterial).opacity = Math.max(0, exp.life / exp.maxLife);
      if (exp.life <= 0) {
        this.rendererSys.scene.remove(exp.mesh);
        this.explosionParticles.splice(e, 1);
      }
    }

    // 4-D. Animate Supermassive Black Hole Accretion Disk
    if (this.blackHoleGroup && this.blackHoleGroup.visible) {
      const mainDisk = this.blackHoleGroup.getObjectByName('accretion_disk_main');
      if (mainDisk) mainDisk.rotation.z += delta * 0.45;
      const innerPlasma = this.blackHoleGroup.getObjectByName('accretion_inner_plasma');
      if (innerPlasma) innerPlasma.rotation.z += delta * 0.85;
      const lensHalo = this.blackHoleGroup.getObjectByName('accretion_lensing_halo');
      if (lensHalo) lensHalo.rotation.z -= delta * 0.35;
    }

    // 4-E. Animate Derelict Capital Freighter Floating Crates
    if (this.derelictFreighterGroup && this.derelictFreighterGroup.visible) {
      for (let c = 0; c < 6; c++) {
        const crate = this.derelictFreighterGroup.getObjectByName(`salvage_crate_${c}`);
        if (crate) crate.rotation.y += delta * 0.4;
      }
    }

    // 5. Update Scanner Pulse Wave
    if (this.isScanning && this.scannerSphere) {
      this.scannerRadius += delta * 220;
      this.scannerSphere.scale.setScalar(this.scannerRadius);
      const mat = this.scannerSphere.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.65 - (this.scannerRadius / 500));
      if (this.scannerRadius > 500) {
        this.isScanning = false;
        this.scannerSphere.visible = false;
      }
    }

    // 6. Camera Position & LookAt (Critically Damped, Zero Jitter)
    this.updateCamera(delta);

    // Reset mouse look delta after frame consumption
    this.mouseLookDelta.x = 0;
    this.mouseLookDelta.y = 0;
  }

  // =========================================================================
  // --- AUTHENTIC NO MAN'S SKY 3D STARSHIP FLIGHT SYSTEM ---
  // =========================================================================
  private handleSpaceMode(delta: number) {
    if (this.warpTunnelGroup) this.warpTunnelGroup.visible = false;
    this.rendererSys.setAtmosphereFog(null);

    // Visibility toggles
    if (this.starshipGroup) this.starshipGroup.visible = true;
    if (this.travelerGroup) this.travelerGroup.visible = false;
    if (this.surfaceTerrainGroup) this.surfaceTerrainGroup.visible = false;
    this.planetGroups.forEach((pg) => (pg.visible = true));

    // Input collection
    const kb = game.keyboard;
    const tc = game.touchControls;

    // Steering input: A is Left (좌), D is Right (우)
    let steerYaw = 0;
    let steerPitch = 0;
    let strafeInput = 0;
    let isPulse = false;
    let isBoost = false;

    if (game.isAutoPilot) {
      // =======================================================================
      // --- AI DEMO SHOWCASE 3D SPACE FLIGHT AUTOPILOT SIMULATION ---
      // =======================================================================
      const phase = game.data.demoShowcase.phase;
      let targetX = 0;
      let targetZ = 0;
      let targetFound = false;

      if (phase === 'DERELICT_FREIGHTER') {
        if (this.derelictFreighterGroup) {
          targetX = this.derelictFreighterGroup.position.x;
          targetZ = this.derelictFreighterGroup.position.z;
          targetFound = true;
        }
      } else if (phase === 'EVA_SPACEWALK') {
        if (this.derelictFreighterGroup) {
          targetX = this.derelictFreighterGroup.position.x + 10;
          targetZ = this.derelictFreighterGroup.position.z + 10;
          targetFound = true;
        }
      } else if (phase === 'BLACK_HOLE') {
        if (this.blackHoleGroup) {
          targetX = this.blackHoleGroup.position.x;
          targetZ = this.blackHoleGroup.position.z;
          targetFound = true;
        }
      } else if (phase === 'SPACE_STATION' && game.entities.station) {
        targetX = game.entities.station.x * 0.1;
        targetZ = game.entities.station.y * 0.1;
        targetFound = true;
      } else if (game.autoPilotTargetPlanet) {
        targetX = game.autoPilotTargetPlanet.x * 0.1;
        targetZ = game.autoPilotTargetPlanet.y * 0.1;
        targetFound = true;
      } else if (game.entities.planets.length > 0) {
        const p = game.entities.planets[0];
        targetX = p.x * 0.1;
        targetZ = p.y * 0.1;
        targetFound = true;
      }

      const dx = targetX - this.shipPos.x;
      const dz = targetZ - this.shipPos.z;
      const distToTarget = Math.hypot(dx, dz);

      const isSpaceExclusive = [
        'SPACE_PULSE', 'SPACE_COMBAT', 'STARSHIP_CYCLE', 'SOLAR_SAIL',
        'SPACE_STATION', 'GALAXY_MAP', 'PIRATE_DREADNOUGHT', 'OUTLAW_STATION',
        'SPACE_ANOMALY', 'BLACK_HOLE', 'DERELICT_FREIGHTER', 'EVA_SPACEWALK',
        'SHIP_FABRICATION', 'STARSHIP_WEAPONS', 'GALACTIC_CORE', 'ORGANIC_FLEET'
      ].includes(phase);

      let targetHeading = targetFound ? Math.atan2(dx, dz) : this.shipYaw;
      let targetTilt = 0;

      // Orbit gracefully around planets during space exclusive phases to avoid crashing into surface
      if (isSpaceExclusive && distToTarget < 220.0 && !['DERELICT_FREIGHTER', 'EVA_SPACEWALK', 'BLACK_HOLE', 'SPACE_STATION'].includes(phase)) {
        const orbitAngle = Math.atan2(this.shipPos.z - targetZ, this.shipPos.x - targetX);
        targetHeading = orbitAngle + Math.PI / 2 + 0.15; // Smooth orbital cruise
        targetTilt = 0;
      }

      // Space combat dogfight weaving & auto-firing in 3D
      if (phase === 'SPACE_COMBAT' || phase === 'STARSHIP_WEAPONS') {
        targetHeading += Math.sin(this.totalElapsedTime * 3.2) * 0.45;
        targetTilt = Math.sin(this.totalElapsedTime * 2.4) * 0.25;
        if (!this.lastFireTime || this.totalElapsedTime - this.lastFireTime > 0.22) {
          this.fireLaser();
          this.lastFireTime = this.totalElapsedTime;
          if (phase === 'STARSHIP_WEAPONS' && Math.floor(this.totalElapsedTime * 4) % 6 === 0) {
            const weaponNames = ['포톤 캐논', '인프라-나이프 가속기', '포지트론 이젝터', '사이클로트론 발리스타', '로켓 런처'];
            const wIdx = Math.floor((this.totalElapsedTime * 1.5) % weaponNames.length);
            game.spawnFloatText(`🚀 [스타쉽 화기 오버드라이브] ${weaponNames[wIdx]} 일제 사격!`, undefined, undefined, '#38bdf8');
          }
        }
      }

      let yawDiff = targetHeading - this.shipYaw;
      while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
      while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
      steerYaw = Math.max(-1.0, Math.min(1.0, yawDiff * 2.5));

      let pitchDiff = targetTilt - this.shipPitch;
      steerPitch = Math.max(-0.6, Math.min(0.6, pitchDiff * 3.0));

      // Speed control tuned to each phase
      if (phase === 'DERELICT_FREIGHTER') {
        if (distToTarget < 75.0) {
          isPulse = false;
          this.shipTargetSpeed = 7.0; // Salvage flyby speed
          if (!this.isScanning) this.triggerScanner();
        } else {
          isPulse = distToTarget > 120.0;
          this.shipTargetSpeed = isPulse ? 85.0 : 20.0;
        }
      } else if (phase === 'EVA_SPACEWALK') {
        isPulse = false;
        this.shipTargetSpeed = 4.0;
      } else if (phase === 'BLACK_HOLE') {
        if (distToTarget < 65.0) {
          isPulse = false;
          this.shipTargetSpeed = 12.0; // Orbit accretion disk
        } else {
          isPulse = distToTarget > 100.0;
          this.shipTargetSpeed = isPulse ? 85.0 : 20.0;
        }
      } else if (phase === 'SPACE_COMBAT' || phase === 'STARSHIP_WEAPONS') {
        isPulse = false;
        this.lastPulseActive = false;
        this.shipTargetSpeed = 26.0; // Combat dogfight speed
      } else {
        isPulse = (distToTarget > 140.0 || Boolean(game.data.isPulseActive));
        if (isPulse) {
          if (!this.lastPulseActive) {
            NmsAudioEngine.getInstance().playPulseDrive();
            this.lastPulseActive = true;
          }
          this.shipTargetSpeed = 95.0;
        } else {
          this.lastPulseActive = false;
          this.shipTargetSpeed = 16.0;
        }
      }
      game.data.isPulseActive = isPulse;

      // Proximity landing auto-transition in 3D demo when entering planet atmosphere
      for (const p of game.entities.planets) {
        const p3dX = p.x * 0.1;
        const p3dZ = p.y * 0.1;
        const pDist = Math.hypot(this.shipPos.x - p3dX, this.shipPos.z - p3dZ);
        const atmoR = (p.r + 35) * 0.1;
        if (pDist <= atmoR) {
          if (!isSpaceExclusive) {
            game.landCurrentShip(p);
            this.transitionToPlanetSurface(p);
            break;
          }
        }
      }
    } else {
      // =======================================================================
      // --- MANUAL HUMAN PLAYER STARSHIP FLIGHT CONTROLS ---
      // =======================================================================
      // Manual flight controls - ACCURATELY ALIGNED LEFT/RIGHT:
      // A (좌): Left yaw turn (+steerYaw => ship turns Left), left strafe (-strafeInput)
      // D (우): Right yaw turn (-steerYaw => ship turns Right), right strafe (+strafeInput)
      if (kb.a) {
        steerYaw += 1.0; // A: 좌회전 (Turn Left -> 기수 화면 왼쪽 선회)
        strafeInput -= 1.0; // A: 좌측 횡이동 (Strafe Left -> 화면 왼쪽)
      }
      if (kb.d) {
        steerYaw -= 1.0; // D: 우회전 (Turn Right -> 기수 화면 오른쪽 선회)
        strafeInput += 1.0; // D: 우측 횡이동 (Strafe Right -> 화면 오른쪽)
      }
      if (tc.joystickVector.x) {
        // [3D 조이스틱 좌우]: 오른쪽으로 밀면 우회전 & 우측이동, 왼쪽으로 밀면 좌회전 & 좌측이동
        steerYaw -= tc.joystickVector.x;
        strafeInput += tc.joystickVector.x;
      }

      // Mouse drag steering (No Man's Sky flight control)
      if (this.isPointerDown && (Math.abs(this.mouseLookDelta.x) > 0.1 || Math.abs(this.mouseLookDelta.y) > 0.1)) {
        steerYaw -= this.mouseLookDelta.x * 0.0035;
        steerPitch -= this.mouseLookDelta.y * 0.0025;
      }

      // Throttle input: W accelerates (전진 가속), S brakes/reverses (감속/제동)
      const isW = kb.w || tc.joystickVector.y < -0.3;
      const isS = kb.s || tc.joystickVector.y > 0.3;
      isBoost = Boolean(kb.shift || tc.isJetpacking);
      isPulse = Boolean(kb.space || game.data.isPulseActive);

      // Target Speed Curve
      if (isPulse) {
        if (!this.lastPulseActive) {
          NmsAudioEngine.getInstance().playPulseDrive();
          this.lastPulseActive = true;
        }
        this.shipTargetSpeed = 95.0; // Pulse Drive superluminal speed
        game.data.isPulseActive = true;
      } else {
        this.lastPulseActive = false;
        if (isBoost) {
          this.shipTargetSpeed = 36.0; // Engine Boost / Afterburners
          game.data.isPulseActive = false;
        } else if (isW) {
          this.shipTargetSpeed = 16.0; // Full forward cruise
          game.data.isPulseActive = false;
        } else if (isS) {
          this.shipTargetSpeed = 1.0; // Space brake
          game.data.isPulseActive = false;
        } else {
          this.shipTargetSpeed = 6.0; // Idle cruise speed
          game.data.isPulseActive = false;
        }
      }
    }

    // Smooth Throttle Acceleration
    const accelRate = isPulse ? 35.0 : 18.0;
    this.shipSpeed += (this.shipTargetSpeed - this.shipSpeed) * Math.min(1.0, delta * accelRate);

    // Smooth Yaw Steering with Angular Damping
    const turnRate = 2.4;
    this.shipYaw += steerYaw * turnRate * delta;

    // Smooth Pitch Tilt (-40° to +40°)
    const pitchTarget = steerPitch * 0.6;
    this.shipPitch += (pitchTarget - this.shipPitch) * Math.min(1.0, delta * 6.0);
    this.shipPitch = Math.max(-0.65, Math.min(0.65, this.shipPitch));

    // Authentic Wing Roll Banking into Turns (-40° to +40°)
    // In No Man's Sky, turning right banks right wing down (+roll), turning left banks left wing down (-roll)
    const targetRoll = -steerYaw * 0.65;
    this.shipRoll += (targetRoll - this.shipRoll) * Math.min(1.0, delta * 7.0);

    // Calculate 3D Forward Direction Vector from Yaw and Pitch
    const forward = new THREE.Vector3(
      Math.sin(this.shipYaw) * Math.cos(this.shipPitch),
      Math.sin(this.shipPitch),
      Math.cos(this.shipYaw) * Math.cos(this.shipPitch)
    ).normalize();

    // Lateral right vector for responsive strafe movement (Points TRUE Screen Right: -cos(yaw), 0, sin(yaw))
    const lateralRight = new THREE.Vector3(-Math.cos(this.shipYaw), 0, Math.sin(this.shipYaw)).normalize();

    // Advance 3D Starship Position (Forward + Lateral Strafe)
    this.shipPos.addScaledVector(forward, this.shipSpeed * delta * 5.0);
    if (strafeInput !== 0) {
      this.shipPos.addScaledVector(lateralRight, strafeInput * (this.shipSpeed * 0.55 + 5.0) * delta);
    }

    // Update 3D Starship Mesh Transformation
    if (this.starshipGroup) {
      this.starshipGroup.position.copy(this.shipPos);

      // Compose full 3D rotation: Yaw -> Pitch -> Roll Banking
      const euler = new THREE.Euler(this.shipPitch, this.shipYaw, this.shipRoll, 'YXZ');
      this.starshipGroup.quaternion.setFromEuler(euler);

      // Emit blue plasma thruster particles behind ship engines
      this.emitThrusterParticles(this.shipPos, forward, isPulse ? 3.5 : (isBoost ? 2.0 : 1.0));
    }

    // Starship Photon Cannon Manual Firing (On-screen Fire button / mouse / touch)
    if (tc.isFiring && !isPulse) {
      if (!this.lastFireTime || this.totalElapsedTime - this.lastFireTime > 0.18) {
        this.fireLaser();
        this.lastFireTime = this.totalElapsedTime;
      }
    }

    // Synchronize 3D starship position back to 2D game.player
    game.player.x = this.shipPos.x * 10.0;
    game.player.y = this.shipPos.z * 10.0;
    game.player.angle = Math.atan2(forward.z, forward.x);
    game.player.vx = forward.x * this.shipSpeed * 0.15;
    game.player.vy = forward.z * this.shipSpeed * 0.15;

    // Check proximity interactions with planets (Spherical Flight & Landing)
    let inAnyPlanetAtmosphere = false;
    for (const p of game.entities.planets) {
      const p3dX = p.x * 0.1;
      const p3dZ = p.y * 0.1;
      const center = new THREE.Vector3(p3dX, 0, p3dZ);
      const planetRadius = Math.max(85, Math.min(135, p.r * 0.1));
      const atmoR = planetRadius + 38.0;
      const dist3D = this.shipPos.distanceTo(center);

      // 1. Atmosphere Envelope: Atmospheric halo & Landing Prompt (Static label - NO spamming!)
      if (dist3D <= atmoR) {
        inAnyPlanetAtmosphere = true;
        this.rendererSys.setAtmosphereFog(p.color || '#38bdf8', 0.002);

        // Landing interaction prompt (Quiet & static on HUD)
        game.data.interactLabel = `🛬 [E / 착륙버튼] ${p.name} 지표면 착륙`;
        if (kb.e === 1 || tc.isInteracting) {
          game.landCurrentShip(p);
          this.transitionToPlanetSurface(p);
          return;
        }

        // 2. Spherical Planet Anti-Penetration Guard: Starship glides above spherical surface
        const minFlightRadius = planetRadius + 4.5;
        if (dist3D < minFlightRadius) {
          const surfaceNormal = this.shipPos.clone().sub(center).normalize();
          this.shipPos.copy(center).addScaledVector(surfaceNormal, minFlightRadius);

          // Auto-deflect pull-up cushion: softly deflect nose parallel to spherical surface
          const dot = forward.dot(surfaceNormal);
          if (dot < -0.1) {
            this.shipPitch = Math.min(0.25, this.shipPitch + delta * 3.5);
          }
        }
        break;
      }
    }

    if (!inAnyPlanetAtmosphere) {
      this.rendererSys.setAtmosphereFog(null);
    }

    // Space station docking check
    if (game.entities.station) {
      const stX = game.entities.station.x * 0.1;
      const stZ = game.entities.station.y * 0.1;
      const dist = Math.hypot(this.shipPos.x - stX, this.shipPos.z - stZ);
      if (dist < 40) {
        game.data.interactLabel = '🛰️ 우주정거장 트랙터 빔 도킹 [E]';
        if (kb.e === 1 || tc.isInteracting) {
          NmsAudioEngine.getInstance().playSpaceStationEntry();
          game.data.shield = game.data.maxShield;
          game.data.hazard = 100;
          game.data.lifeSupport = 100;
          game.spawnFloatText('🛰️ 우주정거장 진입: 쉴드 및 생명유지 완전 충전 // 무역소 연결', undefined, undefined, '#00e5ff');
        }
      }
    }

    // 3D Derelict Capital Freighter (Desolation update / 11번 단계 연동)
    if (this.derelictFreighterGroup) {
      const distToFreighter = this.shipPos.distanceTo(this.derelictFreighterGroup.position);
      if (distToFreighter < 55) {
        game.data.interactLabel = '☠️ 버려진 화물선 응급 에어록 도킹 [E]';
        if (kb.e === 1 || tc.isInteracting) {
          game.data.taintedMetal = (game.data.taintedMetal || 0) + 120;
          game.data.units += 500000;
          game.data.nanites += 1000;
          game.data.inv.cargoBulkhead = (game.data.inv.cargoBulkhead || 0) + 1;
          NmsAudioEngine.getInstance().playDiscoveryFanfare();
          game.spawnFloatText('☠️ 버려진 화물선 메인프레임 인양 성공! (+120 오염된 금속, +500,000 ₩, +1,000 ⬡, 화물 격벽)', undefined, undefined, '#fbbf24');
        }
      }
    }

    // 3D Supermassive Black Hole (사건의 지평선 특이점 도약)
    if (this.blackHoleGroup) {
      const distToHole = this.shipPos.distanceTo(this.blackHoleGroup.position);
      if (distToHole < 45) {
        game.data.interactLabel = '🕳️ 사건의 지평선 웜홀 도약 [E]';
        if (kb.e === 1 || tc.isInteracting) {
          game.currState = 'WARP';
          game.warpProgress = 0;
          NmsAudioEngine.getInstance().playPulseDrive();
          game.spawnFloatText('🕳️ 사건의 지평선 돌파! 850,000 LY 은하계 웜홀 도약', undefined, undefined, '#c084fc');
        }
      }
    }

    // 3D Space Pirates & Dogfight Simulation
    this.updatePirateCombat(delta);

    // Planet cloud rotations
    this.planetGroups.forEach((pg) => {
      const clouds = pg.getObjectByName('clouds');
      if (clouds) clouds.rotation.y += delta * 0.05;
    });
  }

  // =========================================================================
  // --- AUTHENTIC NO MAN'S SKY PLANET SURFACE ON-FOOT EXPLORATION ---
  // =========================================================================
  private handlePlanetMode(delta: number) {
    if (this.warpTunnelGroup) this.warpTunnelGroup.visible = false;

    // Switch active planet terrain
    const curPlanet = game.data.activePlanet;
    if (curPlanet) {
      if (this.currentPlanetName !== curPlanet.name) {
        this.currentPlanetName = curPlanet.name;
        if (this.surfaceTerrainGroup) {
          this.rendererSys.scene.remove(this.surfaceTerrainGroup);
        }
        if (this.sentinelDroneGroup) {
          this.rendererSys.scene.remove(this.sentinelDroneGroup);
          this.sentinelDroneGroup = null;
        }
        this.faunaGroupMap.forEach((fg) => {
          this.rendererSys.scene.remove(fg);
        });
        this.faunaGroupMap.clear();

        this.surfaceTerrainGroup = TerrainBuilder.createSurfaceTerrain(curPlanet);
        this.rendererSys.scene.add(this.surfaceTerrainGroup);

        // Spawn iconic 3D Sentinel Drone patrolling planet
        const dummySentinel: PlanetSentinelEntity = {
          id: 'sentinel_drone_primary',
          lx: (game.player.px || 0) + 35,
          ly: (game.player.py || 0) + 35,
          vx: 0,
          vy: 0,
          state: 'PATROL',
          scanTimer: 0,
          hp: 100,
          maxHp: 100,
        };
        this.sentinelDroneGroup = SentinelDroneModel.createSentinelMesh(dummySentinel);
        this.rendererSys.scene.add(this.sentinelDroneGroup);

        const atmoHex = curPlanet.color || '#38bdf8';
        this.rendererSys.setAtmosphereFog(atmoHex, 0.0035);
      }
      if (this.surfaceTerrainGroup) this.surfaceTerrainGroup.visible = true;
    }

    // Hide distant space planets
    this.planetGroups.forEach((pg) => (pg.visible = false));

    const kb = game.keyboard;
    const tc = game.touchControls;

    // Camera Orbit Mouse / Touch Drag (Natural right/left drag rotates right/left)
    if (this.isPointerDown && (Math.abs(this.mouseLookDelta.x) > 0.05 || Math.abs(this.mouseLookDelta.y) > 0.05)) {
      this.orbitYaw += this.mouseLookDelta.x * 0.004;
      this.orbitPitch -= this.mouseLookDelta.y * 0.003;
      // Clamp pitch to prevent flipping upside down
      this.orbitPitch = Math.max(-0.25, Math.min(1.2, this.orbitPitch));
    }

    // Camera forward and right vectors projected onto ground plane (XZ - camRight points TRUE screen right)
    const camFwd = new THREE.Vector3(Math.sin(this.orbitYaw), 0, Math.cos(this.orbitYaw)).normalize();
    const camRight = new THREE.Vector3(-Math.cos(this.orbitYaw), 0, Math.sin(this.orbitYaw)).normalize();

    let isJetpackActive = false;

    if (game.isAutoPilot) {
      // =======================================================================
      // --- AI DEMO SHOWCASE AUTOPILOT MODE: 100% RELIABLE SURFACE ALTITUDE ---
      // =======================================================================
      const targetX = (game.player.px || 0) * 0.15;
      const targetZ = (game.player.py || 0) * 0.15;

      const dx = targetX - this.travelerPos.x;
      const dz = targetZ - this.travelerPos.z;
      const moveDist = Math.hypot(dx, dz);

      if (moveDist > 0.02) {
        this.travelerPos.x = THREE.MathUtils.lerp(this.travelerPos.x, targetX, Math.min(1.0, delta * 16.0));
        this.travelerPos.z = THREE.MathUtils.lerp(this.travelerPos.z, targetZ, Math.min(1.0, delta * 16.0));

        const targetYaw = Math.atan2(dx, dz);
        let yawDiff = targetYaw - this.travelerYaw;
        while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
        while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
        this.travelerYaw += yawDiff * Math.min(1.0, delta * 14.0);

        this.travelerWalkCycle += delta * 14.0;
      } else {
        this.travelerWalkCycle = 0;
      }

      // CRITICAL ALTITUDE FIX: Calculate exact procedural ground elevation at current location
      const groundElevation = getTerrainHeight(this.travelerPos.x, this.travelerPos.z);
      isJetpackActive = Boolean(game.player.isJetpacking);

      if (isJetpackActive) {
        // Smooth hovering altitude when jetpack is engaged in demo
        const hoverAlt = groundElevation + 3.8 + Math.sin(this.totalElapsedTime * 7) * 0.5;
        this.travelerPos.y = THREE.MathUtils.lerp(this.travelerPos.y, hoverAlt, Math.min(1.0, delta * 8.0));
        this.isGrounded = false;
      } else {
        // Traveler strictly walks on the terrain surface: NEVER penetrative or underground!
        this.travelerPos.y = groundElevation;
        this.travelerVelY = 0;
        this.isGrounded = true;
      }

      // Camera gently pivots behind traveler heading during demo tour
      if (!this.isPointerDown) {
        let camYawDiff = this.travelerYaw - this.orbitYaw;
        while (camYawDiff > Math.PI) camYawDiff -= Math.PI * 2;
        while (camYawDiff < -Math.PI) camYawDiff += Math.PI * 2;
        this.orbitYaw += camYawDiff * Math.min(1.0, delta * 2.0);
      }
    } else {
      // =======================================================================
      // --- MANUAL HUMAN PLAYER ON-FOOT EXPLORATION ---
      // =======================================================================
      let inputFwd = 0;
      let inputRight = 0;

      // In No Man's Sky on-foot controls (동일 조작계):
      // A: Left strafe (좌 방향 이동), D: Right strafe (우 방향 이동)
      // W: Forward (전진), S: Backward (후진)
      if (kb.w) inputFwd += 1;
      if (kb.s) inputFwd -= 1;
      if (kb.d) inputRight += 1; // D: 우측 이동 (Right Strafe -> 화면 오른쪽)
      if (kb.a) inputRight -= 1; // A: 좌측 이동 (Left Strafe -> 화면 왼쪽)

      // Virtual Joystick support
      if (Math.hypot(tc.joystickVector.x, tc.joystickVector.y) > 0.1) {
        inputRight += tc.joystickVector.x; // 우측으로 밀면 우측 이동, 좌측으로 밀면 좌측 이동
        inputFwd -= tc.joystickVector.y; // 앞으로 밀면 전진, 뒤로 밀면 후진
      }

      const isMoving = Math.hypot(inputFwd, inputRight) > 0.08;
      const isSprinting = kb.shift;
      const moveSpeed = isSprinting ? 9.5 : 5.5;

      if (isMoving) {
        // Calculate move vector in world space from camera orientation
        const moveVec = new THREE.Vector3()
          .addScaledVector(camFwd, inputFwd)
          .addScaledVector(camRight, inputRight)
          .normalize();

        this.travelerPos.addScaledVector(moveVec, moveSpeed * delta);

        // Smoothly rotate traveler model to face movement direction
        const targetFacing = Math.atan2(moveVec.x, moveVec.z);
        let angleDiff = targetFacing - this.travelerYaw;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.travelerYaw += angleDiff * Math.min(1.0, delta * 14.0);

        // Leg swing animation
        this.travelerWalkCycle += delta * (isSprinting ? 18.0 : 11.0);
      } else {
        this.travelerWalkCycle = 0;
      }

      // Ground altitude calculation
      const groundElevation = getTerrainHeight(this.travelerPos.x, this.travelerPos.z);
      isJetpackActive = Boolean(kb.space || tc.isJetpacking);

      if (isJetpackActive && game.data.lifeSupport > 5) {
        // Smooth upward thrust
        this.travelerVelY += 32.0 * delta;
        this.travelerVelY = Math.min(12.0, this.travelerVelY);
        this.isGrounded = false;
        game.data.lifeSupport = Math.max(0, game.data.lifeSupport - delta * 2.5);
        this.travelerPos.y += this.travelerVelY * delta;
      } else {
        if (this.isGrounded) {
          // Walking on hills: stay precisely on surface
          this.travelerPos.y = groundElevation;
          this.travelerVelY = 0;
        } else {
          this.travelerVelY -= 26.0 * delta;
          this.travelerPos.y += this.travelerVelY * delta;
        }
      }

      // Ground collision clamping (Smooth landing!)
      if (this.travelerPos.y <= groundElevation) {
        this.travelerPos.y = groundElevation;
        this.travelerVelY = 0;
        this.isGrounded = true;
      }

      // Synchronize 3D traveler position back to 2D game.player ONLY in manual control
      game.player.px = this.travelerPos.x / 0.15;
      game.player.py = this.travelerPos.z / 0.15;
      game.player.isJetpacking = !this.isGrounded;
    }

    // Update 3D Traveler Astronaut Model
    if (this.travelerGroup) {
      this.travelerGroup.visible = true;
      this.travelerGroup.position.copy(this.travelerPos);
      this.travelerGroup.rotation.set(0, this.travelerYaw, 0);

      // Leg stride swing animation
      const legL = this.travelerGroup.getObjectByName('leg_l');
      const legR = this.travelerGroup.getObjectByName('leg_r');
      if (legL && legR) {
        if (this.travelerWalkCycle > 0) {
          legL.rotation.x = Math.sin(this.travelerWalkCycle) * 0.55;
          legR.rotation.x = -Math.sin(this.travelerWalkCycle) * 0.55;
        } else {
          legL.rotation.x = 0;
          legR.rotation.x = 0;
        }
      }

      // Jetpack Thruster Flame Visibility
      const flameL = this.travelerGroup.getObjectByName('jet_flame_l');
      const flameR = this.travelerGroup.getObjectByName('jet_flame_r');
      if (flameL) flameL.visible = isJetpackActive;
      if (flameR) flameR.visible = isJetpackActive;
    }

    // Parked Starship on surface near player
    if (this.starshipGroup) {
      this.starshipGroup.visible = true;
      const shipGround = getTerrainHeight(this.shipPos.x, this.shipPos.z);
      this.starshipGroup.position.set(this.shipPos.x, shipGround + 0.6, this.shipPos.z);
      this.starshipGroup.rotation.set(0, this.shipYaw, 0);

      // Check distance to parked starship to board [E]
      const distToShip = this.travelerPos.distanceTo(this.starshipGroup.position);
      if (distToShip < 12.0) {
        game.data.interactLabel = '🚀 우주선 탑승 및 이륙 [E]';
        if (kb.e === 1 || tc.isInteracting) {
          game.launchToOrbit();
          this.transitionToSpaceFlight();
        }
      }
    }

    // Collect interaction and firing states early
    const isMining = Boolean(tc.isFiring || this.isPointerDown || kb.e === 1 || (game.isAutoPilot && game.player.isMining));
    const toolMode = game.data.toolMode;

    // Update 3D Alien Fauna Ecosystem (No Man's Sky 절차적 외계 생명체 시뮬레이션)
    if (curPlanet) {
      if (!curPlanet.fauna || curPlanet.fauna.length === 0) {
        const baseSpecies = curPlanet.faunaSpecies?.[0] || {
          id: 'fauna_sp_1',
          latinName: 'Diplo Giganticus',
          commonName: '디플로 초식 거수',
          classType: 'Megaherbivore',
          diet: '초식성',
          temperament: '온순함',
          height: '3.8m',
          weight: 180,
          color: '#4ade80',
          isDiscovered: true,
        };
        curPlanet.fauna = [
          {
            id: 'fauna_1',
            speciesRef: baseSpecies,
            lx: (game.player.px || 0) + 26,
            ly: (game.player.py || 0) + 22,
            vx: 0,
            vy: 0,
            targetLx: (game.player.px || 0) + 32,
            targetLy: (game.player.py || 0) + 28,
            facing: 0.8,
            walkCycle: 0,
            state: 'WANDER',
            timer: 0,
            hp: 100,
            maxHp: 100,
            isScanned: false,
          },
          {
            id: 'fauna_2',
            speciesRef: { ...baseSpecies, id: 'fauna_sp_2', commonName: '스트라이더 외계조', color: '#f59e0b', weight: 45 },
            lx: (game.player.px || 0) - 28,
            ly: (game.player.py || 0) + 18,
            vx: 0,
            vy: 0,
            targetLx: (game.player.px || 0) - 34,
            targetLy: (game.player.py || 0) + 24,
            facing: -1.2,
            walkCycle: 0,
            state: 'WANDER',
            timer: 0,
            hp: 80,
            maxHp: 80,
            isScanned: false,
          },
          {
            id: 'fauna_3',
            speciesRef: { ...baseSpecies, id: 'fauna_sp_3', commonName: '발광 소형 프라울러', color: '#a855f7', weight: 35 },
            lx: (game.player.px || 0) + 12,
            ly: (game.player.py || 0) - 26,
            vx: 0,
            vy: 0,
            targetLx: (game.player.px || 0) + 18,
            targetLy: (game.player.py || 0) - 32,
            facing: 2.4,
            walkCycle: 0,
            state: 'WANDER',
            timer: 0,
            hp: 60,
            maxHp: 60,
            isScanned: false,
          }
        ];
      }

      for (const fauna of curPlanet.fauna) {
        let faunaMesh = this.faunaGroupMap.get(fauna.id);
        if (!faunaMesh) {
          faunaMesh = AlienFaunaModel.createFaunaMesh(fauna);
          this.rendererSys.scene.add(faunaMesh);
          this.faunaGroupMap.set(fauna.id, faunaMesh);
        }
        faunaMesh.visible = true;

        // Fauna movement AI: Follow tamed master or wander grazing
        if (fauna.state === 'FOLLOW') {
          const tX = this.travelerPos.x;
          const tZ = this.travelerPos.z;
          const fCurX = fauna.lx * 0.15;
          const fCurZ = fauna.ly * 0.15;
          const fDist = Math.hypot(tX - fCurX, tZ - fCurZ);
          if (fDist > 3.5) {
            const fAngle = Math.atan2(tX - fCurX, tZ - fCurZ);
            fauna.facing = fAngle;
            fauna.lx += Math.sin(fAngle) * delta * 24;
            fauna.ly += Math.cos(fAngle) * delta * 24;
          }
        } else {
          fauna.timer = (fauna.timer || 0) + delta;
          if (fauna.timer > 5.0) {
            fauna.timer = 0;
            fauna.targetLx = fauna.lx + (Math.random() - 0.5) * 50;
            fauna.targetLy = fauna.ly + (Math.random() - 0.5) * 50;
          }
          const dx = (fauna.targetLx || fauna.lx) - fauna.lx;
          const dy = (fauna.targetLy || fauna.ly) - fauna.ly;
          if (Math.hypot(dx, dy) > 1.2) {
            const moveAngle = Math.atan2(dx, dy);
            fauna.facing = moveAngle;
            fauna.lx += Math.sin(moveAngle) * delta * 11;
            fauna.ly += Math.cos(moveAngle) * delta * 11;
          }
        }

        const fx = fauna.lx * 0.15;
        const fz = fauna.ly * 0.15;
        const fgGround = getTerrainHeight(fx, fz);
        faunaMesh.position.set(fx, fgGround, fz);
        faunaMesh.rotation.y = fauna.facing || 0;

        AlienFaunaModel.updateAnimation(faunaMesh, fauna, delta, this.totalElapsedTime);

        // Interaction with traveler: Feeding & Taming with Creature Pellets [E]
        const distToTraveler = faunaMesh.position.distanceTo(this.travelerPos);
        if (distToTraveler < 9.0) {
          if (!fauna.isTamed) {
            game.data.interactLabel = `🐾 [E] ${fauna.speciesRef?.commonName || '외계 생명체'} 먹이주기 & 길들이기`;
            if (kb.e === 1 || tc.isInteracting) {
              fauna.isTamed = true;
              fauna.state = 'FOLLOW';
              NmsAudioEngine.getInstance().playCreatureCall();
              NmsAudioEngine.getInstance().playDiscoveryFanfare();
              game.spawnFloatText(`❤️ ${fauna.speciesRef?.commonName || '생명체'} 길들이기 성공! 동료로 등록`, undefined, undefined, '#f43f5e');
              game.data.inv.carbon = (game.data.inv.carbon || 0) + 20;
            }
          } else {
            game.data.interactLabel = `🐾 [E] ${fauna.speciesRef?.commonName || '동료'} 쓰다듬기 (친밀도 MAX)`;
            if (kb.e === 1 || tc.isInteracting) {
              NmsAudioEngine.getInstance().playCreatureCall();
              game.spawnFloatText(`🐾 ${fauna.speciesRef?.commonName}이(가) 기뻐합니다! ❤️`, undefined, undefined, '#fb7185');
            }
          }
        }
      }
    }

    // Knowledge Stone interactions on surface
    if (curPlanet?.knowledgeStones) {
      for (const ks of curPlanet.knowledgeStones) {
        if (ks.isCollected) continue;
        const kx = ks.lx * 0.15;
        const kz = ks.ly * 0.15;
        const distToKS = Math.hypot(this.travelerPos.x - kx, this.travelerPos.z - kz);
        if (distToKS < 8.0) {
          game.data.interactLabel = `🗿 [E] 지식의 돌 활성화 (${ks.race} 어휘 습득)`;
          if (kb.e === 1 || tc.isInteracting) {
            ks.isCollected = true;
            NmsAudioEngine.getInstance().playDiscoveryFanfare();
            game.spawnFloatText(`🗿 ${ks.race} 외계어 어휘 습득: "${ks.word}"`, undefined, undefined, '#c084fc');
            game.data.nanites += 45;
          }
          break;
        }
      }
    }

    // Update 3D Sentinel Drone patrol & scan
    if (this.sentinelDroneGroup) {
      this.sentinelDroneGroup.visible = true;
      const baseGround = getTerrainHeight(this.sentinelDroneGroup.position.x, this.sentinelDroneGroup.position.z);
      this.sentinelDroneGroup.position.y = baseGround + 3.4 + Math.sin(this.totalElapsedTime * 3.5) * 0.45;

      const distToPlayer = this.sentinelDroneGroup.position.distanceTo(this.travelerPos);
      if (distToPlayer < 35.0) {
        const lookTarget = this.travelerPos.clone();
        lookTarget.y = this.sentinelDroneGroup.position.y;
        this.sentinelDroneGroup.lookAt(lookTarget);

        const scanCone = this.sentinelDroneGroup.getObjectByName('scanner_cone');
        if (scanCone) {
          scanCone.visible = distToPlayer < 24.0 || isMining;
        }
      } else {
        this.sentinelDroneGroup.rotation.y += delta * 0.35;
      }
    }

    // Audio synthesis feedback
    NmsAudioEngine.getInstance().setJetpack(isJetpackActive);
    NmsAudioEngine.getInstance().setMiningLaser(isMining && (toolMode === 'MINING BEAM' || toolMode === 'TERRAIN MANIPULATOR'));

    // Multi-Tool Beam & FX (Mining Beam, Terrain Manipulator, Boltcaster)
    if (this.miningBeamMesh && this.travelerGroup) {
      if (isMining) {
        this.miningBeamMesh.visible = true;
        const toolPos = this.travelerPos.clone().add(new THREE.Vector3(0.55, 1.4, 0.65).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.travelerYaw));
        const forwardDir = new THREE.Vector3(Math.sin(this.travelerYaw), -0.15, Math.cos(this.travelerYaw)).normalize();
        const targetBeam = toolPos.clone().add(forwardDir.multiplyScalar(16.0));
        const geo = this.miningBeamMesh.geometry as THREE.BufferGeometry;
        geo.setFromPoints([toolPos, targetBeam]);

        // Adapt beam shader colors to active No Man's Sky tool mode
        const lineMat = this.miningBeamMesh.material as THREE.LineBasicMaterial;
        if (toolMode === 'TERRAIN MANIPULATOR') {
          lineMat.color.setHex(0x00f5ff); // Cyan excavation
          if (this.miningSparksMesh) {
            (this.miningSparksMesh.material as THREE.PointsMaterial).color.setHex(0x00e5ff);
          }
        } else if (toolMode === 'BOLTCASTER') {
          lineMat.color.setHex(0xfacc15); // Golden plasma bolts
          if (this.miningSparksMesh) {
            (this.miningSparksMesh.material as THREE.PointsMaterial).color.setHex(0xffea00);
          }
          const now = performance.now();
          if (now - this.lastToolShotTime > 150) {
            NmsAudioEngine.getInstance().playBoltcasterShot();
            this.lastToolShotTime = now;
          }
        } else if (toolMode === 'VOLTAIC STAFF') {
          lineMat.color.setHex(0x10b981); // Emerald staff
          if (this.miningSparksMesh) {
            (this.miningSparksMesh.material as THREE.PointsMaterial).color.setHex(0x34d399);
          }
        } else {
          lineMat.color.setHex(0xff7700); // Iconic Mining Beam orange
          if (this.miningSparksMesh) {
            (this.miningSparksMesh.material as THREE.PointsMaterial).color.setHex(0xffaa00);
          }
        }

        if (this.miningSparksMesh) {
          this.miningSparksMesh.visible = true;
          this.miningSparksMesh.position.copy(targetBeam);
        }

        // Mineral extraction yield
        if (!game.isAutoPilot) {
          if (toolMode === 'TERRAIN MANIPULATOR') {
            game.data.inv.silicate = (game.data.inv.silicate || 0) + 2;
          } else {
            game.data.inv.ferrite = (game.data.inv.ferrite || 0) + 1;
            game.data.inv.carbon = (game.data.inv.carbon || 0) + 1;
          }
        }
      } else {
        this.miningBeamMesh.visible = false;
        if (this.miningSparksMesh) this.miningSparksMesh.visible = false;
      }
    }

    // Dynamic 3D Base Housing & Settlement Colony Animations
    if (this.surfaceTerrainGroup) {
      // Spinning Base Computer Hologram Ring
      const holoRing = this.surfaceTerrainGroup.getObjectByName('base_computer_holo_ring');
      if (holoRing) {
        holoRing.rotation.z += delta * 1.8;
        holoRing.rotation.y += delta * 0.9;
      }

      // Pulsing Construction Blueprint Scaffold
      const holoScaffold = this.surfaceTerrainGroup.getObjectByName('holo_scaffold');
      if (holoScaffold && holoScaffold instanceof THREE.Mesh) {
        (holoScaffold.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(this.totalElapsedTime * 4.5) * 0.22;
      }

      // Flashing Settlement Radio Tower Warning Beacon
      const spireBeacon = this.surfaceTerrainGroup.getObjectByName('settlement_spire_beacon');
      if (spireBeacon && spireBeacon instanceof THREE.Mesh) {
        (spireBeacon.material as THREE.MeshBasicMaterial).color.setHex(
          Math.floor(this.totalElapsedTime * 3) % 2 === 0 ? 0xef4444 : 0x7f1d1d
        );
      }

      // Idle breathing and greeting movements for Settlement NPC citizens
      ['citizen_korvax', 'citizen_vykeen', 'citizen_gek'].forEach((cName, cIdx) => {
        const citizen = this.surfaceTerrainGroup?.getObjectByName(cName);
        if (citizen) {
          citizen.position.y = Math.sin(this.totalElapsedTime * 2.2 + cIdx * 1.5) * 0.15;
          citizen.rotation.y = Math.sin(this.totalElapsedTime * 0.8 + cIdx) * 0.25;
        }
      });
    }
  }

  // =========================================================================
  // --- WARP HYPERSPACE TUNNEL MODE ---
  // =========================================================================
  private handleWarpMode(delta: number) {
    if (this.warpTunnelGroup) {
      this.warpTunnelGroup.visible = true;
      this.warpTunnelGroup.rotation.z += delta * 2.5;

      this.warpTunnelGroup.children.forEach((child) => {
        child.position.z += delta * 480;
        if (child.position.z > 80) child.position.z -= 2000;
      });
    }

    this.rendererSys.setAtmosphereFog('#1e003b', 0.008);
    if (this.starshipGroup) {
      this.starshipGroup.visible = true;
      this.starshipGroup.position.set(0, 0, 0);
      this.starshipGroup.rotation.set(0, 0, Math.sin(this.totalElapsedTime * 6) * 0.08);
    }
    if (this.travelerGroup) this.travelerGroup.visible = false;
    if (this.surfaceTerrainGroup) this.surfaceTerrainGroup.visible = false;
  }

  public set3DSceneMode(mode: Three3DSceneMode) {
    this.current3DSceneMode = mode;

    switch (mode) {
      case 'DERELICT_FREIGHTER':
        if (this.derelictFreighterGroup) {
          this.shipPos.set(-180, 25, 230);
          this.shipYaw = 0;
          this.shipPitch = 0.05;
          this.orbitYaw = 0;
          this.orbitPitch = 0.15;
          this.triggerScanner();
        }
        break;
      case 'EVA_SPACEWALK':
        if (this.derelictFreighterGroup) {
          this.shipPos.set(-180, 25, 230);
          this.travelerPos.set(-180, 26, 275);
          this.orbitYaw = Math.PI;
          this.orbitPitch = 0.2;
        }
        break;
      case 'BLACK_HOLE':
        if (this.blackHoleGroup) {
          this.shipPos.set(380, 0, -360);
          this.shipYaw = Math.PI;
          this.orbitYaw = Math.PI;
          this.orbitPitch = 0.1;
        }
        break;
      case 'SPACE_STATION':
        if (this.spaceStationGroup) {
          const st = game.entities.station;
          if (st) {
            this.shipPos.set(st.x * 0.1, 0, st.y * 0.1 - 45);
            this.shipYaw = 0;
            this.orbitYaw = 0;
          }
        }
        break;
      case 'SHIP_HANGAR':
        this.orbitYaw = this.totalElapsedTime * 0.5;
        this.orbitPitch = 0.25;
        // Ensure ship is positioned cleanly at hangar bay/station, not trapped inside derelict freighter
        if (this.derelictFreighterGroup && this.shipPos.distanceTo(this.derelictFreighterGroup.position) < 160) {
          const st = game.entities.station;
          if (st) {
            this.shipPos.set(st.x * 0.1, 4.0, st.y * 0.1 - 38);
          } else {
            this.shipPos.set(120, 20, 120);
          }
        }
        break;
      case 'GALAXY_MAP':
        break;
      case 'BASE_BUILDING':
        this.orbitPitch = 0.45;
        // Focus camera on the planetary base housing complex (24, 18)
        this.travelerPos.set(24, getTerrainHeight(24, 18), 18);
        this.travelerYaw = Math.PI * 0.25;
        break;
      case 'OCEAN_FISHING':
        this.orbitPitch = 0.15;
        break;
      case 'FLIGHT':
        this.cameraMode = 'CHASE';
        // Verify ship is positioned in open space, not trapped inside derelict freighter, station, or planet
        {
          const curPlanet = game.data.activePlanet || game.entities.planets[0];
          if (curPlanet) {
            const p3dX = curPlanet.x * 0.1;
            const p3dZ = curPlanet.y * 0.1;
            const orbitDist = Math.max(220, (curPlanet.r * 0.1) * 2.2);
            const distToFreighter = this.derelictFreighterGroup ? this.shipPos.distanceTo(this.derelictFreighterGroup.position) : 999;
            const distToPlanet = Math.hypot(this.shipPos.x - p3dX, this.shipPos.z - p3dZ);
            // If trapped inside derelict freighter (-180, 25, 260) or planet mesh or uninitialized
            if (distToFreighter < 160 || distToPlanet < curPlanet.r * 0.1 + 45 || isNaN(this.shipPos.x) || Math.abs(this.shipPos.y) > 1000 || this.shipPos.y < 5) {
              this.shipPos.set(p3dX + orbitDist * 0.707, 24.0, p3dZ + orbitDist * 0.707);
              this.shipYaw = Math.atan2(-orbitDist * 0.707, -orbitDist * 0.707) + Math.PI / 2;
              this.shipPitch = 0;
              this.shipRoll = 0;
              this.cameraPos.copy(this.shipPos).sub(new THREE.Vector3(0, -6, 26));
              this.cameraLookAt.copy(this.shipPos);
            }
          }
        }
        break;
      default:
        break;
    }
  }

  // =========================================================================
  // --- CRITICALLY DAMPED JITTER-FREE CAMERA RIG (No Man's Sky Camera) ---
  // =========================================================================
  private updateCamera(delta: number) {
    const isPlanet = game.currState === 'PLANET';

    // 1. Dedicated 3D Scene Mode Cinematic Framing
    if (this.current3DSceneMode === 'DERELICT_FREIGHTER' && this.derelictFreighterGroup) {
      const fPos = this.derelictFreighterGroup.position;
      const angle = this.totalElapsedTime * 0.15;
      const camDist = 95.0;
      this.targetCamPos.set(
        fPos.x + Math.sin(angle) * camDist,
        fPos.y + 24.0 + Math.sin(angle * 2) * 6,
        fPos.z + Math.cos(angle) * camDist
      );
      this.targetCamLookAt.copy(fPos).add(new THREE.Vector3(0, 12, 0));
      const damp = 1.0 - Math.exp(-8.0 * delta);
      this.cameraPos.lerp(this.targetCamPos, damp);
      this.cameraLookAt.lerp(this.targetCamLookAt, damp);
      this.rendererSys.camera.position.copy(this.cameraPos);
      this.rendererSys.camera.lookAt(this.cameraLookAt);
      return;
    }

    if (this.current3DSceneMode === 'EVA_SPACEWALK' && this.derelictFreighterGroup) {
      if (this.travelerGroup) {
        this.travelerGroup.visible = true;
        this.travelerGroup.position.set(-180, 26 + Math.sin(this.totalElapsedTime * 2) * 0.8, 275);
        this.travelerGroup.rotation.y = this.totalElapsedTime * 0.4;
      }
      this.targetCamPos.set(-180 + Math.sin(this.totalElapsedTime * 0.3) * 6, 27, 285);
      this.targetCamLookAt.set(-180, 26, 275);
      const damp = 1.0 - Math.exp(-8.0 * delta);
      this.cameraPos.lerp(this.targetCamPos, damp);
      this.cameraLookAt.lerp(this.targetCamLookAt, damp);
      this.rendererSys.camera.position.copy(this.cameraPos);
      this.rendererSys.camera.lookAt(this.cameraLookAt);
      return;
    }

    if (this.current3DSceneMode === 'BLACK_HOLE' && this.blackHoleGroup) {
      const bhPos = this.blackHoleGroup.position;
      const angle = this.totalElapsedTime * 0.2;
      const camDist = 72.0;
      this.targetCamPos.set(
        bhPos.x + Math.sin(angle) * camDist,
        bhPos.y + 16.0,
        bhPos.z + Math.cos(angle) * camDist
      );
      this.targetCamLookAt.copy(bhPos);
      const damp = 1.0 - Math.exp(-8.0 * delta);
      this.cameraPos.lerp(this.targetCamPos, damp);
      this.cameraLookAt.lerp(this.targetCamLookAt, damp);
      this.rendererSys.camera.position.copy(this.cameraPos);
      this.rendererSys.camera.lookAt(this.cameraLookAt);
      return;
    }

    if (this.current3DSceneMode === 'SHIP_HANGAR' && this.starshipGroup) {
      const angle = this.totalElapsedTime * 0.45;
      const dist = 26.0;
      this.targetCamPos.set(
        this.shipPos.x + Math.sin(angle) * dist,
        this.shipPos.y + 6.5,
        this.shipPos.z + Math.cos(angle) * dist
      );
      this.targetCamLookAt.copy(this.shipPos).add(new THREE.Vector3(0, 0.8, 0));
      const damp = 1.0 - Math.exp(-8.0 * delta);
      this.cameraPos.lerp(this.targetCamPos, damp);
      this.cameraLookAt.lerp(this.targetCamLookAt, damp);
      this.rendererSys.camera.position.copy(this.cameraPos);
      this.rendererSys.camera.lookAt(this.cameraLookAt);
      return;
    }

    if (this.current3DSceneMode === 'GALAXY_MAP') {
      this.targetCamPos.set(0, 160, 120);
      this.targetCamLookAt.set(0, 0, 0);
      const damp = 1.0 - Math.exp(-8.0 * delta);
      this.cameraPos.lerp(this.targetCamPos, damp);
      this.cameraLookAt.lerp(this.targetCamLookAt, damp);
      this.rendererSys.camera.position.copy(this.cameraPos);
      this.rendererSys.camera.lookAt(this.cameraLookAt);
      return;
    }

    if (this.cameraMode === 'COCKPIT') {
      if (isPlanet) {
        // First-Person Helmet View
        this.targetCamPos.copy(this.travelerPos).add(new THREE.Vector3(0, 2.15, 0.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.orbitYaw));
        const lookDir = new THREE.Vector3(
          Math.sin(this.orbitYaw) * Math.cos(this.orbitPitch),
          Math.sin(this.orbitPitch),
          Math.cos(this.orbitYaw) * Math.cos(this.orbitPitch)
        );
        this.targetCamLookAt.copy(this.targetCamPos).add(lookDir.multiplyScalar(25));
      } else {
        // First-Person Starship Cockpit Canopy View
        const forward = new THREE.Vector3(
          Math.sin(this.shipYaw) * Math.cos(this.shipPitch),
          Math.sin(this.shipPitch),
          Math.cos(this.shipYaw) * Math.cos(this.shipPitch)
        );
        this.targetCamPos.copy(this.shipPos).add(new THREE.Vector3(0, 0.65, 0)).addScaledVector(forward, 1.2);
        this.targetCamLookAt.copy(this.targetCamPos).add(forward.clone().multiplyScalar(50));
      }

      // Snappy direct tracking in cockpit to eliminate lag
      this.cameraPos.copy(this.targetCamPos);
      this.cameraLookAt.copy(this.targetCamLookAt);
    } else if (this.cameraMode === 'ORBIT') {
      // Free Orbit Inspection Camera
      const center = isPlanet ? this.travelerPos : this.shipPos;
      const dist = isPlanet ? 14.0 : 38.0;
      const camOffset = new THREE.Vector3(
        -Math.sin(this.orbitYaw) * Math.cos(this.orbitPitch) * dist,
        Math.sin(this.orbitPitch) * dist + (isPlanet ? 2.5 : 5.0),
        -Math.cos(this.orbitYaw) * Math.cos(this.orbitPitch) * dist
      );
      this.targetCamPos.copy(center).add(camOffset);
      this.targetCamLookAt.copy(center).add(new THREE.Vector3(0, isPlanet ? 1.5 : 0, 0));

      const damp = 1.0 - Math.exp(-12.0 * delta);
      this.cameraPos.lerp(this.targetCamPos, damp);
      this.cameraLookAt.lerp(this.targetCamLookAt, damp);
    } else {
      // --- AUTHENTIC CHASE CAMERA (No Man's Sky 3rd-Person Chase) ---
      if (isPlanet) {
        // Over-the-shoulder 3rd Person View on Planet
        const dist = 7.5;
        const camOffset = new THREE.Vector3(
          -Math.sin(this.orbitYaw) * Math.cos(this.orbitPitch) * dist,
          Math.sin(this.orbitPitch) * dist + 3.2,
          -Math.cos(this.orbitYaw) * Math.cos(this.orbitPitch) * dist
        );
        this.targetCamPos.copy(this.travelerPos).add(camOffset);
        this.targetCamLookAt.copy(this.travelerPos).add(new THREE.Vector3(0, 1.6, 0));

        // Exponential smoothing (Mathematically guaranteed zero jitter!)
        const damp = 1.0 - Math.exp(-14.0 * delta);
        this.cameraPos.lerp(this.targetCamPos, damp);
        this.cameraLookAt.lerp(this.targetCamLookAt, damp);
      } else {
        // 3rd Person Starship Chase Cam
        const forward = new THREE.Vector3(
          Math.sin(this.shipYaw) * Math.cos(this.shipPitch),
          Math.sin(this.shipPitch),
          Math.cos(this.shipYaw) * Math.cos(this.shipPitch)
        );

        // Camera pulls back dynamically based on flight speed
        const speedRatio = Math.min(1.8, this.shipSpeed / 30.0);
        const chaseDist = 24.0 + speedRatio * 14.0;
        const chaseHeight = 6.5 + speedRatio * 3.5;

        // Position camera behind the ship
        this.targetCamPos.copy(this.shipPos)
          .sub(forward.clone().multiplyScalar(chaseDist))
          .add(new THREE.Vector3(0, chaseHeight, 0));

        // Look at slightly ahead of the starship's nose
        this.targetCamLookAt.copy(this.shipPos).add(forward.clone().multiplyScalar(18.0));

        // Dynamic FOV expansion during pulse drive or boost
        const targetFov = game.data.isPulseActive ? 85 : (this.shipSpeed > 25 ? 75 : 65);
        this.rendererSys.camera.fov += (targetFov - this.rendererSys.camera.fov) * delta * 4.0;
        this.rendererSys.camera.updateProjectionMatrix();

        // Critically damped spring lerp
        const damp = 1.0 - Math.exp(-10.0 * delta);
        this.cameraPos.lerp(this.targetCamPos, damp);
        this.cameraLookAt.lerp(this.targetCamLookAt, damp);
      }
    }

    // Mathematical safety guard against NaN or non-finite values (prevents black screen)
    if (isNaN(this.cameraPos.x) || isNaN(this.cameraPos.y) || isNaN(this.cameraPos.z)) {
      this.cameraPos.copy(this.targetCamPos);
    }
    if (isNaN(this.cameraLookAt.x) || isNaN(this.cameraLookAt.y) || isNaN(this.cameraLookAt.z)) {
      this.cameraLookAt.copy(this.targetCamLookAt);
    }

    this.rendererSys.camera.position.copy(this.cameraPos);
    this.rendererSys.camera.lookAt(this.cameraLookAt);
  }

  // Transitions
  private transitionToPlanetSurface(planet: PlanetEntity) {
    NmsAudioEngine.getInstance().playAtmosphereBurn();
    NmsAudioEngine.getInstance().playDiscoveryFanfare();
    NmsAudioEngine.getInstance().playExosuitVoice(`Atmosphere entered. Planetary landing confirmed on ${planet.name}.`);
    game.triggerMilestoneBanner({
      category: '행성 착륙 // PLANET LANDING',
      title: planet.name,
      subTitle: `3D 지표면 탐사 개시 // 생물군계: ${planet.type}`,
      rank: 'SURFACE EXPLORER',
      color: planet.color || '#10b981'
    });
    game.spawnFloatText(`🌍 [${planet.name}] 행성 표면 착륙 성공! (생물군계: ${planet.type})`, undefined, undefined, '#10b981');

    const tX = (game.player.px || 0) * 0.15;
    const tZ = (game.player.py || 0) * 0.15;
    const groundY = getTerrainHeight(tX, tZ);
    this.travelerPos.set(tX, groundY, tZ);
    this.travelerVelY = 0;
    this.isGrounded = true;
    this.orbitYaw = this.shipYaw;

    // Place parked starship accurately beside landing site
    this.shipPos.set(tX, groundY + 0.6, tZ);
    this.shipPitch = 0;
    this.shipRoll = 0;
    this.shipSpeed = 0;
    this.shipTargetSpeed = 0;
    if (this.starshipGroup) {
      this.starshipGroup.position.set(tX, groundY + 0.6, tZ);
      this.starshipGroup.rotation.set(0, this.shipYaw, 0);
      this.starshipGroup.visible = true;
    }

    // Switch visual mode: Hide spherical planet spheres, show flat detailed surface terrain
    this.planetGroups.forEach((pg) => (pg.visible = false));
    if (this.surfaceTerrainGroup) this.surfaceTerrainGroup.visible = true;
    if (this.travelerGroup) this.travelerGroup.visible = true;
    this.rendererSys.setAtmosphereFog(planet.color || '#38bdf8', 0.0035);

    this.faunaGroupMap.forEach((fg) => {
      fg.visible = true;
    });
  }

  private transitionToSpaceFlight() {
    game.insidePlanetInFlight = null;
    NmsAudioEngine.getInstance().setJetpack(false);
    NmsAudioEngine.getInstance().setMiningLaser(false);
    NmsAudioEngine.getInstance().playPulseDrive();
    NmsAudioEngine.getInstance().playExosuitVoice('Orbit achieved. Space flight engines online.');
    game.triggerMilestoneBanner({
      category: '성간 항법 // SPACE FLIGHT',
      title: '궤도 탈출 및 우주 비행',
      subTitle: '초광속 펄스 드라이브 준비 완료 // 무중력 궤도 진입',
      rank: 'ORBITAL ACE',
      color: '#00e5ff'
    });
    game.spawnFloatText('🚀 궤도 탈출 성공 // 성간 우주 비행 모드 전환', undefined, undefined, '#00e5ff');

    this.faunaGroupMap.forEach((fg) => {
      fg.visible = false;
    });

    // Re-enable space sky and planet spheres
    this.planetGroups.forEach((pg) => (pg.visible = true));
    if (this.surfaceTerrainGroup) this.surfaceTerrainGroup.visible = false;
    this.rendererSys.setAtmosphereFog(null);

    const curPlanet = game.data.activePlanet || game.entities.planets[0];
    if (curPlanet) {
      const p3dX = curPlanet.x * 0.1;
      const p3dZ = curPlanet.y * 0.1;
      const orbitDist = Math.max(220, (curPlanet.r * 0.1) * 2.2);
      this.shipPos.set(p3dX + orbitDist * 0.707, 18.0, p3dZ + orbitDist * 0.707);
      this.shipYaw = Math.atan2(-orbitDist * 0.707, -orbitDist * 0.707) + Math.PI / 2;
    }
    this.shipSpeed = 12.0;
    this.shipTargetSpeed = 18.0;
  }

  private emitThrusterParticles(origin: THREE.Vector3, forward: THREE.Vector3, power: number) {
    if (!this.thrusterParticles) return;
    const behindVec = forward.clone().negate();

    const count = Math.floor(4 * power);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * 300);
      const spread = (Math.random() - 0.5) * 0.6;
      this.thrusterPosArray[idx * 3] = origin.x + behindVec.x * 3.8 + spread;
      this.thrusterPosArray[idx * 3 + 1] = origin.y + behindVec.y * 3.8 + (Math.random() - 0.5) * 0.4;
      this.thrusterPosArray[idx * 3 + 2] = origin.z + behindVec.z * 3.8 + spread;
      this.thrusterLifetime[idx] = 1.0;
    }

    this.thrusterParticles.geometry.attributes.position.needsUpdate = true;
  }

  private spawnExplosion(pos: THREE.Vector3, count: number, colorHex: number) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 28
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: 2.2,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Points(geo, mat);
    this.rendererSys.scene.add(mesh);
    this.explosionParticles.push({ mesh, velocities, life: 0.65, maxLife: 0.65 });
  }

  private updatePirateCombat(delta: number) {
    for (let i = this.pirateShips.length - 1; i >= 0; i--) {
      const p = this.pirateShips[i];
      if (p.hp > 0) {
        p.mesh.rotation.y += delta * 0.8;
        p.pos.addScaledVector(new THREE.Vector3(0, 0, -1), delta * 8);
        p.mesh.position.copy(p.pos);
      }
    }
  }

  public render() {
    // High-Precision Monotonic Delta Clamping (Guarantees zero micro-stutter)
    const now = performance.now();
    const rawDelta = (now - this.lastPerfTime) / 1000.0;
    this.lastPerfTime = now;
    const delta = Math.min(0.05, Math.max(0.001, rawDelta));

    this.update(delta);
    this.rendererSys.render();
  }

  public resize(width: number, height: number) {
    this.rendererSys.resize(width, height);
  }

  public dispose() {
    this.rendererSys.dispose();
  }
}
