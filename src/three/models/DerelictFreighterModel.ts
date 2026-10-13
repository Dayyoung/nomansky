import * as THREE from 'three';

/**
 * Procedural 3D Derelict Capital Freighter (Desolation Expansion)
 * Massive derelict deep-space capital ship floating in orbit with salvageable cargo bays
 */
export class DerelictFreighterBuilder {
  public static createDerelictFreighter(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'derelict_freighter';

    // Weathered Dark Hull & Hazardous Industrial Color Scheme
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x333b45,
      metalness: 0.8,
      roughness: 0.45,
    });
    const armorRibMat = new THREE.MeshStandardMaterial({
      color: 0x1f242b,
      metalness: 0.9,
      roughness: 0.35,
    });
    const warningAmberMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x92400e,
      emissiveIntensity: 0.6,
      roughness: 0.4,
    });
    const emergencyGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff3b30,
    });
    const blueDockingGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
    });
    const cargoPodMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.6,
      roughness: 0.3,
    });

    // 1. Massive Main Spine & Keel (Length ~180 units)
    const spineGeo = new THREE.BoxGeometry(16, 12, 160);
    const spine = new THREE.Mesh(spineGeo, hullMat);
    spine.castShadow = true;
    spine.receiveShadow = true;
    group.add(spine);

    // 2. Heavy Dreadnought Command Bridge (Stern Tower)
    const bridgeBase = new THREE.Mesh(new THREE.BoxGeometry(26, 16, 28), hullMat);
    bridgeBase.position.set(0, 12, -60);
    bridgeBase.castShadow = true;
    group.add(bridgeBase);

    // Elevated Bridge Cockpit Tower
    const bridgeTower = new THREE.Mesh(new THREE.BoxGeometry(18, 10, 18), armorRibMat);
    bridgeTower.position.set(0, 23, -62);
    group.add(bridgeTower);

    // Glowing Bridge Viewports
    const bridgeWindow = new THREE.Mesh(new THREE.BoxGeometry(16.2, 2.2, 4), emergencyGlowMat);
    bridgeWindow.position.set(0, 24, -53.2);
    group.add(bridgeWindow);

    // Communications Sensor Mast & Radar Arrays
    const mastGeo = new THREE.CylinderGeometry(0.6, 0.9, 18, 8);
    const mast = new THREE.Mesh(mastGeo, armorRibMat);
    mast.position.set(0, 36, -62);
    group.add(mast);

    const dishGeo = new THREE.SphereGeometry(3.5, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const dish = new THREE.Mesh(dishGeo, warningAmberMat);
    dish.position.set(0, 44, -62);
    dish.rotation.x = Math.PI / 4;
    group.add(dish);

    // 3. Segmented Cargo Hold Sections (5 Bulkhead Bays with Armor Ribs)
    const bayOffsets = [-35, -12, 12, 35, 58];
    bayOffsets.forEach((zOffset, idx) => {
      // Outer Reinforced Rib Frame
      const ribGeo = new THREE.TorusGeometry(18, 2.2, 6, 16);
      const rib = new THREE.Mesh(ribGeo, armorRibMat);
      rib.position.set(0, 0, zOffset);
      group.add(rib);

      // Cargo Container Clusters attached to ribs
      [-14, 14].forEach((xSide) => {
        const podGeo = new THREE.BoxGeometry(6.5, 6.5, 12);
        const pod = new THREE.Mesh(podGeo, idx % 2 === 0 ? cargoPodMat : warningAmberMat);
        pod.position.set(xSide, (idx % 2 === 0 ? 4 : -4), zOffset);
        pod.castShadow = true;
        group.add(pod);
      });
    });

    // 4. Catwalk & Emergency Entry Docking Bay (Bow Section)
    const bowNoseGeo = new THREE.ConeGeometry(12, 26, 6);
    bowNoseGeo.rotateX(Math.PI / 2);
    const bowNose = new THREE.Mesh(bowNoseGeo, hullMat);
    bowNose.position.set(0, 0, 92);
    group.add(bowNose);

    // Docking Bay Opening with Runway Guide Lights
    const dockBayGeo = new THREE.BoxGeometry(14, 8, 20);
    const dockBay = new THREE.Mesh(dockBayGeo, armorRibMat);
    dockBay.position.set(0, -6, 40);
    group.add(dockBay);

    // Glowing Cyan Docking Runway Lights
    for (let r = -8; r <= 8; r += 4) {
      const runwayLight = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), blueDockingGlowMat);
      runwayLight.position.set(5.5, -4.5, 40 + r);
      group.add(runwayLight);

      const runwayLightL = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), blueDockingGlowMat);
      runwayLightL.position.set(-5.5, -4.5, 40 + r);
      group.add(runwayLightL);
    }

    // 5. Pulsing Red/Amber Emergency Strobe Beacons
    const beaconGeo = new THREE.SphereGeometry(1.2, 8, 8);
    const beaconTop = new THREE.Mesh(beaconGeo, emergencyGlowMat);
    beaconTop.position.set(0, 46, -62);
    beaconTop.name = 'freighter_beacon';
    group.add(beaconTop);

    const beaconBow = new THREE.Mesh(beaconGeo, emergencyGlowMat);
    beaconBow.position.set(0, 8, 102);
    beaconBow.name = 'freighter_beacon_bow';
    group.add(beaconBow);

    // 6. Huge Sub-Light Ion Thrusters (Stern)
    [-7, 7].forEach((xOff) => {
      const engineGeo = new THREE.CylinderGeometry(4.5, 6.0, 14, 12);
      engineGeo.rotateX(Math.PI / 2);
      const engine = new THREE.Mesh(engineGeo, armorRibMat);
      engine.position.set(xOff, 2, -84);
      group.add(engine);

      // Flickering damaged engine glow
      const nozzleGlow = new THREE.Mesh(new THREE.CircleGeometry(4.2, 12), warningAmberMat);
      nozzleGlow.position.set(xOff, 2, -91.1);
      nozzleGlow.rotateY(Math.PI);
      group.add(nozzleGlow);
    });

    // 7. Floating Orbiting Cargo Salvage Crates
    for (let c = 0; c < 6; c++) {
      const crateGeo = new THREE.DodecahedronGeometry(2.4);
      const crate = new THREE.Mesh(crateGeo, warningAmberMat);
      const angle = (c / 6) * Math.PI * 2;
      const radius = 32 + (c % 3) * 6;
      crate.position.set(Math.cos(angle) * radius, Math.sin(c * 2) * 12, Math.sin(angle) * radius);
      crate.name = `salvage_crate_${c}`;
      group.add(crate);
    }

    return group;
  }
}
