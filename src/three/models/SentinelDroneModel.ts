import * as THREE from 'three';
import { PlanetSentinelEntity } from '../../types';
import { getTerrainHeight } from './TerrainModel';

export class SentinelDroneModel {
  /**
   * Builds an authentic 3D No Man's Sky Sentinel Surveillance Drone (센티넬 경계 드론)
   */
  public static createSentinelMesh(sentinel: PlanetSentinelEntity): THREE.Group {
    const sentinelGroup = new THREE.Group();
    sentinelGroup.name = `sentinel_${sentinel.id}`;

    // Base position above terrain
    const sx = sentinel.lx * 0.15;
    const sz = sentinel.ly * 0.15;
    const groundY = getTerrainHeight(sx, sz);
    sentinelGroup.position.set(sx, groundY + 3.2, sz);

    // 1. Armored Main Chassis (Industrial White & Sentinel Orange)
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0xecf0f1,
      metalness: 0.7,
      roughness: 0.25,
      flatShading: true,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.85,
      roughness: 0.2,
    });
    const orangeStripeMat = new THREE.MeshStandardMaterial({
      color: 0xe67e22,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Central chassis
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85), armorMat);
    body.castShadow = true;
    sentinelGroup.add(body);

    // Orange livery accent plate
    const accentPlate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.9), orangeStripeMat);
    accentPlate.position.y = 0.25;
    sentinelGroup.add(accentPlate);

    // 2. Iconic Glowing Red Sentinel Cyclops Eye (오큘러 센서)
    const eyeLensGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const eye = new THREE.Mesh(eyeLensGeo, eyeMat);
    eye.position.set(0, 0, 0.75);
    eye.scale.set(1.0, 1.0, 0.45);
    sentinelGroup.add(eye);

    // Eye visor bezel ring
    const eyeBezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.08, 8, 16),
      darkMetalMat
    );
    eyeBezel.position.set(0, 0, 0.72);
    sentinelGroup.add(eyeBezel);

    // 3. Left and Right Anti-Gravity Propulsion Wings / Nacelles
    [-0.95, 0.95].forEach((xOff, idx) => {
      const wingGroup = new THREE.Group();
      wingGroup.name = idx === 0 ? 'wing_l' : 'wing_r';
      wingGroup.position.set(xOff, 0.1, -0.1);

      // Strut
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5), darkMetalMat);
      strut.rotation.z = Math.PI / 2;
      wingGroup.add(strut);

      // Wing pod
      const pod = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.1, 5), armorMat);
      pod.rotation.x = Math.PI / 2;
      pod.position.set(xOff > 0 ? 0.2 : -0.2, 0, 0);
      pod.castShadow = true;
      wingGroup.add(pod);

      // Antigrav blue thruster emitter glow
      const thrusterGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.04, 0.35, 8),
        new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 })
      );
      thrusterGlow.position.set(xOff > 0 ? 0.2 : -0.2, -0.4, 0);
      wingGroup.add(thrusterGlow);

      sentinelGroup.add(wingGroup);
    });

    // 4. Downward Scanning Surveillance Beam Cone (선택적 가시화)
    const scanConeGeo = new THREE.ConeGeometry(1.6, 4.5, 12, 1, true);
    scanConeGeo.rotateX(Math.PI);
    const scanConeMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const scanCone = new THREE.Mesh(scanConeGeo, scanConeMat);
    scanCone.name = 'scanner_cone';
    scanCone.position.set(0, -2.2, 0.5);
    scanCone.visible = sentinel.state === 'INVESTIGATE' || sentinel.state === 'ATTACK';
    sentinelGroup.add(scanCone);

    return sentinelGroup;
  }
}
