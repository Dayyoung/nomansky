import * as THREE from 'three';
import { ShipType } from '../../types';

/**
 * Creates rich procedural 3D Starship meshes matching No Man's Sky starship classes
 */
export class StarshipBuilder {
  public static createStarship(type: ShipType = 'MECHANICAL', customColor?: number): THREE.Group {
    const shipGroup = new THREE.Group();
    shipGroup.name = `starship_${type}`;

    switch (type) {
      case 'SOLAR':
        this.buildSolarShip(shipGroup, customColor);
        break;
      case 'INTERCEPTOR':
        this.buildInterceptorShip(shipGroup, customColor);
        break;
      case 'LIVING':
        this.buildLivingShip(shipGroup, customColor);
        break;
      case 'UTOPIA_SPEEDER':
        this.buildSpeederShip(shipGroup, customColor);
        break;
      case 'MECHANICAL':
      default:
        this.buildMechanicalFighter(shipGroup, customColor);
        break;
    }

    return shipGroup;
  }

  // --- 1. Authentic Mechanical Fighter (Alpha Vector / Radiant Pillar style) ---
  private static buildMechanicalFighter(group: THREE.Group, customColor?: number) {
    const hullMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0xcc2936, // Iconic No Man's Sky red & white or custom color
      metalness: 0.65,
      roughness: 0.35,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.5,
      roughness: 0.4,
    });
    const cockpitGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x113355,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x22262a,
      metalness: 0.85,
      roughness: 0.25,
    });
    const engineGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
    });

    // Fuselage / Main Body
    const fuselageGeo = new THREE.ConeGeometry(1.6, 7.5, 7);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.scale.set(1.1, 0.65, 1.0);
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    group.add(fuselage);

    // Cockpit Canopy
    const cockpitGeo = new THREE.CapsuleGeometry(0.7, 2.2, 8, 16);
    cockpitGeo.rotateX(Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitGlassMat);
    cockpit.position.set(0, 0.55, 0.3);
    cockpit.scale.set(0.9, 0.8, 1.1);
    group.add(cockpit);

    // Main Wings (Angled Fighter Wings)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(4.5, -1.8);
    wingShape.lineTo(4.2, -3.2);
    wingShape.lineTo(0, -2.6);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.16, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(-Math.PI / 2);

    // Left Wing
    const leftWing = new THREE.Mesh(wingGeo, accentMat);
    leftWing.position.set(0.6, 0.05, 0);
    leftWing.rotation.z = -0.06;
    leftWing.castShadow = true;
    group.add(leftWing);

    // Right Wing
    const rightWingGeo = wingGeo.clone();
    rightWingGeo.scale(-1, 1, 1);
    const rightWing = new THREE.Mesh(rightWingGeo, accentMat);
    rightWing.position.set(-0.6, 0.05, 0);
    rightWing.rotation.z = 0.06;
    rightWing.castShadow = true;
    group.add(rightWing);

    // Vertical Top Stabilizer Fin (Viper fin)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0, 1.8);
    finShape.lineTo(-1.6, 0.4);
    finShape.lineTo(-2.0, 0);
    finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.12, bevelEnabled: false });
    finGeo.rotateY(Math.PI / 2);
    const topFin = new THREE.Mesh(finGeo, hullMat);
    topFin.position.set(0.06, 0.4, -1.2);
    group.add(topFin);

    // Twin Thruster Nacelles
    [-1.2, 1.2].forEach((xPos) => {
      const nacelleGeo = new THREE.CylinderGeometry(0.48, 0.58, 2.8, 16);
      nacelleGeo.rotateX(Math.PI / 2);
      const nacelle = new THREE.Mesh(nacelleGeo, darkMetalMat);
      nacelle.position.set(xPos, 0.15, -2.2);
      group.add(nacelle);

      // Thruster Nozzle & Blue Plasma Glow Ring
      const nozzleGeo = new THREE.TorusGeometry(0.42, 0.1, 8, 24);
      const glowMesh = new THREE.Mesh(nozzleGeo, engineGlowMat);
      glowMesh.position.set(xPos, 0.15, -3.6);
      group.add(glowMesh);

      // Plasma Core Disk
      const plasmaDisk = new THREE.Mesh(new THREE.CircleGeometry(0.38, 16), engineGlowMat);
      plasmaDisk.position.set(xPos, 0.15, -3.62);
      plasmaDisk.rotation.y = Math.PI;
      group.add(plasmaDisk);
    });

    // Nose Blaster Canons
    [-0.6, 0.6].forEach((xPos) => {
      const canonGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8);
      canonGeo.rotateX(Math.PI / 2);
      const canon = new THREE.Mesh(canonGeo, darkMetalMat);
      canon.position.set(xPos, -0.2, 2.5);
      group.add(canon);
    });
  }

  // --- 2. Solar Starship (Outlaws Expansion - Glowing Hex Solar Sails) ---
  private static buildSolarShip(group: THREE.Group, customColor?: number) {
    const chromeMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0xd8c27a, // Radiant Gold/Bronze or custom color
      metalness: 0.9,
      roughness: 0.15,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1f2429,
      metalness: 0.8,
      roughness: 0.3,
    });
    const solarSailMat = new THREE.MeshPhysicalMaterial({
      color: 0x00ffcc,
      emissive: 0x00e5b0,
      emissiveIntensity: 0.6,
      transmission: 0.5,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      roughness: 0.1,
    });

    // Sleek needle body
    const bodyGeo = new THREE.ConeGeometry(1.2, 8.5, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, chromeMat);
    body.scale.set(0.85, 0.6, 1.0);
    group.add(body);

    // Cockpit
    const cockpitGeo = new THREE.SphereGeometry(0.7, 16, 16);
    cockpitGeo.scale(0.8, 0.6, 1.8);
    const cockpit = new THREE.Mesh(cockpitGeo, darkMat);
    cockpit.position.set(0, 0.4, 0.8);
    group.add(cockpit);

    // Glowing Hexagonal Solar Sails (Left and Right)
    [-1, 1].forEach((side) => {
      const sailGroup = new THREE.Group();
      sailGroup.position.set(side * 2.8, 0.3, -0.8);
      sailGroup.rotation.y = side * 0.2;

      // Sail arm
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.3), darkMat);
      arm.position.x = side * -0.6;
      sailGroup.add(arm);

      // Huge Translucent Solar Sail Membrane
      const sailGeo = new THREE.CircleGeometry(2.8, 6); // Hexagonal sail
      sailGeo.scale(1.2, 1.8, 1.0);
      const sail = new THREE.Mesh(sailGeo, solarSailMat);
      sail.rotation.x = Math.PI / 2;
      sail.rotation.z = side * 0.3;
      sailGroup.add(sail);

      group.add(sailGroup);
    });

    // Central Ion Thruster
    const ionGeo = new THREE.CylinderGeometry(0.5, 0.7, 2.0, 16);
    ionGeo.rotateX(Math.PI / 2);
    const ion = new THREE.Mesh(ionGeo, darkMat);
    ion.position.set(0, 0, -3.8);
    group.add(ion);

    const glow = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.55, 16), new THREE.MeshBasicMaterial({ color: 0x00ffcc }));
    glow.position.set(0, 0, -4.8);
    glow.rotation.y = Math.PI;
    group.add(glow);
  }

  // --- 3. Sentinel Interceptor (Interceptor Expansion - Crimson Stealth Wings) ---
  private static buildInterceptorShip(group: THREE.Group, customColor?: number) {
    const stealthMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0x181a1f,
      metalness: 0.95,
      roughness: 0.2,
    });
    const crimsonEyeMat = new THREE.MeshBasicMaterial({
      color: 0xff003c, // Menacing Sentinel Red
    });

    // Angular Fuselage
    const fuseGeo = new THREE.BoxGeometry(2.0, 1.1, 6.0);
    const fuse = new THREE.Mesh(fuseGeo, stealthMat);
    group.add(fuse);

    // Sentinel Optic Red Eye (Front Visor)
    const eyeGeo = new THREE.BoxGeometry(1.6, 0.25, 0.4);
    const eye = new THREE.Mesh(eyeGeo, crimsonEyeMat);
    eye.position.set(0, 0.2, 3.0);
    group.add(eye);

    // Quad Transforming Interceptor Wings (X-Wing style)
    const wingDefs = [
      { x: 1.8, y: 0.8, rotZ: 0.35 },
      { x: -1.8, y: 0.8, rotZ: -0.35 },
      { x: 1.8, y: -0.8, rotZ: -0.35 },
      { x: -1.8, y: -0.8, rotZ: 0.35 },
    ];
    wingDefs.forEach((w) => {
      const wingGeo = new THREE.BoxGeometry(3.2, 0.12, 1.8);
      const wing = new THREE.Mesh(wingGeo, stealthMat);
      wing.position.set(w.x, w.y, -0.6);
      wing.rotation.z = w.rotZ;
      wing.rotation.y = -0.15;
      group.add(wing);

      // Wingtip crimson flare
      const tipGeo = new THREE.BoxGeometry(0.1, 0.1, 1.5);
      const tip = new THREE.Mesh(tipGeo, crimsonEyeMat);
      tip.position.set(w.x > 0 ? 1.6 : -1.6, 0, 0);
      wing.add(tip);
    });

    // Dark Reactor Thruster
    const thruster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.0, 1.2, 12),
      new THREE.MeshBasicMaterial({ color: 0xff3355 })
    );
    thruster.rotateX(Math.PI / 2);
    thruster.position.set(0, 0, -3.2);
    group.add(thruster);
  }

  // --- 4. Living Ship (Bio-luminescent organic form) ---
  private static buildLivingShip(group: THREE.Group, customColor?: number) {
    const organicMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0xb58976,
      roughness: 0.7,
      metalness: 0.1,
    });
    const bioGlowMat = new THREE.MeshStandardMaterial({
      color: 0xe07a5f,
      emissive: 0xff4500,
      emissiveIntensity: 0.5,
      roughness: 0.4,
    });

    // Organic Head / Pod
    const headGeo = new THREE.SphereGeometry(1.6, 16, 16);
    headGeo.scale(0.9, 0.8, 1.6);
    const head = new THREE.Mesh(headGeo, organicMat);
    group.add(head);

    // Glowing Bio-vents
    [-0.6, 0.6].forEach((x) => {
      const vent = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), bioGlowMat);
      vent.position.set(x, 0.6, 0.5);
      group.add(vent);
    });

    // Organic Chitin Tendril Wings
    [-1.8, 1.8].forEach((x) => {
      const tendrilGeo = new THREE.ConeGeometry(0.6, 4.5, 8);
      tendrilGeo.rotateX(Math.PI / 2);
      const tendril = new THREE.Mesh(tendrilGeo, organicMat);
      tendril.position.set(x, -0.2, -1.0);
      tendril.rotation.z = (x > 0 ? -1 : 1) * 0.4;
      group.add(tendril);
    });

    // Bio Propulsion Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.9, 2.5, 12), bioGlowMat);
    tail.rotateX(Math.PI / 2);
    tail.position.set(0, 0, -2.5);
    group.add(tail);
  }

  // --- 5. Utopia Speeder / Boundary Herald (Racer) ---
  private static buildSpeederShip(group: THREE.Group, customColor?: number) {
    const metalMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0x3d5a80,
      metalness: 0.8,
      roughness: 0.25
    });
    const speederGeo = new THREE.BoxGeometry(1.4, 0.6, 7.0);
    const body = new THREE.Mesh(speederGeo, metalMat);
    group.add(body);

    const wingGeo = new THREE.BoxGeometry(4.8, 0.1, 1.4);
    const wings = new THREE.Mesh(wingGeo, metalMat);
    wings.position.set(0, 0, -1.2);
    group.add(wings);

    const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.5, 16), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
    thruster.rotateX(Math.PI / 2);
    thruster.position.set(0, 0, -3.8);
    group.add(thruster);
  }
}
