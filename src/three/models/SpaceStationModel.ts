import * as THREE from 'three';

export class SpaceStationBuilder {
  /**
   * Generates a 3D No Man's Sky Space Station with geometric hull,
   * illuminated docking bay entrance, and landing approach beacons.
   */
  public static createSpaceStation(): THREE.Group {
    const station = new THREE.Group();
    station.name = 'space_station';

    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x333b45, // Dark sci-fi alloy
      metalness: 0.85,
      roughness: 0.25,
      flatShading: true,
    });
    const orangeAccentMat = new THREE.MeshStandardMaterial({
      color: 0xff7700,
      metalness: 0.6,
      roughness: 0.3,
    });
    const dockingLightMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff, // Tractor beam cyan
    });
    const runwayYellowMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
    });

    // 1. Massive Dodecahedron / Geometric Outer Station Shell
    const shellGeo = new THREE.DodecahedronGeometry(80);
    const shell = new THREE.Mesh(shellGeo, hullMat);
    shell.castShadow = true;
    shell.receiveShadow = true;
    station.add(shell);

    // 2. Equatorial Rotating Ring / Girders
    const ringGeo = new THREE.TorusGeometry(105, 4.5, 12, 32);
    const ring = new THREE.Mesh(ringGeo, orangeAccentMat);
    ring.rotation.x = Math.PI / 2;
    ring.name = 'station_ring';
    station.add(ring);

    // 3. Docking Bay Entrance Portal (Iconic glowing rectangular tunnel entrance)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, 80);

    // Tunnel frame
    const frameGeo = new THREE.BoxGeometry(28, 16, 20);
    const frame = new THREE.Mesh(frameGeo, hullMat);
    portalGroup.add(frame);

    // Tractor beam opening (inner glowing box)
    const beamGeo = new THREE.BoxGeometry(22, 12, 18);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.BackSide,
    });
    const beamInterior = new THREE.Mesh(beamGeo, beamMat);
    beamInterior.position.z = 2;
    portalGroup.add(beamInterior);

    // Runway Approach Guide Lights (Stripes of glowing beacons)
    for (let i = 0; i < 6; i++) {
      const zPos = 12 + i * 16;
      [-16, 16].forEach((xPos) => {
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), dockingLightMat);
        beacon.position.set(xPos, 0, zPos);
        portalGroup.add(beacon);
      });
      // Centerline yellow lights
      const centerLight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 4), runwayYellowMat);
      centerLight.position.set(0, -6, zPos);
      portalGroup.add(centerLight);
    }

    station.add(portalGroup);

    // 4. Communication Antennas and Solar Arrays
    [-1, 1].forEach((dir) => {
      const mastGeo = new THREE.CylinderGeometry(0.8, 1.2, 60, 8);
      const mast = new THREE.Mesh(mastGeo, hullMat);
      mast.position.set(dir * 70, 45, 0);
      mast.rotation.z = dir * 0.4;
      station.add(mast);

      // Red blinking beacon at mast tip
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
      beacon.position.set(dir * 70 + dir * 12, 75, 0);
      station.add(beacon);
    });

    return station;
  }
}
