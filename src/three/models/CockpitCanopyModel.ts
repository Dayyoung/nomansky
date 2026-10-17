import * as THREE from 'three';

/**
 * 3D Starship Cockpit Canopy Frame & Holographic Instrument Displays
 * Authentic No Man's Sky 1st-Person Starship Cockpit Console
 */
export class CockpitCanopyBuilder {
  public static createCockpitCanopy(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'cockpit_canopy';

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.4,
      roughness: 0.75,
    });
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.3,
      roughness: 0.85,
    });
    const holoCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
    });
    const holoAmberMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
    });
    const holoEmeraldMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
    });

    // 1. Angled 3-Piece Wrap-Around Cockpit Dashboard Console
    const centerDash = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.72, 1.8), panelMat);
    centerDash.position.set(0, -0.92, -1.75);
    centerDash.rotation.x = 0.22;
    group.add(centerDash);

    const leftDash = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.72, 1.6), panelMat);
    leftDash.position.set(-1.55, -0.88, -1.55);
    leftDash.rotation.set(0.2, 0.38, 0.08);
    group.add(leftDash);

    const rightDash = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.72, 1.6), panelMat);
    rightDash.position.set(1.55, -0.88, -1.55);
    rightDash.rotation.set(0.2, -0.38, -0.08);
    group.add(rightDash);

    // 2. Center 3D Holographic System Radar Globe & Orbit Rings (Iconic NMS Center Projector)
    const radarGroup = new THREE.Group();
    radarGroup.position.set(0, -0.52, -1.55);
    radarGroup.name = 'cockpit_radar_globe';

    const radarSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.45 })
    );
    radarGroup.add(radarSphere);

    const orbitRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.008, 6, 32), holoCyanMat);
    orbitRing1.rotation.x = Math.PI / 2.2;
    radarGroup.add(orbitRing1);

    const orbitRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.006, 6, 24), holoAmberMat);
    orbitRing2.rotation.set(1.1, 0.4, 0);
    radarGroup.add(orbitRing2);

    // Mini planet blip inside radar
    const planetBlip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), holoEmeraldMat);
    planetBlip.position.set(0.18, 0.05, 0.12);
    radarGroup.add(planetBlip);

    group.add(radarGroup);

    // 3. Left Holographic Speed & Pulse Engine Dial + Physical Throttle Lever
    const dialL = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.28, 24), holoCyanMat);
    dialL.position.set(-0.88, -0.58, -1.58);
    dialL.rotation.set(-0.28, 0.25, 0);
    dialL.name = 'cockpit_dial_speed';
    group.add(dialL);

    const throttleBase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.35), frameMat);
    throttleBase.position.set(-1.35, -0.52, -1.35);
    group.add(throttleBase);
    const throttleHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), holoAmberMat);
    throttleHandle.rotation.z = Math.PI / 2;
    throttleHandle.position.set(-1.35, -0.4, -1.32);
    group.add(throttleHandle);

    // 4. Right Holographic Shield & Ship Status Wireframe + Flight Stick (HOTAS)
    const dialR = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.28, 24), holoAmberMat);
    dialR.position.set(0.88, -0.58, -1.58);
    dialR.rotation.set(-0.28, -0.25, 0);
    dialR.name = 'cockpit_dial_shield';
    group.add(dialR);

    const miniShipHolo = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.26, 4),
      new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true })
    );
    miniShipHolo.rotation.x = -Math.PI / 2;
    miniShipHolo.position.set(0.88, -0.56, -1.55);
    group.add(miniShipHolo);

    const stickShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.28, 8), frameMat);
    stickShaft.position.set(1.32, -0.45, -1.32);
    stickShaft.rotation.x = -0.15;
    group.add(stickShaft);

    // 5. Canopy Framing Struts (Matte dark alloy, no glass reflection glare)
    const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 3.2, 6), frameMat);
    pillarL.position.set(-1.65, 0.3, -1.6);
    pillarL.rotation.set(0.4, 0.1, -0.48);
    group.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 3.2, 6), frameMat);
    pillarR.position.set(1.65, 0.3, -1.6);
    pillarR.rotation.set(0.4, -0.1, 0.48);
    group.add(pillarR);

    const headerStrut = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.07, 0.08), frameMat);
    headerStrut.position.set(0, 1.22, -1.4);
    group.add(headerStrut);

    return group;
  }
}
