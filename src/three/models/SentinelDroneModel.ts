import * as THREE from 'three';
import { PlanetSentinelEntity } from '../../types';
import { getTerrainHeight } from './TerrainModel';

export class SentinelDroneModel {
  /**
   * Builds an authentic 3D No Man's Sky Sentinel Surveillance / Combat Drone (센티넬 경계·전투·타락 드론)
   * Preserves wing_l, wing_r, and scanner_cone node names for engine animation.
   */
  public static createSentinelMesh(sentinel: PlanetSentinelEntity): THREE.Group {
    const sentinelGroup = new THREE.Group();
    sentinelGroup.name = `sentinel_${sentinel.id}`;

    const sx = sentinel.lx * 0.15;
    const sz = sentinel.ly * 0.15;
    const groundY = getTerrainHeight(sx, sz);
    sentinelGroup.position.set(sx, groundY + 3.2, sz);

    // Deterministically check if this drone is a Corrupted (Atlantideum) variant
    const idStr = String(sentinel.id || '0');
    const isCorrupted = idStr.charCodeAt(idStr.length - 1) % 3 === 0;

    // Matte-satin materials (zero harsh sunlight glare)
    const armorMat = new THREE.MeshStandardMaterial({
      color: isCorrupted ? 0x312e81 : 0xe2e8f0,
      metalness: 0.35,
      roughness: 0.65,
      flatShading: true,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.55,
    });
    const orangeCowlMat = new THREE.MeshStandardMaterial({
      color: isCorrupted ? 0x7e22ce : 0xea580c,
      metalness: 0.3,
      roughness: 0.6,
      flatShading: true,
    });
    const eyeGlowMat = new THREE.MeshBasicMaterial({
      color: isCorrupted ? 0xd946ef : 0xff1744,
    });
    const pupilMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    // 1. Central Spherical Core Chassis
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 1), darkMetalMat);
    core.castShadow = true;
    sentinelGroup.add(core);

    // 2. Iconic Curved Upper Carapace Cowl (Sentinel Orange / Corrupted Violet)
    const cowlGeo = new THREE.SphereGeometry(0.92, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const cowl = new THREE.Mesh(cowlGeo, orangeCowlMat);
    cowl.position.set(0, 0.12, -0.05);
    cowl.rotation.x = -0.2;
    cowl.castShadow = true;
    sentinelGroup.add(cowl);

    // Front White Armor Faceplate
    const facePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.48, 0.35, 8), armorMat);
    facePlate.rotation.x = Math.PI / 2;
    facePlate.position.set(0, -0.02, 0.62);
    sentinelGroup.add(facePlate);

    // 3. Iconic Multi-Ring Red Cyclops Ocular Sensor
    const eyeBezel = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 8, 20), darkMetalMat);
    eyeBezel.position.set(0, 0, 0.8);
    sentinelGroup.add(eyeBezel);

    const eyeLens = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), eyeGlowMat);
    eyeLens.position.set(0, 0, 0.82);
    eyeLens.scale.set(1.0, 1.0, 0.35);
    sentinelGroup.add(eyeLens);

    const eyePupil = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.14, 16), pupilMat);
    eyePupil.position.set(0, 0, 0.94);
    sentinelGroup.add(eyePupil);

    // 4. Ventral Twin Blaster Turret Pod
    const gunMount = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.55), darkMetalMat);
    gunMount.position.set(0, -0.78, 0.15);
    sentinelGroup.add(gunMount);

    [-0.14, 0.14].forEach((gx) => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.55, 8), armorMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(gx, -0.82, 0.48);
      sentinelGroup.add(barrel);
    });

    // 5. Corrupted Atlantideum Crystal Shards (for Dissonant Sentinels)
    if (isCorrupted) {
      const shardMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
      [-0.45, 0.45, 0].forEach((sxOff, idx) => {
        const shard = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.65, 5), shardMat);
        shard.position.set(sxOff, 0.88, -0.15 + idx * 0.1);
        shard.rotation.set(-0.3, 0, sxOff * 0.6);
        sentinelGroup.add(shard);
      });
    }

    // 6. Left & Right Articulated Anti-Gravity Sensor Wings (wing_l, wing_r)
    [-0.98, 0.98].forEach((xOff, idx) => {
      const wingGroup = new THREE.Group();
      wingGroup.name = idx === 0 ? 'wing_l' : 'wing_r';
      wingGroup.position.set(xOff, 0.08, -0.05);

      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45), darkMetalMat);
      strut.rotation.z = Math.PI / 2;
      wingGroup.add(strut);

      // Angled Armor Wing Shield
      const shieldFin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.95, 0.65), armorMat);
      shieldFin.position.set(xOff > 0 ? 0.18 : -0.18, 0, 0);
      shieldFin.rotation.z = xOff > 0 ? -0.18 : 0.18;
      shieldFin.castShadow = true;
      wingGroup.add(shieldFin);

      // Anti-gravity thruster emitter
      const thrusterGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.03, 0.3, 8),
        new THREE.MeshBasicMaterial({
          color: isCorrupted ? 0xd946ef : 0x38bdf8,
          transparent: true,
          opacity: 0.75,
        })
      );
      thrusterGlow.position.set(xOff > 0 ? 0.18 : -0.18, -0.55, 0);
      wingGroup.add(thrusterGlow);

      sentinelGroup.add(wingGroup);
    });

    // 7. Volumetric Downward Surveillance Laser Scan Cone
    const scanConeGeo = new THREE.ConeGeometry(1.6, 4.5, 16, 1, true);
    scanConeGeo.rotateX(Math.PI);
    const scanConeMat = new THREE.MeshBasicMaterial({
      color: isCorrupted ? 0xc084fc : 0xff1744,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanCone = new THREE.Mesh(scanConeGeo, scanConeMat);
    scanCone.name = 'scanner_cone';
    scanCone.position.set(0, -2.2, 0.5);
    scanCone.visible = sentinel.state === 'INVESTIGATE' || sentinel.state === 'ATTACK';
    sentinelGroup.add(scanCone);

    return sentinelGroup;
  }
}
