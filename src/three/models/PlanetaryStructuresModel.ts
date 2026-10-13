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
}
