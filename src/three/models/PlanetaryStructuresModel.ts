import * as THREE from 'three';
import { getTerrainHeight } from './TerrainModel';

/**
 * 3D Planetary Structures & Exocraft (No Man's Sky Origins / Aquarius / Worlds)
 */
export class PlanetaryStructuresBuilder {
  /**
   * 1. Ancient Alien Stargate Portal with Swirling Event Horizon
   */
  public static createPortalMesh(lx: number, lz: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'ancient_portal';
    const groundY = getTerrainHeight(lx, lz);
    group.position.set(lx, groundY, lz);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1f2428,
      metalness: 0.3,
      roughness: 0.85,
      flatShading: true,
    });
    const glyphMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
    });
    const eventHorizonMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    // Outer Obsidian Stargate Arch (Diameter ~22m)
    const archGeo = new THREE.TorusGeometry(11, 2.4, 8, 24);
    const arch = new THREE.Mesh(archGeo, stoneMat);
    arch.position.y = 11;
    arch.castShadow = true;
    group.add(arch);

    // Glowing Glyph Pillars around Arch
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const glyph = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.8), glyphMat);
      glyph.position.set(Math.cos(angle) * 11, 11 + Math.sin(angle) * 11, 1.3);
      group.add(glyph);
    }

    // Portal Energy Event Horizon (Water-like membrane)
    const horizonGeo = new THREE.CircleGeometry(9.6, 32);
    const horizon = new THREE.Mesh(horizonGeo, eventHorizonMat);
    horizon.position.y = 11;
    horizon.name = 'portal_event_horizon';
    group.add(horizon);

    // Pedestal Platform
    const pedGeo = new THREE.CylinderGeometry(15, 18, 2.5, 8);
    const pedestal = new THREE.Mesh(pedGeo, stoneMat);
    pedestal.position.y = 1.25;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    return group;
  }

  /**
   * 2. Planetary Trade Outpost & Habitation Shelter Base
   */
  public static createTradeOutpostMesh(lx: number, lz: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'trade_outpost';
    const groundY = getTerrainHeight(lx, lz);
    group.position.set(lx, groundY, lz);

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.35,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.25,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f5ff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.6,
    });
    const yellowLightMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Main Geodesic Habitation Dome
    const domeGeo = new THREE.SphereGeometry(12, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const dome = new THREE.Mesh(domeGeo, metalMat);
    dome.position.y = 3;
    dome.castShadow = true;
    group.add(dome);

    // Observation Window Ring
    const windowRing = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9.5, 2.5, 16, 1, true), glassMat);
    windowRing.position.y = 6;
    group.add(windowRing);

    // Structural Base Support Columns
    const basePillar = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 13, 3, 16), frameMat);
    basePillar.position.y = 1.5;
    group.add(basePillar);

    // Tall Communications Radio Antenna with Blinking Strobe
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 22, 8), frameMat);
    antenna.position.set(0, 23, 0);
    group.add(antenna);

    const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), yellowLightMat);
    beaconLight.position.set(0, 34, 0);
    beaconLight.name = 'outpost_beacon';
    group.add(beaconLight);

    // Starship Octagonal Landing Pad
    const padGeo = new THREE.CylinderGeometry(14, 14, 1.2, 8);
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(24, 1.2, 0);
    pad.receiveShadow = true;
    group.add(pad);

    // Glowing Runway Corner Beacons
    for (let c = 0; c < 8; c++) {
      const angle = (c / 8) * Math.PI * 2;
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), yellowLightMat);
      light.position.set(24 + Math.cos(angle) * 13, 2.0, Math.sin(angle) * 13);
      group.add(light);
    }

    return group;
  }

  /**
   * 3. Smoking Crashed Starship Salvage Site
   */
  public static createCrashedShipMesh(lx: number, lz: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'crashed_starship';
    const groundY = getTerrainHeight(lx, lz);
    group.position.set(lx, groundY, lz);

    const charredMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.9,
      metalness: 0.5,
    });
    const brokenWingMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.7,
      metalness: 0.4,
    });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    // Tilted crash fuselage partly embedded in dirt
    const hullGeo = new THREE.ConeGeometry(2.4, 9, 6);
    hullGeo.rotateX(Math.PI / 2.3);
    const hull = new THREE.Mesh(hullGeo, charredMat);
    hull.position.set(0, 1.8, 0);
    hull.rotation.z = 0.45;
    hull.castShadow = true;
    group.add(hull);

    // Broken Wing sheared off in crash
    const wingGeo = new THREE.BoxGeometry(7, 0.4, 3);
    const wing = new THREE.Mesh(wingGeo, brokenWingMat);
    wing.position.set(4, 1, 2);
    wing.rotation.set(0.3, 0.5, -0.6);
    group.add(wing);

    // Burning Engine Spark
    const spark = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9), fireMat);
    spark.position.set(-1.2, 2.2, -3);
    spark.name = 'crash_fire';
    group.add(spark);

    // Salvage Tech Cargo Pods around the site
    [-3, 3].forEach((offX, idx) => {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 2.4), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
      pod.position.set(offX, 0.8, (idx === 0 ? 3.5 : -3.5));
      pod.rotation.y = idx * 0.8;
      group.add(pod);
    });

    return group;
  }

  /**
   * 4. 3D Minotaur Exocraft Walker Mech
   */
  public static createMinotaurMesh(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'minotaur_mech';

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Hardpoint blue & yellow hazard
      metalness: 0.75,
      roughness: 0.35,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.4,
    });
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0xffaa00,
      emissive: 0x995500,
      roughness: 0.1,
      metalness: 0.3,
    });

    // Heavy Torso Cockpit
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 2.2), armorMat);
    torso.position.y = 3.6;
    torso.castShadow = true;
    group.add(torso);

    // Mech Visor Eye
    const visor = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.5), visorMat);
    visor.position.set(0, 4.0, 1.15);
    group.add(visor);

    // Shoulder Cannon Arm (Mining Bore & Cannon)
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 3.2, 8), frameMat);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(1.6, 4.4, 0.6);
    group.add(cannon);

    // Heavy Hydraulic Bipedal Legs
    [-1.0, 1.0].forEach((side) => {
      // Upper leg
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.0, 8), frameMat);
      thigh.position.set(side, 2.4, 0);
      group.add(thigh);

      // Lower foot pad
      const foot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.8), armorMat);
      foot.position.set(side, 0.3, 0.2);
      foot.castShadow = true;
      group.add(foot);
    });

    return group;
  }

  /**
   * 5. Planetary Base Housing Complex (No Man's Sky Base Computer, Bio-Dome, Solar & Living Quarters)
   */
  public static createBaseHousingMesh(lx: number, lz: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'base_housing_complex';
    const groundY = getTerrainHeight(lx, lz);
    group.position.set(lx, groundY, lz);

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.35,
    });
    const orangeAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.6,
      roughness: 0.4,
    });
    const darkFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const holoMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const floraGreenMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x15803d,
      roughness: 0.6,
    });
    const glowYellowMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const solarCellMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.9,
      roughness: 0.2,
    });

    // --- A. Cylindrical Prefab Habitation Room ---
    const habRoom = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 4.5, 16), metalMat);
    habRoom.position.set(0, 2.25, 0);
    habRoom.castShadow = true;
    habRoom.receiveShadow = true;
    group.add(habRoom);

    // Habitation Trim Band
    const habTrim = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, 0.8, 16), orangeAccentMat);
    habTrim.position.set(0, 2.25, 0);
    group.add(habTrim);

    // Observation Windows Ring
    for (let w = 0; w < 6; w++) {
      const angle = (w / 6) * Math.PI * 2;
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.4), glassMat);
      win.position.set(Math.sin(angle) * 6.55, 2.8, Math.cos(angle) * 6.55);
      win.rotation.y = angle;
      group.add(win);
    }

    // Airlock Door Frame
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.6), darkFrameMat);
    door.position.set(0, 1.6, 6.6);
    group.add(door);
    const doorLight = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), glowYellowMat);
    doorLight.position.set(0, 3.4, 6.9);
    group.add(doorLight);

    // --- B. Glass Bio-Dome Greenhouse with Star Bramble Crops ---
    const bioDomeGroup = new THREE.Group();
    bioDomeGroup.position.set(15, 0, 0);

    // Connecting Pressurized Corridor
    const corridor = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 9, 8), darkFrameMat);
    corridor.rotation.z = Math.PI / 2;
    corridor.position.set(7.5, 2.0, 0);
    group.add(corridor);

    // Bio-Dome Foundation Pedestal
    const bioBase = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 8.0, 1.6, 16), darkFrameMat);
    bioBase.position.y = 0.8;
    bioDomeGroup.add(bioBase);

    // Geodesic Glass Dome
    const bioGlass = new THREE.Mesh(
      new THREE.SphereGeometry(7.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      glassMat
    );
    bioGlass.position.y = 1.6;
    bioDomeGroup.add(bioGlass);

    // Bio-Dome Interior Star Bramble & NipNip Planters
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const dist = 4.2;
      const planter = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.8, 0.7, 8), darkFrameMat);
      planter.position.set(Math.sin(angle) * dist, 1.95, Math.cos(angle) * dist);
      bioDomeGroup.add(planter);

      const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), floraGreenMat);
      plant.position.set(Math.sin(angle) * dist, 2.7, Math.cos(angle) * dist);
      bioDomeGroup.add(plant);
    }
    group.add(bioDomeGroup);

    // --- C. Iconic Base Computer Pedestal ---
    const baseCompGroup = new THREE.Group();
    baseCompGroup.position.set(-8, 0, 8);

    const compStand = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1.6, 8), darkFrameMat);
    compStand.position.y = 0.8;
    baseCompGroup.add(compStand);

    const compCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), orangeAccentMat);
    compCore.position.y = 1.9;
    baseCompGroup.add(compCore);

    // Spinning Holographic Archive Ring
    const holoRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 16), holoMat);
    holoRing.rotation.x = Math.PI / 3;
    holoRing.position.y = 1.9;
    holoRing.name = 'base_computer_holo_ring';
    baseCompGroup.add(holoRing);

    const compAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.5, 6), darkFrameMat);
    compAntenna.position.set(0.6, 2.2, 0);
    baseCompGroup.add(compAntenna);

    const compBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    compBeacon.position.set(0.6, 3.5, 0);
    baseCompGroup.add(compBeacon);
    group.add(baseCompGroup);

    // --- D. Solar Power Array & Battery Banks ---
    const solarGroup = new THREE.Group();
    solarGroup.position.set(-14, 0, -6);

    [-3.5, 3.5].forEach((offsetZ) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.2, 6), darkFrameMat);
      pole.position.set(0, 1.1, offsetZ);
      solarGroup.add(pole);

      const panel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 2.8), solarCellMat);
      panel.position.set(0, 2.2, offsetZ);
      panel.rotation.x = -0.45; // Angled to sunlight
      solarGroup.add(panel);
    });

    // Battery Bank Unit
    const battery = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 1.8), darkFrameMat);
    battery.position.set(4, 1.3, 0);
    solarGroup.add(battery);

    const battGlow = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.9), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    battGlow.position.set(4, 1.8, 0);
    solarGroup.add(battGlow);
    group.add(solarGroup);

    // --- E. Holographic Expansion Construction Scaffold ---
    const holoScaffold = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 7), holoMat);
    holoScaffold.position.set(-1.5, 2.5, -12);
    holoScaffold.name = 'holo_scaffold';
    group.add(holoScaffold);

    return group;
  }

  /**
   * 6. Planetary Settlement Colony (No Man's Sky Frontiers Overseer Town Hall, Citizens & Bazaar)
   */
  public static createSettlementColonyMesh(lx: number, lz: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'settlement_colony';
    const groundY = getTerrainHeight(lx, lz);
    group.position.set(lx, groundY, lz);

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
      metalness: 0.15,
    });
    const rustMetalMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.7,
      roughness: 0.5,
    });
    const woodClayMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.85,
    });
    const goldCrestMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x78350f,
    });
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    // --- A. Overseer Administration Office (Town Hall) ---
    const townHall = new THREE.Group();
    townHall.position.set(0, 0, 0);

    // Main 2-Story Monolithic Building
    const hallBody = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 12), concreteMat);
    hallBody.position.y = 4;
    hallBody.castShadow = true;
    hallBody.receiveShadow = true;
    townHall.add(hallBody);

    // Overhanging Roof Canopy
    const hallRoof = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 14), rustMetalMat);
    hallRoof.position.y = 8.6;
    townHall.add(hallRoof);

    // Golden Overseer Crest Hologram above Entrance
    const crest = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.8, 8), goldCrestMat);
    crest.position.set(0, 6.2, 6.1);
    townHall.add(crest);

    // Grand Entrance Airlock Pillars
    [-2.8, 2.8].forEach((posX) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.0, 1.2), rustMetalMat);
      pillar.position.set(posX, 2.5, 6.2);
      townHall.add(pillar);
    });

    // Tall Communications Tower with Warning Beacon
    const radioSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.7, 26, 8), rustMetalMat);
    radioSpire.position.set(6, 17, -4);
    townHall.add(radioSpire);

    const radioBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    radioBeacon.position.set(6, 30, -4);
    radioBeacon.name = 'settlement_spire_beacon';
    townHall.add(radioBeacon);
    group.add(townHall);

    // --- B. Settler Habitation Dwellings (3 Homes) ---
    const dwellingPositions = [
      { x: -16, z: 8, rot: 0.35 },
      { x: 16, z: 8, rot: -0.35 },
      { x: -14, z: -14, rot: 1.2 },
    ];

    dwellingPositions.forEach((pos, idx) => {
      const house = new THREE.Group();
      house.position.set(pos.x, 0, pos.z);
      house.rotation.y = pos.rot;

      const body = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 6), rustMetalMat);
      body.position.y = 2.25;
      body.castShadow = true;
      house.add(body);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 3), woodClayMat);
      awning.position.set(0, 3.8, 3.2);
      awning.rotation.x = 0.25;
      house.add(awning);

      // Window Light
      const windowLight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.2), lanternMat);
      windowLight.position.set(-1.6, 2.6, 3.05);
      house.add(windowLight);

      house.name = `settlement_dwelling_${idx + 1}`;
      group.add(house);
    });

    // --- C. Marketplace Bazaar Canopy & Cargo Pods ---
    const bazaar = new THREE.Group();
    bazaar.position.set(14, 0, -12);

    // Canopy Poles & Fabric Roof
    for (let c = 0; c < 4; c++) {
      const px = (c % 2 === 0 ? -3.5 : 3.5);
      const pz = (c < 2 ? -3.5 : 3.5);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.2, 6), rustMetalMat);
      pole.position.set(px, 2.1, pz);
      bazaar.add(pole);
    }
    const tentRoof = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 8), woodClayMat);
    tentRoof.position.y = 4.3;
    bazaar.add(tentRoof);

    // Barter Crates
    [-1.8, 1.8].forEach((cx, i) => {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.6), concreteMat);
      crate.position.set(cx, 0.7, i === 0 ? 0 : 1.2);
      bazaar.add(crate);
    });
    group.add(bazaar);

    // --- D. Animated Citizen NPC Figures (Korvax, Vy'keen, Gek) ---
    const citizens = [
      { name: 'citizen_korvax', x: -5, z: 8, color: 0x38bdf8, height: 2.2, headY: 2.4 },
      { name: 'citizen_vykeen', x: 2, z: 10, color: 0xef4444, height: 2.5, headY: 2.7 },
      { name: 'citizen_gek', x: 12, z: -8, color: 0xfacc15, height: 1.6, headY: 1.8 },
    ];

    citizens.forEach((npc) => {
      const npcGroup = new THREE.Group();
      npcGroup.name = npc.name;
      npcGroup.position.set(npc.x, 0, npc.z);

      // Torso
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, npc.height * 0.6, 8),
        new THREE.MeshStandardMaterial({ color: npc.color, roughness: 0.6 })
      );
      torso.position.y = npc.height * 0.45;
      torso.castShadow = true;
      npcGroup.add(torso);

      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      head.position.y = npc.headY;
      npcGroup.add(head);

      group.add(npcGroup);
    });

    // --- E. Streetlamp Pylons illuminating Settlement Plaza ---
    const lampCoords = [
      { x: -6, z: 2 },
      { x: 6, z: 2 },
      { x: 0, z: 14 },
    ];
    lampCoords.forEach((lp) => {
      const lampPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 4.5, 6), rustMetalMat);
      lampPillar.position.set(lp.x, 2.25, lp.z);
      group.add(lampPillar);

      const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), lanternMat);
      lampHead.position.set(lp.x, 4.6, lp.z);
      group.add(lampHead);
    });

    return group;
  }
}

