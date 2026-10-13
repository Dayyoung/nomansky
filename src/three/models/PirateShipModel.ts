import * as THREE from 'three';

export interface PirateShipEntity3D {
  id: string;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  yaw: THREE.Vector3;
  hp: number;
  maxHp: number;
  fireCooldown: number;
  bankRoll: number;
  evasionTimer: number;
}

/**
 * Procedural 3D Pirate Interceptor Starship (Outlaws Expansion)
 */
export class PirateShipBuilder {
  public static createPirateShip(id: string = 'pirate_1'): PirateShipEntity3D {
    const group = new THREE.Group();
    group.name = `pirate_${id}`;

    // Aggressive Outlaw Dark Metallic & Crimson Pirate Color Scheme
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x1f242b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const crimsonMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      emissive: 0x59000b,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.35,
    });
    const cockpitGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xff0033,
      emissive: 0x770011,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.4,
      transparent: true,
      opacity: 0.9,
    });
    const thrusterGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff1100,
    });

    // 1. Sleek Jagged Fuselage
    const fuselageGeo = new THREE.ConeGeometry(1.4, 6.8, 6);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.scale.set(1.2, 0.6, 1.0);
    fuselage.castShadow = true;
    group.add(fuselage);

    // 2. Cockpit Visor
    const cockpitGeo = new THREE.CapsuleGeometry(0.55, 1.8, 6, 12);
    cockpitGeo.rotateX(Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitGlassMat);
    cockpit.position.set(0, 0.45, 0.2);
    cockpit.scale.set(0.85, 0.75, 1.0);
    group.add(cockpit);

    // 3. Forward-Swept Razor Wings with Crimson Trim
    [-1, 1].forEach((side) => {
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0);
      wingShape.lineTo(side * 4.2, 1.2); // Forward sweep
      wingShape.lineTo(side * 3.8, -1.8);
      wingShape.lineTo(0, -1.4);
      wingShape.closePath();

      const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
      const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
      wingGeo.rotateX(-Math.PI / 2);

      const wing = new THREE.Mesh(wingGeo, crimsonMat);
      wing.position.set(0, 0.05, 0);
      wing.castShadow = true;
      group.add(wing);

      // Wingtip Heavy Laser Cannon Barrels
      const cannonGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.4, 8);
      cannonGeo.rotateX(Math.PI / 2);
      const cannon = new THREE.Mesh(cannonGeo, hullMat);
      cannon.position.set(side * 3.9, 0.05, 0.4);
      group.add(cannon);

      // Cannontip Flash Emitter
      const tipGeo = new THREE.SphereGeometry(0.12, 6, 6);
      const tip = new THREE.Mesh(tipGeo, thrusterGlowMat);
      tip.position.set(side * 3.9, 0.05, 1.6);
      group.add(tip);
    });

    // 4. Twin Afterburning Pirate Thruster Exhausts
    [-0.55, 0.55].forEach((offX) => {
      const thrusterGeo = new THREE.CylinderGeometry(0.35, 0.48, 1.4, 8);
      thrusterGeo.rotateX(Math.PI / 2);
      const thruster = new THREE.Mesh(thrusterGeo, hullMat);
      thruster.position.set(offX, 0.1, -3.2);
      group.add(thruster);

      const nozzleGlow = new THREE.Mesh(new THREE.CircleGeometry(0.38, 12), thrusterGlowMat);
      nozzleGlow.position.set(offX, 0.1, -3.91);
      nozzleGlow.rotateY(Math.PI);
      group.add(nozzleGlow);
    });

    // 5. Dorsal Fin Stabilizer
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0, 1.6);
    finShape.lineTo(-1.8, 0);
    finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.1, bevelEnabled: false });
    finGeo.rotateY(Math.PI / 2);
    const fin = new THREE.Mesh(finGeo, crimsonMat);
    fin.position.set(0.05, 0.4, -1.2);
    group.add(fin);

    // Initial scale and orientation
    group.scale.setScalar(1.15);

    return {
      id,
      mesh: group,
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      yaw: new THREE.Vector3(),
      hp: 120,
      maxHp: 120,
      fireCooldown: 0,
      bankRoll: 0,
      evasionTimer: Math.random() * 5,
    };
  }
}
