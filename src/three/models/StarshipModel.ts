import * as THREE from 'three';
import { ShipType } from '../../types';

/**
 * Creates rich procedural 3D Starship meshes matching iconic No Man's Sky starship classes:
 * - MECHANICAL: Radiant Pillar BC1 / Horizon Omega Fighter (Rasa nose, astromech dome, winglets, triple thrusters)
 * - SOLAR: Outlaws Podracer-style Twin-Nacelle Solar Sail Ship with hexagonal energy sails
 * - INTERCEPTOR: Sentinel Interceptor with forward mandibles, red optic visor, and quad folding wings
 * - LIVING: Starbirth Bio-Ship with chitin carapace, neural veins, and organic tendrils
 * - UTOPIA_SPEEDER: Expedition 9 Wedge Speeder with airbrake flaps and heavy cannons
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

  // --- 1. Authentic Mechanical Fighter (Radiant Pillar BC1 / Horizon Omega style) ---
  private static buildMechanicalFighter(group: THREE.Group, customColor?: number) {
    const hullMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0xcc2936,
      metalness: 0.38,
      roughness: 0.65,
      flatShading: true,
    });
    const whiteAccentMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.3,
      roughness: 0.7,
      flatShading: true,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.45,
      roughness: 0.6,
    });
    const canopyGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.35,
      roughness: 0.45,
    });
    const engineGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });
    const amberLightMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
    });

    // 1. Sculpted Rasa Fighter Nose & Main Fuselage
    const fuselageGeo = new THREE.ConeGeometry(1.55, 7.6, 8);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
    fuselage.scale.set(1.12, 0.68, 1.0);
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    group.add(fuselage);

    // Upper White Spine Fairing
    const spine = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 4.8), whiteAccentMat);
    spine.position.set(0, 0.42, -0.6);
    group.add(spine);

    // Front Radiator Intake Grille at Nose Tip
    const noseIntake = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.6, 8), darkMetalMat);
    noseIntake.rotation.x = Math.PI / 2;
    noseIntake.position.set(0, -0.05, 3.6);
    group.add(noseIntake);

    // 2. Framed Bubble Cockpit Canopy + Canopy Struts
    const cockpitGeo = new THREE.CapsuleGeometry(0.68, 2.0, 8, 12);
    cockpitGeo.rotateX(Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeo, canopyGlassMat);
    cockpit.position.set(0, 0.58, 0.35);
    cockpit.scale.set(0.92, 0.78, 1.08);
    group.add(cockpit);

    // Cockpit Frame Arch
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.05, 6, 16, Math.PI), darkMetalMat);
    arch.position.set(0, 0.55, 0.85);
    group.add(arch);

    // Droid Astromech Dome behind Canopy
    const droidDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      whiteAccentMat
    );
    droidDome.position.set(0, 0.66, -1.25);
    group.add(droidDome);
    const droidEye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), engineGlowMat);
    droidEye.position.set(0, 0.82, -1.02);
    group.add(droidEye);

    // 3. Swept Fighter Wings + Vertical Wingtip Stabilizer Winglets
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(4.5, -1.7);
    wingShape.lineTo(4.25, -3.1);
    wingShape.lineTo(0, -2.6);
    wingShape.closePath();

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(-Math.PI / 2);

    const leftWing = new THREE.Mesh(wingGeo, whiteAccentMat);
    leftWing.position.set(0.55, 0.05, 0);
    leftWing.rotation.z = -0.05;
    leftWing.castShadow = true;
    group.add(leftWing);

    const rightWingGeo = wingGeo.clone();
    rightWingGeo.scale(-1, 1, 1);
    const rightWing = new THREE.Mesh(rightWingGeo, whiteAccentMat);
    rightWing.position.set(-0.55, 0.05, 0);
    rightWing.rotation.z = 0.05;
    rightWing.castShadow = true;
    group.add(rightWing);

    // Wingtip Vertical Winglets & Stripe Accents
    [-1, 1].forEach((side) => {
      const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.15, 1.55), hullMat);
      winglet.position.set(side * 4.85, 0.28, -2.35);
      winglet.rotation.z = side * -0.22;
      group.add(winglet);

      const navBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), amberLightMat);
      navBeacon.position.set(side * 4.95, 0.82, -2.55);
      group.add(navBeacon);
    });

    // 4. Dorsal Stabilizer Fin (Iconic NMS Dorsal Tail Fin)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0, 1.85);
    finShape.lineTo(-1.6, 0.45);
    finShape.lineTo(-2.0, 0);
    finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.12, bevelEnabled: false });
    finGeo.rotateY(Math.PI / 2);
    const topFin = new THREE.Mesh(finGeo, hullMat);
    topFin.position.set(0.06, 0.42, -1.2);
    group.add(topFin);

    // 5. Central Box-Thruster + Twin Vector Nacelles
    const centerBoxEngine = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 1.4), darkMetalMat);
    centerBoxEngine.position.set(0, 0.18, -3.1);
    group.add(centerBoxEngine);
    const centerBoxGlow = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.48, 0.1), engineGlowMat);
    centerBoxGlow.position.set(0, 0.18, -3.82);
    group.add(centerBoxGlow);

    [-1.25, 1.25].forEach((xPos) => {
      const nacelleGeo = new THREE.CylinderGeometry(0.46, 0.56, 2.8, 14);
      nacelleGeo.rotateX(Math.PI / 2);
      const nacelle = new THREE.Mesh(nacelleGeo, darkMetalMat);
      nacelle.position.set(xPos, 0.12, -2.25);
      group.add(nacelle);

      const nozzleGeo = new THREE.TorusGeometry(0.4, 0.09, 8, 20);
      const glowMesh = new THREE.Mesh(nozzleGeo, engineGlowMat);
      glowMesh.position.set(xPos, 0.12, -3.65);
      group.add(glowMesh);

      const plasmaDisk = new THREE.Mesh(new THREE.CircleGeometry(0.36, 16), engineGlowMat);
      plasmaDisk.position.set(xPos, 0.12, -3.67);
      plasmaDisk.rotation.y = Math.PI;
      group.add(plasmaDisk);
    });

    // 6. Twin Photon Cannon Barrels & Ventral Landing Skids
    [-0.65, 0.65].forEach((xPos) => {
      const canonGeo = new THREE.CylinderGeometry(0.075, 0.095, 1.8, 8);
      canonGeo.rotateX(Math.PI / 2);
      const canon = new THREE.Mesh(canonGeo, darkMetalMat);
      canon.position.set(xPos, -0.22, 2.55);
      group.add(canon);

      const skid = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 1.2), darkMetalMat);
      skid.position.set(xPos * 1.4, -0.58, -0.4);
      group.add(skid);
    });
  }

  // --- 2. Solar Starship (Outlaws Expansion - Twin Forward Podracer Nacelles & Hex Sails) ---
  private static buildSolarShip(group: THREE.Group, customColor?: number) {
    const hullMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0xd8c27a,
      metalness: 0.45,
      roughness: 0.58,
      flatShading: true,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.45,
      roughness: 0.6,
    });
    const solarSailMat = new THREE.MeshBasicMaterial({
      color: 0x2dd4bf,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
    });
    const sailRibMat = new THREE.MeshBasicMaterial({
      color: 0x99f6e4,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });

    // Sleek central needle hull
    const bodyGeo = new THREE.ConeGeometry(1.1, 8.2, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, hullMat);
    body.scale.set(0.85, 0.62, 1.0);
    group.add(body);

    const cockpitGeo = new THREE.SphereGeometry(0.68, 14, 12);
    cockpitGeo.scale(0.8, 0.58, 1.75);
    const cockpit = new THREE.Mesh(cockpitGeo, darkMat);
    cockpit.position.set(0, 0.42, 0.6);
    group.add(cockpit);

    // Twin Forward Podracer Nacelles & Energy Binder Beam
    [-2.1, 2.1].forEach((xOff) => {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 3.8, 10), hullMat);
      pod.rotation.x = Math.PI / 2;
      pod.position.set(xOff, 0.05, 1.8);
      group.add(pod);

      const podTip = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.2, 10), darkMat);
      podTip.rotation.x = Math.PI / 2;
      podTip.position.set(xOff, 0.05, 4.3);
      group.add(podTip);

      const strut = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.35), darkMat);
      strut.position.set(xOff * 0.5, 0.05, 0.8);
      strut.rotation.y = xOff > 0 ? -0.35 : 0.35;
      group.add(strut);
    });

    // Energy Binder Beam between forward pods
    const binderBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3.8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    binderBeam.rotation.z = Math.PI / 2;
    binderBeam.position.set(0, 0.05, 2.8);
    group.add(binderBeam);

    // Hexagonal Solar Sails (Left and Right)
    [-1, 1].forEach((side) => {
      const sailGroup = new THREE.Group();
      sailGroup.position.set(side * 3.1, 0.25, -0.8);
      sailGroup.rotation.y = side * 0.22;

      const sailGeo = new THREE.CircleGeometry(2.6, 6);
      sailGeo.scale(1.15, 1.75, 1.0);
      const sail = new THREE.Mesh(sailGeo, solarSailMat);
      sail.rotation.x = Math.PI / 2;
      sail.rotation.z = side * 0.28;
      sailGroup.add(sail);

      const sailRibs = new THREE.Mesh(sailGeo, sailRibMat);
      sailRibs.rotation.copy(sail.rotation);
      sailGroup.add(sailRibs);

      group.add(sailGroup);
    });

    // Central Ion Thruster
    const ionGeo = new THREE.CylinderGeometry(0.48, 0.68, 2.0, 14);
    ionGeo.rotateX(Math.PI / 2);
    const ion = new THREE.Mesh(ionGeo, darkMat);
    ion.position.set(0, 0, -3.8);
    group.add(ion);

    const glow = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.52, 16),
      new THREE.MeshBasicMaterial({ color: 0x2dd4bf })
    );
    glow.position.set(0, 0, -4.82);
    glow.rotation.y = Math.PI;
    group.add(glow);
  }

  // --- 3. Sentinel Interceptor (Interceptor Expansion - Mandibles & Quad Folding Wings) ---
  private static buildInterceptorShip(group: THREE.Group, customColor?: number) {
    const stealthMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0x181a20,
      metalness: 0.45,
      roughness: 0.58,
      flatShading: true,
    });
    const orangeTrimMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      metalness: 0.35,
      roughness: 0.65,
    });
    const crimsonEyeMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
    });

    // Angular Stealth Core Fuselage
    const fuseGeo = new THREE.BoxGeometry(2.0, 1.05, 5.8);
    const fuse = new THREE.Mesh(fuseGeo, stealthMat);
    group.add(fuse);

    // Forward Mandible Pincers (Iconic Sentinel Interceptor Beetles/Pincers)
    [-0.85, 0.85].forEach((xOff) => {
      const pincer = new THREE.Mesh(new THREE.ConeGeometry(0.32, 2.4, 4), orangeTrimMat);
      pincer.rotation.x = Math.PI / 2;
      pincer.position.set(xOff, -0.1, 3.6);
      pincer.rotation.y = xOff > 0 ? -0.12 : 0.12;
      group.add(pincer);
    });

    // Sentinel Cylon Optic Red Visor Bar
    const eyeGeo = new THREE.BoxGeometry(1.65, 0.22, 0.35);
    const eye = new THREE.Mesh(eyeGeo, crimsonEyeMat);
    eye.position.set(0, 0.22, 2.95);
    group.add(eye);

    // Quad Transforming Interceptor X-Wings
    const wingDefs = [
      { x: 1.85, y: 0.82, rotZ: 0.36 },
      { x: -1.85, y: 0.82, rotZ: -0.36 },
      { x: 1.85, y: -0.82, rotZ: -0.36 },
      { x: -1.85, y: -0.82, rotZ: 0.36 },
    ];
    wingDefs.forEach((w) => {
      const wingGeo = new THREE.BoxGeometry(3.3, 0.12, 1.9);
      const wing = new THREE.Mesh(wingGeo, stealthMat);
      wing.position.set(w.x, w.y, -0.6);
      wing.rotation.z = w.rotZ;
      wing.rotation.y = -0.15;
      group.add(wing);

      const tipGeo = new THREE.BoxGeometry(0.12, 0.12, 1.6);
      const tip = new THREE.Mesh(tipGeo, crimsonEyeMat);
      tip.position.set(w.x > 0 ? 1.65 : -1.65, 0, 0);
      wing.add(tip);
    });

    // Rear Sentinel Thruster Core
    const thruster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.95, 1.1, 12),
      crimsonEyeMat
    );
    thruster.rotateX(Math.PI / 2);
    thruster.position.set(0, 0, -3.15);
    group.add(thruster);
  }

  // --- 4. Living Ship (Starbirth Bio-Ship) ---
  private static buildLivingShip(group: THREE.Group, customColor?: number) {
    const organicMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0x9d7a6c,
      roughness: 0.78,
      metalness: 0.1,
      flatShading: true,
    });
    const bioGlowMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
      roughness: 0.6,
    });

    // Sculpted Organic Cranium Carapace
    const headGeo = new THREE.DodecahedronGeometry(1.65, 1);
    headGeo.scale(0.92, 0.82, 1.65);
    const head = new THREE.Mesh(headGeo, organicMat);
    group.add(head);

    // Bioluminescent Neural Rib Veins
    [-0.65, 0.65].forEach((x) => {
      const vent = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), bioGlowMat);
      vent.position.set(x, 0.58, 0.55);
      group.add(vent);
    });

    // 4 Articulated Chitin Tendril Limbs
    [-1.85, 1.85].forEach((x) => {
      const tendrilGeo = new THREE.ConeGeometry(0.55, 4.6, 8);
      tendrilGeo.rotateX(Math.PI / 2);
      const tendril = new THREE.Mesh(tendrilGeo, organicMat);
      tendril.position.set(x, -0.2, -1.0);
      tendril.rotation.z = (x > 0 ? -1 : 1) * 0.38;
      group.add(tendril);
    });

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.85, 2.4, 12), bioGlowMat);
    tail.rotateX(Math.PI / 2);
    tail.position.set(0, 0, -2.5);
    group.add(tail);
  }

  // --- 5. Utopia Speeder (Expedition 9 Wedge Interceptor) ---
  private static buildSpeederShip(group: THREE.Group, customColor?: number) {
    const metalMat = new THREE.MeshStandardMaterial({
      color: customColor !== undefined ? customColor : 0x3d5a80,
      metalness: 0.4,
      roughness: 0.65,
      flatShading: true,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.45,
      roughness: 0.6,
    });

    const speederGeo = new THREE.BoxGeometry(1.5, 0.58, 6.8);
    const body = new THREE.Mesh(speederGeo, metalMat);
    group.add(body);

    const wingGeo = new THREE.BoxGeometry(5.0, 0.12, 1.6);
    const wings = new THREE.Mesh(wingGeo, metalMat);
    wings.position.set(0, 0, -1.1);
    group.add(wings);

    // Angled Airbrake Flaps & Wingtip Cannons
    [-2.2, 2.2].forEach((xOff) => {
      const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), darkMat);
      cannon.rotation.x = Math.PI / 2;
      cannon.position.set(xOff, 0, 0.2);
      group.add(cannon);
    });

    const thruster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.52, 1.4, 14),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    thruster.rotateX(Math.PI / 2);
    thruster.position.set(0, 0, -3.7);
    group.add(thruster);
  }
}
