import * as THREE from 'three';

/**
 * Procedural 3D Player Capital Freighter & Frigate Fleet (Venator & Dreadnought Class)
 * Authentic No Man's Sky capital ship summoned via [H] key with 3-bay docking hangar and escort frigates.
 */
export class CapitalFreighterBuilder {
  public static createCapitalFreighter(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'player_freighter';

    // Sci-Fi Matte-Satin Materials (zero glare)
    const darkArmorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.4,
      roughness: 0.65,
      flatShading: true,
    });
    const stripeAccentMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.35,
      roughness: 0.6,
    });
    const goldBridgeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.4,
      roughness: 0.5,
      emissive: 0x451a03,
    });
    const hangarGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.75,
    });
    const engineGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
    });

    // --- 1. Main Venator Hull (Length 170, Width 70, Height 24) ---
    const hullGeo = new THREE.BoxGeometry(32, 14, 150);
    const mainHull = new THREE.Mesh(hullGeo, darkArmorMat);
    mainHull.castShadow = true;
    mainHull.receiveShadow = true;
    group.add(mainHull);

    // Lateral Armor Wings, Spherical Cargo Pods & Dorsal Anti-Ship Turrets
    const cargoPodGeo = new THREE.SphereGeometry(3.8, 12, 10);
    [-1, 1].forEach((dir) => {
      const wingGeo = new THREE.BoxGeometry(20, 8, 120);
      const wing = new THREE.Mesh(wingGeo, darkArmorMat);
      wing.position.set(dir * 22, -1, -10);
      group.add(wing);

      // Faction Blue Stripe
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.5, 8.2, 116), stripeAccentMat);
      stripe.position.set(dir * 26, -1, -10);
      group.add(stripe);

      // Iconic NMS Venator Lateral Spherical Cargo Pods (6 per side)
      for (let p = 0; p < 6; p++) {
        const pod = new THREE.Mesh(cargoPodGeo, p % 2 === 0 ? stripeAccentMat : goldBridgeMat);
        pod.position.set(dir * 16.5, -6.5, -45 + p * 18);
        group.add(pod);
      }

      // Dorsal Point-Defense Laser Turrets
      for (let t = 0; t < 3; t++) {
        const turretBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 1.8, 8), darkArmorMat);
        turretBase.position.set(dir * 18, 3.8, -30 + t * 28);
        group.add(turretBase);
      }
    });

    // --- 2. Elevated Command Bridge Tower (Stern) ---
    const bridgeBase = new THREE.Mesh(new THREE.BoxGeometry(20, 16, 26), darkArmorMat);
    bridgeBase.position.set(0, 14, -45);
    group.add(bridgeBase);

    const bridgeSpire = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 16), stripeAccentMat);
    bridgeSpire.position.set(0, 24, -48);
    group.add(bridgeSpire);

    // Glowing Bridge Viewports
    const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(12.5, 2.2, 3), goldBridgeMat);
    bridgeGlass.position.set(0, 24.5, -39.8);
    group.add(bridgeGlass);

    // Communications Antennas
    [-4, 4].forEach((x) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 12, 6), darkArmorMat);
      mast.position.set(x, 32, -50);
      group.add(mast);

      const navBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 6), beaconMat);
      navBeacon.position.set(x, 38, -50);
      navBeacon.name = 'freighter_nav_beacon';
      group.add(navBeacon);
    });

    // --- 3. 3-Bay Tractor Beam Docking Hangar (Bow to Midship) ---
    [-10, 0, 10].forEach((xPos, idx) => {
      // Hangar Entry Opening
      const bayFrame = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 28), darkArmorMat);
      bayFrame.position.set(xPos, 8.5, 25);
      group.add(bayFrame);

      // Glowing Tractor Beam Floor Light
      const beamFloor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 26), hangarGlowMat);
      beamFloor.position.set(xPos, 6.5, 25);
      beamFloor.name = `hangar_beam_${idx + 1}`;
      group.add(beamFloor);
    });

    // Hangar Guidance Forcefield Shield
    const forcefield = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 6),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
    );
    forcefield.position.set(0, 8.5, 38);
    forcefield.name = 'hangar_forcefield';
    group.add(forcefield);

    // --- 4. Massive Rear Ion Thrusters (3 Huge Engine Bells) ---
    [-10, 0, 10].forEach((xPos) => {
      const engineBell = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.0, 14, 16), darkArmorMat);
      engineBell.rotation.x = Math.PI / 2;
      engineBell.position.set(xPos, 0, -80);
      group.add(engineBell);

      const glow = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 2, 16), engineGlowMat);
      glow.rotation.x = Math.PI / 2;
      glow.position.set(xPos, 0, -86);
      group.add(glow);
    });

    // --- 5. Escort Frigate Fleet (4 Surrounding Frigates) ---
    // A. Combat Frigate
    const combatFrigate = CapitalFreighterBuilder.createCombatFrigateMesh();
    combatFrigate.position.set(-55, 18, 30);
    combatFrigate.name = 'frigate_combat';
    group.add(combatFrigate);

    // B. Exploration Frigate
    const exploreFrigate = CapitalFreighterBuilder.createExplorationFrigateMesh();
    exploreFrigate.position.set(55, 14, -20);
    exploreFrigate.name = 'frigate_exploration';
    group.add(exploreFrigate);

    // C. Industrial Frigate
    const industrialFrigate = CapitalFreighterBuilder.createIndustrialFrigateMesh();
    industrialFrigate.position.set(-48, -20, -50);
    industrialFrigate.name = 'frigate_industrial';
    group.add(industrialFrigate);

    // D. Trade Frigate
    const tradeFrigate = CapitalFreighterBuilder.createTradeFrigateMesh();
    tradeFrigate.position.set(50, -16, 45);
    tradeFrigate.name = 'frigate_trade';
    group.add(tradeFrigate);

    return group;
  }

  /**
   * Combat Frigate: Sleek Arrowhead Warship with Dorsal Turrets
   */
  public static createCombatFrigateMesh(): THREE.Group {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const redAccent = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const body = new THREE.Mesh(new THREE.ConeGeometry(5, 32, 4), hullMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const gun1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 8), hullMat);
    gun1.position.set(-2, 3, 4);
    group.add(gun1);

    const gun2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 8), hullMat);
    gun2.position.set(2, 3, 4);
    group.add(gun2);

    const redLight = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), redAccent);
    redLight.position.set(0, 2, 14);
    group.add(redLight);

    return group;
  }

  /**
   * Exploration Frigate: Giant Science Scanner Ring and Sensor Array
   */
  public static createExplorationFrigateMesh(): THREE.Group {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const cyanGlow = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.2, 28, 8), hullMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Massive Holographic Science Sensor Ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(7, 0.45, 8, 24), cyanGlow);
    ring.position.set(0, 0, 4);
    ring.name = 'exploration_sensor_ring';
    group.add(ring);

    return group;
  }

  /**
   * Industrial Frigate: Heavy Cylindrical Ore Extraction Refinery Containers
   */
  public static createIndustrialFrigateMesh(): THREE.Group {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.4 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });

    const spine = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 34), darkMat);
    group.add(spine);

    [-8, 0, 8].forEach((zOff) => {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 6, 12), hullMat);
      tank.position.set(0, 0, zOff);
      group.add(tank);
    });

    return group;
  }

  /**
   * Trade Frigate: Modular Container Pods & Gilded Vaults
   */
  public static createTradeFrigateMesh(): THREE.Group {
    const group = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });

    const keel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 30), hullMat);
    group.add(keel);

    [-6, 6].forEach((zOff) => {
      [-3.5, 3.5].forEach((xOff) => {
        const pod = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.0, 8), goldMat);
        pod.position.set(xOff, 0, zOff);
        group.add(pod);
      });
    });

    return group;
  }
}
