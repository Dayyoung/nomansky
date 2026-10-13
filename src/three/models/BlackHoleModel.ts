import * as THREE from 'three';

/**
 * Procedural 3D Supermassive Black Hole & Accretion Disk (No Man's Sky Atlas / Relativity)
 */
export class BlackHoleBuilder {
  public static createBlackHole(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'supermassive_black_hole';

    // 1. Pitch-Black Event Horizon Void (Absorbs all light)
    const eventHorizonGeo = new THREE.SphereGeometry(18, 36, 24);
    const eventHorizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const eventHorizon = new THREE.Mesh(eventHorizonGeo, eventHorizonMat);
    group.add(eventHorizon);

    // 2. Gravitational Lensing Blue/Violet Edge Glow
    const lensingRimGeo = new THREE.SphereGeometry(18.8, 36, 24);
    const lensingRimMat = new THREE.MeshBasicMaterial({
      color: 0x9933ff,
      transparent: true,
      opacity: 0.7,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const lensingRim = new THREE.Mesh(lensingRimGeo, lensingRimMat);
    group.add(lensingRim);

    // 3. Blazing Swirling Accretion Disk (Horizontal Plane)
    const diskGeo = new THREE.RingGeometry(21, 68, 64, 8);
    diskGeo.rotateX(-Math.PI / 2);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0xbf5af2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const accretionDisk = new THREE.Mesh(diskGeo, diskMat);
    accretionDisk.name = 'accretion_disk_main';
    group.add(accretionDisk);

    // 4. Inner Hot White-Blue Plasma Ring
    const innerRingGeo = new THREE.RingGeometry(18.5, 26, 64);
    innerRingGeo.rotateX(-Math.PI / 2);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.name = 'accretion_inner_plasma';
    group.add(innerRing);

    // 5. Vertical Gravitational Distortion Warp Halo (Curved Lensing Illusion)
    const vertHaloGeo = new THREE.RingGeometry(20, 52, 64);
    const vertHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff3b30,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const vertHalo = new THREE.Mesh(vertHaloGeo, vertHaloMat);
    vertHalo.name = 'accretion_lensing_halo';
    group.add(vertHalo);

    // 6. Relativistic Swirling Particles Vortex
    const partCount = 180;
    const partGeo = new THREE.BufferGeometry();
    const partPositions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount; i++) {
      const rad = 22 + Math.random() * 45;
      const ang = Math.random() * Math.PI * 2;
      partPositions[i * 3] = Math.cos(ang) * rad;
      partPositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      partPositions[i * 3 + 2] = Math.sin(ang) * rad;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 2.2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(partGeo, partMat);
    particles.name = 'accretion_particles';
    group.add(particles);

    return group;
  }
}
