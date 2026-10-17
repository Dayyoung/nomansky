import * as THREE from 'three';

/**
 * 3D Space Anomaly Model (Beyond Expansion / Priest Entity Nada & Specialist Polo)
 * Colossal geodesic Death-Star-like sphere with recessed trenches, glowing entry portal,
 * and dual counter-rotating gyroscopic equatorial rings.
 */
export class SpaceAnomalyBuilder {
  public static createSpaceAnomaly(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'space_anomaly';

    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x181826,
      metalness: 0.45,
      roughness: 0.65,
      flatShading: true,
    });
    const purpleSeamMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const portalRingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.5,
      roughness: 0.45,
    });
    const portalGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const goldAntennaMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.5,
      roughness: 0.5,
    });
    const beaconLightMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
    });

    // 1. Colossal Geodesic Metallic Sphere (Radius 32u)
    const sphereGeo = new THREE.IcosahedronGeometry(32, 3);
    const mainSphere = new THREE.Mesh(sphereGeo, hullMat);
    mainSphere.castShadow = true;
    mainSphere.receiveShadow = true;
    group.add(mainSphere);

    // Subtle Purple Structural Seam Overlay
    const seamSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(32.15, 2), purpleSeamMat);
    group.add(seamSphere);

    // Equatorial Trench Band
    const trenchBand = new THREE.Mesh(
      new THREE.TorusGeometry(31.8, 0.85, 8, 48),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    trenchBand.rotation.x = Math.PI / 2;
    group.add(trenchBand);

    // 2. Colossal Circular Entry Portal Aperture (Front Face +Z)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, 31);

    const portalRing = new THREE.Mesh(new THREE.TorusGeometry(12, 1.8, 12, 32), portalRingMat);
    portalGroup.add(portalRing);

    const innerCollar = new THREE.Mesh(new THREE.TorusGeometry(9.8, 0.6, 8, 32), goldAntennaMat);
    innerCollar.position.z = 0.5;
    portalGroup.add(innerCollar);

    const eventHorizon = new THREE.Mesh(new THREE.CircleGeometry(11.5, 32), portalGlowMat);
    eventHorizon.name = 'anomaly_event_horizon';
    portalGroup.add(eventHorizon);

    // Docking Guide Runway Beacons
    [-14, 14].forEach((xPos) => {
      const guideLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      guideLight.position.set(xPos, 0, 1);
      portalGroup.add(guideLight);
    });

    group.add(portalGroup);

    // 3. Rotating Outer Gyroscopic Equatorial Ring (anomaly_outer_ring)
    const outerRingGroup = new THREE.Group();
    outerRingGroup.name = 'anomaly_outer_ring';
    outerRingGroup.rotation.x = Math.PI / 2.3;

    const ringGeo = new THREE.TorusGeometry(40, 0.9, 8, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.45, roughness: 0.6 });
    const outerRing = new THREE.Mesh(ringGeo, ringMat);
    outerRingGroup.add(outerRing);

    // Floating Sensor Satellites along the ring
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const sat = new THREE.Mesh(new THREE.OctahedronGeometry(1.5), goldAntennaMat);
      sat.position.set(Math.cos(ang) * 40, Math.sin(ang) * 40, 0);
      outerRingGroup.add(sat);
    }
    group.add(outerRingGroup);

    // 4. Heavy Antenna Spines (Dorsal and Ventral)
    [1, -1].forEach((dir) => {
      const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.9, 22, 6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.65 })
      );
      spine.position.set(0, dir * 38, -5);
      group.add(spine);

      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), beaconLightMat);
      beacon.position.set(0, dir * 49, -5);
      beacon.name = `anomaly_beacon_${dir > 0 ? 'top' : 'bot'}`;
      group.add(beacon);
    });

    return group;
  }
}
