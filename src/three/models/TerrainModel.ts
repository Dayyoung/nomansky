import * as THREE from 'three';
import { PlanetEntity, DepositEntity, FloraEntity } from '../../types';
import { PlanetaryStructuresBuilder } from './PlanetaryStructuresModel';

export function getTerrainHeight(x: number, z: number): number {
  const h1 = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 14;
  const h2 = Math.sin(x * 0.04 + 1.2) * Math.sin(z * 0.035 + 0.8) * 6;
  const h3 = Math.cos(x * 0.005) * Math.sin(z * 0.005) * 22;
  return h1 + h2 + h3;
}

export class TerrainBuilder {
  /**
   * Generates a 3D procedural planetary terrain surface with biome ground,
   * oceans, vegetation, mineral deposits, alien monoliths, and mountains.
   */
  public static createSurfaceTerrain(planet: PlanetEntity): THREE.Group {
    const terrainGroup = new THREE.Group();
    terrainGroup.name = `surface_${planet.name}`;

    const biomeColor = new THREE.Color(planet.color || '#2e8b57');

    // 1. High-Density Ground Mesh with Procedural Elevation
    const planeSize = 800;
    const segments = 120;
    const groundGeo = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
    groundGeo.rotateX(-Math.PI / 2);

    const posAttr = groundGeo.attributes.position;
    // Generate height using multi-frequency sine/cosine noise
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      posAttr.setY(i, getTerrainHeight(x, z));
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: biomeColor,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    groundMesh.castShadow = true;
    terrainGroup.add(groundMesh);

    // 2. 3D Ocean / Water Plane (if planet has water bodies or lush biome)
    if (planet.waterBodies && planet.waterBodies.length > 0) {
      const waterGeo = new THREE.PlaneGeometry(planeSize * 1.1, planeSize * 1.1);
      waterGeo.rotateX(-Math.PI / 2);
      const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x0077be,
        emissive: 0x001a33,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.6,
        transparent: true,
        opacity: 0.82,
        reflectivity: 0.8,
      });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.position.y = -2; // Sea level
      waterMesh.name = 'ocean';
      terrainGroup.add(waterMesh);
    }

    // 3. 3D Mineral Resource Deposits (Ferrite, Sodium, Carbon, Oxygen, Di-hydrogen)
    if (planet.deposits) {
      planet.deposits.forEach((dep) => {
        const depMesh = this.createDepositMesh(dep);
        terrainGroup.add(depMesh);
      });
    }

    // 4. 3D Alien Flora (Trees, glowing mushrooms, spires)
    if (planet.flora && planet.flora.length > 0) {
      planet.flora.forEach((f) => {
        const floraMesh = this.createFloraMesh(f);
        terrainGroup.add(floraMesh);
      });
    } else {
      // Procedurally seed flora across terrain
      this.generateProceduralFlora(terrainGroup, biomeColor);
    }

    // 5. 3D Alien Monolith / Ancient Ruin
    if (planet.monolith) {
      const monolithMesh = this.createMonolithMesh(planet.monolith.lx, planet.monolith.ly);
      terrainGroup.add(monolithMesh);
    } else {
      const monolithMesh = this.createMonolithMesh(0, 40);
      terrainGroup.add(monolithMesh);
    }

    // 5-B. 3D Planetary Habitation / Trade Outpost with Landing Pad & Beacon
    const tradeOutpostMesh = PlanetaryStructuresBuilder.createTradeOutpostMesh(55, -45);
    terrainGroup.add(tradeOutpostMesh);

    // 5-C. 3D Ancient Stargate Portal Ring with Active Event Horizon
    const portalMesh = PlanetaryStructuresBuilder.createPortalMesh(-65, 55);
    terrainGroup.add(portalMesh);

    // 5-D. 3D Crashed Starship Salvage Site with Smoking Wreckage
    const crashedShipMesh = PlanetaryStructuresBuilder.createCrashedShipMesh(85, 75);
    terrainGroup.add(crashedShipMesh);

    // 5-E. 3D Planetary Base Housing Complex (Base Computer, Bio-Dome, Solar Grid, Living Dome)
    const baseHousingMesh = PlanetaryStructuresBuilder.createBaseHousingMesh(24, 18);
    terrainGroup.add(baseHousingMesh);

    // 5-F. 3D Planetary Settlement Colony (Frontiers Overseer Town Hall, Citizens, Dwellings & Bazaar)
    const settlementMesh = PlanetaryStructuresBuilder.createSettlementColonyMesh(-36, -27);
    terrainGroup.add(settlementMesh);

    // 6. 3D Knowledge Stones
    if (planet.knowledgeStones) {
      planet.knowledgeStones.forEach((ks) => {
        const ksMesh = this.createKnowledgeStoneMesh(ks.lx, ks.ly, ks.race);
        terrainGroup.add(ksMesh);
      });
    }

    // 7. 3D Storm Crystals
    if (planet.stormCrystals) {
      planet.stormCrystals.forEach((sc) => {
        const scMesh = this.createStormCrystalMesh(sc.lx, sc.ly);
        terrainGroup.add(scMesh);
      });
    }

    // 8. 3D Floating Islands
    if (planet.floatingIslands && planet.floatingIslands.length > 0) {
      planet.floatingIslands.forEach((isl) => {
        const islandMesh = this.createFloatingIslandMesh(isl.cx, isl.cy, isl.width);
        terrainGroup.add(islandMesh);
      });
    }

    return terrainGroup;
  }

  /**
   * Creates 3D Deposit Mesh matching iconic No Man's Sky mineral structures
   */
  public static createDepositMesh(dep: DepositEntity): THREE.Group {
    const group = new THREE.Group();
    group.name = `deposit_${dep.id}`;
    const x = dep.lx * 0.15;
    const z = dep.ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);

    let mat: THREE.Material;
    let geo: THREE.BufferGeometry;

    switch (dep.type) {
      case 'sodium': // Glowing yellow sodium crystal cluster
        mat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0xffaa00,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.3,
        });
        geo = new THREE.ConeGeometry(1.2, 3.5, 5);
        // Cluster of 3 crystals
        [-0.4, 0.4].forEach((offX, idx) => {
          const crystal = new THREE.Mesh(geo, mat);
          crystal.position.set(offX, 1.5, (idx === 0 ? -0.3 : 0.3));
          crystal.rotation.z = offX * 0.4;
          crystal.castShadow = true;
          group.add(crystal);
        });
        break;

      case 'oxygen': // Oxygen rich red bulbous flora
        mat = new THREE.MeshStandardMaterial({
          color: 0xff1744,
          emissive: 0xd50000,
          emissiveIntensity: 0.6,
          roughness: 0.4,
        });
        geo = new THREE.SphereGeometry(1.4, 12, 12);
        const bulb = new THREE.Mesh(geo, mat);
        bulb.position.y = 1.6;
        bulb.castShadow = true;
        group.add(bulb);
        break;

      case 'dihydrogen': // Bright blue jagged crystal cluster
        mat = new THREE.MeshPhysicalMaterial({
          color: 0x00e5ff,
          emissive: 0x00b0ff,
          emissiveIntensity: 0.7,
          roughness: 0.1,
          metalness: 0.2,
          transmission: 0.5,
          transparent: true,
          opacity: 0.9,
        });
        geo = new THREE.ConeGeometry(0.9, 4.2, 4);
        for (let i = 0; i < 4; i++) {
          const c = new THREE.Mesh(geo, mat);
          c.position.set(Math.sin(i * 1.5) * 0.6, 2.0, Math.cos(i * 1.5) * 0.6);
          c.rotation.x = Math.sin(i) * 0.3;
          c.rotation.z = Math.cos(i) * 0.3;
          c.castShadow = true;
          group.add(c);
        }
        break;

      case 'carbon': // Tall Carbon rich alien plant/stem
        mat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.7 });
        geo = new THREE.CylinderGeometry(0.3, 0.6, 3.8, 8);
        const trunk = new THREE.Mesh(geo, mat);
        trunk.position.y = 1.9;
        group.add(trunk);
        const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), new THREE.MeshStandardMaterial({ color: 0x2e7d32 }));
        foliage.position.y = 4.2;
        foliage.castShadow = true;
        group.add(foliage);
        break;

      case 'ferrite':
      default: // Pure Ferrite Rock / Boulder
        mat = new THREE.MeshStandardMaterial({
          color: 0x78909c,
          roughness: 0.9,
          metalness: 0.4,
          flatShading: true,
        });
        geo = new THREE.DodecahedronGeometry(2.2);
        const rock = new THREE.Mesh(geo, mat);
        rock.position.y = 1.5;
        rock.scale.set(1.2, 0.8, 1.0);
        rock.castShadow = true;
        group.add(rock);
        break;
    }

    return group;
  }

  /**
   * Creates 3D Flora Mesh
   */
  public static createFloraMesh(flora: FloraEntity): THREE.Group {
    const group = new THREE.Group();
    const x = flora.lx * 0.15;
    const z = flora.ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);

    const plantColor = new THREE.Color(flora.color || '#48bb78');

    if (flora.type === 'MUSHROOM') {
      // Giant bioluminescent mushroom
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.7, 4.0, 8),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
      );
      stem.position.y = 2.0;
      group.add(stem);

      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
        new THREE.MeshStandardMaterial({ color: plantColor, emissive: plantColor, emissiveIntensity: 0.4, roughness: 0.3 })
      );
      cap.position.y = 4.0;
      cap.castShadow = true;
      group.add(cap);
    } else {
      // Alien Palm / Spire Tree
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.8, 5.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 })
      );
      trunk.position.y = 2.75;
      group.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2.6, 3.8, 6),
        new THREE.MeshStandardMaterial({ color: plantColor, roughness: 0.5, flatShading: true })
      );
      leaves.position.y = 6.0;
      leaves.castShadow = true;
      group.add(leaves);
    }

    return group;
  }

  /**
   * Procedural Flora Seeder when no fixed list is present
   */
  private static generateProceduralFlora(group: THREE.Group, biomeColor: THREE.Color) {
    const numFlora = 45;
    for (let i = 0; i < numFlora; i++) {
      const fx = (Math.random() - 0.5) * 500;
      const fz = (Math.random() - 0.5) * 500;

      const mockFlora: FloraEntity = {
        id: `flora_gen_${i}`,
        lx: fx / 0.15,
        ly: fz / 0.15,
        type: i % 2 === 0 ? 'MUSHROOM' : 'TREE',
        size: 1 + Math.random() * 0.8,
        color: biomeColor.getStyle(),
        swayOffset: Math.random() * Math.PI,
      };
      group.add(this.createFloraMesh(mockFlora));
    }
  }

  /**
   * Creates iconic 3D No Man's Sky Alien Monolith / Ruin
   */
  public static createMonolithMesh(lx: number, ly: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'alien_monolith';
    const x = lx * 0.15;
    const z = ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);

    // Dark Obsidian Stone with Gold/Cyan Glowing Inscriptions
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1a202c,
      roughness: 0.2,
      metalness: 0.8,
    });
    const glowRuneMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
    });

    // Central Obelisk Tower
    const obeliskGeo = new THREE.BoxGeometry(3.0, 14.0, 3.0);
    const obelisk = new THREE.Mesh(obeliskGeo, stoneMat);
    obelisk.position.y = 7.0;
    obelisk.castShadow = true;
    group.add(obelisk);

    // Glowing Glyph Band
    const ringGeo = new THREE.BoxGeometry(3.2, 0.4, 3.2);
    const ring = new THREE.Mesh(ringGeo, glowRuneMat);
    ring.position.y = 8.5;
    group.add(ring);

    // Surrounding hovering monolith stones
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const subStone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.0, 1.2), stoneMat);
      subStone.position.set(Math.sin(angle) * 6.5, 3.5, Math.cos(angle) * 6.5);
      subStone.rotation.y = angle;
      group.add(subStone);
    }

    return group;
  }

  /**
   * Creates 3D Knowledge Stone (지식의 돌) with glowing alien rune glyphs
   */
  public static createKnowledgeStoneMesh(lx: number, ly: number, _race: string): THREE.Group {
    const group = new THREE.Group();
    group.name = `knowledge_stone`;
    const x = lx * 0.15;
    const z = ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);

    // Alien Stone Pillar with cyan glowing core
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.5, metalness: 0.5 });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 3.6, 6), stoneMat);
    pillar.position.y = 1.8;
    pillar.castShadow = true;
    group.add(pillar);

    // Glowing alien glyph sphere on top
    const orb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65), runeMat);
    orb.position.y = 4.1;
    group.add(orb);

    return group;
  }

  /**
   * Creates 3D Storm Crystal (폭풍 수정) with electrical arc glow
   */
  public static createStormCrystalMesh(lx: number, ly: number): THREE.Group {
    const group = new THREE.Group();
    group.name = `storm_crystal`;
    const x = lx * 0.15;
    const z = ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x80d8ff,
      emissive: 0x00b0ff,
      emissiveIntensity: 0.9,
      transmission: 0.8,
      transparent: true,
      opacity: 0.95,
      roughness: 0.1,
    });

    const geo = new THREE.ConeGeometry(0.8, 3.8, 5);
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(geo, crystalMat);
      c.position.set(Math.sin(i * 2.1) * 0.5, 1.9, Math.cos(i * 2.1) * 0.5);
      c.rotation.z = (Math.random() - 0.5) * 0.35;
      c.castShadow = true;
      group.add(c);
    }

    return group;
  }

  /**
   * Creates 3D Floating Island hovering in the sky
   */
  public static createFloatingIslandMesh(cx: number, cy: number, width: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'floating_island';
    group.position.set(cx * 0.15, 45, cy * 0.15);

    const rockGeo = new THREE.ConeGeometry(width * 0.1, 18, 12);
    rockGeo.rotateX(Math.PI); // Inverted cone for floating rock base
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.9, flatShading: true });
    const islandBase = new THREE.Mesh(rockGeo, rockMat);
    group.add(islandBase);

    // Top Lush Grass Cap
    const capGeo = new THREE.CylinderGeometry(width * 0.1, width * 0.08, 1.5, 12);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x48bb78, roughness: 0.7 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.5;
    group.add(cap);

    return group;
  }
}
