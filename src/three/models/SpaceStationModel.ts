import * as THREE from 'three';

export class SpaceStationBuilder {
  /**
   * Generates an iconic 3D No Man's Sky Space Station (Orbital Update Aesthetic)
   * with geometric polyhedral superstructure, illuminated city-grid trench,
   * hexagonal tractor-beam docking tunnel, and rotating habitat ring.
   */
  public static createSpaceStation(): THREE.Group {
    const station = new THREE.Group();
    station.name = 'space_station';

    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x262e38,
      metalness: 0.45,
      roughness: 0.65,
      flatShading: true,
    });
    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.5,
      roughness: 0.55,
      flatShading: true,
    });
    const orangeAccentMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.35,
      roughness: 0.6,
    });
    const dockingLightMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });
    const runwayYellowMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
    });
    const trenchWindowMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.65,
    });

    // 1. Massive Polyhedral Outer Station Superstructure
    const shellGeo = new THREE.DodecahedronGeometry(80, 0);
    const shell = new THREE.Mesh(shellGeo, hullMat);
    shell.castShadow = true;
    shell.receiveShadow = true;
    station.add(shell);

    // Armored Polar Caps (Top & Bottom Command Towers)
    [1, -1].forEach((dir) => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(36, 48, 16, 6), darkTrimMat);
      cap.position.y = dir * 68;
      station.add(cap);
    });

    // Equatorial Recessed City-Grid Window Trench Band
    const trenchRing = new THREE.Mesh(new THREE.CylinderGeometry(79, 79, 8, 24), darkTrimMat);
    station.add(trenchRing);
    for (let w = 0; w < 16; w++) {
      const ang = (w / 16) * Math.PI * 2;
      // Skip docking entrance sector around +Z
      if (Math.sin(ang) < 0.25 && Math.cos(ang) > 0.85) continue;
      const winStrip = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 1.5), trenchWindowMat);
      winStrip.position.set(Math.sin(ang) * 79.2, 0, Math.cos(ang) * 79.2);
      winStrip.rotation.y = ang;
      station.add(winStrip);
    }

    // 2. Equatorial Rotating Ring & Structural Spokes (station_ring)
    const ringGroup = new THREE.Group();
    ringGroup.name = 'station_ring';

    const ringGeo = new THREE.TorusGeometry(108, 4.2, 8, 36);
    const ring = new THREE.Mesh(ringGeo, orangeAccentMat);
    ring.rotation.x = Math.PI / 2;
    ringGroup.add(ring);

    // 4 Structural Ring Segments & Beacons
    for (let s = 0; s < 4; s++) {
      const ang = (s / 4) * Math.PI * 2;
      const pod = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), darkTrimMat);
      pod.position.set(Math.cos(ang) * 108, 0, Math.sin(ang) * 108);
      ringGroup.add(pod);
    }
    station.add(ringGroup);

    // 3. Iconic Hexagonal Docking Bay Entrance Tunnel (+Z)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, 78);

    // Outer Hexagonal Armored Collar
    const hexCollar = new THREE.Mesh(new THREE.CylinderGeometry(24, 28, 22, 6), darkTrimMat);
    hexCollar.rotation.x = Math.PI / 2;
    hexCollar.rotation.z = Math.PI / 6;
    portalGroup.add(hexCollar);

    // Inner Glowing Tractor-Beam Tunnel
    const beamInterior = new THREE.Mesh(
      new THREE.CylinderGeometry(17, 17, 20, 6),
      new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.42,
        side: THREE.BackSide,
      })
    );
    beamInterior.rotation.x = Math.PI / 2;
    beamInterior.rotation.z = Math.PI / 6;
    beamInterior.position.z = 2;
    portalGroup.add(beamInterior);

    // Glowing Hexagonal Landing Approach Guide Rings & Runway Beacons
    for (let i = 0; i < 6; i++) {
      const zPos = 14 + i * 16;
      [-16, 16].forEach((xPos) => {
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), dockingLightMat);
        beacon.position.set(xPos, 0, zPos);
        portalGroup.add(beacon);
      });
      const centerLight = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 4.5), runwayYellowMat);
      centerLight.position.set(0, -6.5, zPos);
      portalGroup.add(centerLight);
    }

    station.add(portalGroup);

    // 4. Deep-Space Communication Masts & Radiator Arrays
    [-1, 1].forEach((dir) => {
      const mastGeo = new THREE.CylinderGeometry(0.8, 1.4, 62, 8);
      const mast = new THREE.Mesh(mastGeo, darkTrimMat);
      mast.position.set(dir * 70, 46, 0);
      mast.rotation.z = dir * 0.4;
      station.add(mast);

      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xf43f5e })
      );
      beacon.position.set(dir * 70 + dir * 12, 76, 0);
      station.add(beacon);
    });

    return station;
  }
}
