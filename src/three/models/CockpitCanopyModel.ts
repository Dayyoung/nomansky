import * as THREE from 'three';

/**
 * 3D Starship Cockpit Canopy Frame & Holographic Instrument Displays
 * Rendered when in First-Person 'COCKPIT' flight camera mode
 */
export class CockpitCanopyBuilder {
  public static createCockpitCanopy(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'cockpit_canopy';

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      metalness: 0.9,
      roughness: 0.25,
    });
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.4,
    });
    const holoCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.85,
    });
    const holoAmberMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
    });
    const glassTintMat = new THREE.MeshPhysicalMaterial({
      color: 0x002244,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      transparent: true,
      opacity: 0.25,
      reflectivity: 0.9,
    });

    // 1. Lower Dashboard Console
    const dashGeo = new THREE.BoxGeometry(4.2, 0.8, 2.2);
    const dashboard = new THREE.Mesh(dashGeo, panelMat);
    dashboard.position.set(0, -0.9, -1.8);
    dashboard.rotation.x = 0.25;
    group.add(dashboard);

    // 2. Holographic Flight Display Dials (Left: Shield & Speed, Right: Scanner & Weapons)
    const dialL = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.35, 24), holoCyanMat);
    dialL.position.set(-0.9, -0.65, -1.65);
    dialL.rotation.x = -0.3;
    dialL.name = 'cockpit_dial_speed';
    group.add(dialL);

    const dialR = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.35, 24), holoAmberMat);
    dialR.position.set(0.9, -0.65, -1.65);
    dialR.rotation.x = -0.3;
    dialR.name = 'cockpit_dial_shield';
    group.add(dialR);

    // Center Holographic Radar Globe
    const radarGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 8),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.6 })
    );
    radarGlobe.position.set(0, -0.58, -1.6);
    radarGlobe.name = 'cockpit_radar_globe';
    group.add(radarGlobe);

    // 3. Canopy Triangular Framing Struts (Left, Right, Top)
    // Left A-pillar
    const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 3.2, 6), frameMat);
    pillarL.position.set(-1.6, 0.3, -1.6);
    pillarL.rotation.set(0.4, 0.1, -0.5);
    group.add(pillarL);

    // Right A-pillar
    const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 3.2, 6), frameMat);
    pillarR.position.set(1.6, 0.3, -1.6);
    pillarR.rotation.set(0.4, -0.1, 0.5);
    group.add(pillarR);

    // Top Header Strut
    const headerStrut = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), frameMat);
    headerStrut.position.set(0, 1.2, -1.4);
    group.add(headerStrut);

    // 4. Subtle Tinted Glass Shield
    const glassGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const glass = new THREE.Mesh(glassGeo, glassTintMat);
    glass.position.set(0, 0.2, -1.55);
    glass.rotation.x = 0.2;
    group.add(glass);

    return group;
  }
}
