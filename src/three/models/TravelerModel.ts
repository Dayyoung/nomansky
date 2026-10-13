import * as THREE from 'three';

export class TravelerBuilder {
  /**
   * Generates a 3D procedural Traveler astronaut model with exo-suit,
   * reflective helmet visor, jetpack backpack, and multi-tool.
   */
  public static createTraveler(): THREE.Group {
    const traveler = new THREE.Group();
    traveler.name = 'traveler_player';

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // White / Slate Exo-suit
      roughness: 0.5,
      metalness: 0.3,
    });
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x3182ce, // Blue sci-fi armor trims
      roughness: 0.4,
      metalness: 0.5,
    });
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0xffb703, // Iconic Gold / Amber reflective visor
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 1.0,
      clearcoat: 1.0,
    });
    const jetpackMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      metalness: 0.8,
      roughness: 0.3,
    });
    const glowBlueMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.85, 1.1, 0.55);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    traveler.add(torso);

    // Chest Plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.15), armorMat);
    chestPlate.position.set(0, 1.45, 0.28);
    traveler.add(chestPlate);

    // Life support indicator light
    const lifeLight = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), glowBlueMat);
    lifeLight.position.set(0.18, 1.5, 0.37);
    traveler.add(lifeLight);

    // 2. Helmet
    const helmetGeo = new THREE.SphereGeometry(0.38, 16, 16);
    helmetGeo.scale(1.0, 1.1, 1.0);
    const helmet = new THREE.Mesh(helmetGeo, suitMat);
    helmet.position.y = 2.15;
    helmet.castShadow = true;
    traveler.add(helmet);

    // Visor
    const visorGeo = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI, 0, Math.PI * 0.7);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.15, 0.14);
    visor.rotation.y = -Math.PI / 2;
    traveler.add(visor);

    // 3. Jetpack (Backpack unit)
    const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.35), jetpackMat);
    packBody.position.set(0, 1.45, -0.42);
    packBody.castShadow = true;
    traveler.add(packBody);

    // Twin Jetpack Thruster Nozzles
    [-0.22, 0.22].forEach((xPos) => {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 12), jetpackMat);
      nozzle.position.set(xPos, 1.05, -0.42);
      traveler.add(nozzle);

      // Jet exhaust flame (hidden unless jetpack active)
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 8), glowBlueMat);
      flame.name = `jet_flame_${xPos > 0 ? 'r' : 'l'}`;
      flame.position.set(xPos, 0.7, -0.42);
      flame.rotation.x = Math.PI;
      flame.visible = false;
      traveler.add(flame);
    });

    // 4. Legs (Grouped with hip pivots for authentic walking strides)
    [-0.22, 0.22].forEach((xPos, idx) => {
      const legGroup = new THREE.Group();
      legGroup.name = idx === 0 ? 'leg_l' : 'leg_r';
      legGroup.position.set(xPos, 0.85, 0);

      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 0.3), suitMat);
      leg.position.set(0, -0.4, 0);
      leg.castShadow = true;
      legGroup.add(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.42), armorMat);
      boot.position.set(0, -0.74, 0.05);
      boot.castShadow = true;
      legGroup.add(boot);

      traveler.add(legGroup);
    });

    // 5. Arms & Multi-Tool
    // Left arm
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.25), suitMat);
    leftArm.position.set(-0.55, 1.3, 0);
    traveler.add(leftArm);

    // Right arm holding Multi-Tool forward
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.7, 0.25), suitMat);
    rightArm.position.set(0.55, 1.35, 0.2);
    rightArm.rotation.x = -Math.PI / 4;
    traveler.add(rightArm);

    // Multi-Tool Gun
    const toolGroup = new THREE.Group();
    toolGroup.name = 'multitool';
    toolGroup.position.set(0.55, 1.3, 0.65);

    const bodyTool = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.6), armorMat);
    toolGroup.add(bodyTool);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 })
    );
    barrel.rotateX(Math.PI / 2);
    barrel.position.set(0, 0.02, 0.4);
    toolGroup.add(barrel);

    // Multi-tool muzzle emitter
    const emitter = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.06, 8), glowBlueMat);
    emitter.position.set(0, 0.02, 0.56);
    toolGroup.add(emitter);

    traveler.add(toolGroup);

    return traveler;
  }
}
