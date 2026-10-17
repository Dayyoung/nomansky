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

    // 1. High-Density Ground Mesh with Multi-Elevation Biome Vertex Color Splatting
    const planeSize = 800;
    const segments = 140;
    const groundGeo = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
    groundGeo.rotateX(-Math.PI / 2);

    const posAttr = groundGeo.attributes.position;
    const colors = new Float32Array(posAttr.count * 3);

    const sandColor = new THREE.Color('#6b5b45').lerp(biomeColor, 0.35);
    const lowGrassColor = biomeColor.clone().multiplyScalar(0.62);
    const highGrassColor = biomeColor.clone().offsetHSL(0.04, 0.1, -0.05).multiplyScalar(0.65);
    const rockColor = new THREE.Color('#1e293b').lerp(biomeColor, 0.2);
    const peakColor = new THREE.Color('#475569').lerp(biomeColor, 0.25);
    const tmpColor = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getTerrainHeight(x, z);
      posAttr.setY(i, y);

      if (y < -0.5) {
        tmpColor.copy(sandColor);
      } else if (y < 6.0) {
        tmpColor.copy(sandColor).lerp(lowGrassColor, Math.min(1, (y + 0.5) / 6.5));
      } else if (y < 15.0) {
        tmpColor.copy(lowGrassColor).lerp(highGrassColor, (y - 6.0) / 9.0);
      } else if (y < 23.0) {
        tmpColor.copy(highGrassColor).lerp(rockColor, (y - 15.0) / 8.0);
      } else {
        tmpColor.copy(rockColor).lerp(peakColor, Math.min(1, (y - 23.0) / 10.0));
      }

      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1.0,
      metalness: 0.0,
      flatShading: true,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    groundMesh.castShadow = true;
    terrainGroup.add(groundMesh);

    // 1-B. Instanced Alien Grass & Spore Clusters
    const grassCount = 450;
    const grassGeo = new THREE.ConeGeometry(0.35, 1.35, 4);
    grassGeo.translate(0, 0.65, 0);
    const grassMat = new THREE.MeshStandardMaterial({
      color: highGrassColor,
      roughness: 0.95,
      metalness: 0.0,
    });
    const grassInstanced = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
    const dummy = new THREE.Object3D();
    const instColor = new THREE.Color();
    let placed = 0;
    for (let i = 0; i < grassCount * 2 && placed < grassCount; i++) {
      const gx = (Math.random() - 0.5) * 420;
      const gz = (Math.random() - 0.5) * 420;
      const gy = getTerrainHeight(gx, gz);
      if (gy < 0.5 || gy > 19.0) continue;
      dummy.position.set(gx, gy, gz);
      dummy.rotation.set((Math.random() - 0.5) * 0.25, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.25);
      const s = 0.7 + Math.random() * 0.9;
      dummy.scale.set(s, s * (0.8 + Math.random() * 0.6), s);
      dummy.updateMatrix();
      grassInstanced.setMatrixAt(placed, dummy.matrix);
      instColor.copy(highGrassColor).offsetHSL((Math.random() - 0.5) * 0.08, 0.05, (Math.random() - 0.5) * 0.06);
      grassInstanced.setColorAt(placed, instColor);
      placed++;
    }
    grassInstanced.count = placed;
    grassInstanced.instanceMatrix.needsUpdate = true;
    if (grassInstanced.instanceColor) grassInstanced.instanceColor.needsUpdate = true;
    grassInstanced.computeBoundingSphere();
    terrainGroup.add(grassInstanced);

    // 1-C. Giant Ringed Neighbor Planet & Crescent Moon in the Planetary Sky
    const skyPlanetGroup = new THREE.Group();
    skyPlanetGroup.position.set(-220, 210, -460);
    const neighborRadius = 68;
    const neighborMat = new THREE.MeshStandardMaterial({
      color: biomeColor.clone().offsetHSL(0.38, 0.15, -0.05),
      roughness: 0.95,
      metalness: 0.0,
    });
    const neighborSphere = new THREE.Mesh(new THREE.SphereGeometry(neighborRadius, 48, 48), neighborMat);
    skyPlanetGroup.add(neighborSphere);

    const skyRingGeo = new THREE.RingGeometry(neighborRadius * 1.35, neighborRadius * 2.35, 64);
    skyRingGeo.rotateX(Math.PI / 2);
    const skyRingMat = new THREE.MeshBasicMaterial({
      color: biomeColor.clone().offsetHSL(0.15, 0.2, 0.05),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    const skyRing = new THREE.Mesh(skyRingGeo, skyRingMat);
    skyRing.rotation.set(0.42, 0.2, -0.28);
    skyPlanetGroup.add(skyRing);

    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(22, 32, 32),
      new THREE.MeshStandardMaterial({
        color: biomeColor.clone().offsetHSL(0.62, 0.1, -0.05),
        roughness: 0.95,
        metalness: 0.0,
      })
    );
    moonMesh.position.set(145, 55, 40);
    skyPlanetGroup.add(moonMesh);
    terrainGroup.add(skyPlanetGroup);

    // 2. 3D Ocean / Water Plane (Matte, zero sunlight specular glare)
    if (planet.waterBodies && planet.waterBodies.length > 0) {
      const waterGeo = new THREE.PlaneGeometry(planeSize * 1.1, planeSize * 1.1, 32, 32);
      waterGeo.rotateX(-Math.PI / 2);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x075985,
        roughness: 0.92,
        metalness: 0.0,
        transparent: true,
        opacity: 0.78,
      });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.position.y = -2;
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

    // 9. 3D Subterranean Cave Entrance & Cobalt Minerals
    const caveMesh = this.createCaveMesh(-45, 35);
    terrainGroup.add(caveMesh);

    return terrainGroup;
  }

  /**
   * 9. 3D Subterranean Cave Entrance with Archway, Dark Tunnel, Cobalt Crystals & Marrow Bulbs
   */
  public static createCaveMesh(cx: number, cz: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'subterranean_cave';
    const groundY = getTerrainHeight(cx, cz);
    group.position.set(cx, groundY, cz);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.95,
      metalness: 0.1,
    });
    const cobaltCrystalMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const marrowBulbMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
    });

    // Archway Cave Entrance Rock
    const archGeo = new THREE.TorusGeometry(6.5, 2.2, 8, 16, Math.PI);
    const arch = new THREE.Mesh(archGeo, stoneMat);
    arch.position.y = 0.5;
    group.add(arch);

    // Deep Dark Tunnel Void
    const voidGeo = new THREE.CylinderGeometry(5.2, 5.2, 14, 16);
    voidGeo.rotateX(Math.PI / 2);
    const voidMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
    const voidTunnel = new THREE.Mesh(voidGeo, voidMat);
    voidTunnel.position.set(0, 1.5, -6);
    group.add(voidTunnel);

    // Glowing Cobalt Mineral Crystals
    [-3.2, 3.2, -1.8, 2.0].forEach((ox, idx) => {
      const crystalGeo = new THREE.ConeGeometry(0.65, 3.2, 6);
      const crystal = new THREE.Mesh(crystalGeo, cobaltCrystalMat);
      crystal.position.set(ox, 1.6, -2 - idx * 1.8);
      crystal.rotation.z = (idx % 2 === 0 ? 0.25 : -0.25);
      group.add(crystal);
    });

    // Luminescent Cave Marrow Bulbs
    [-2.2, 2.5, 0].forEach((ox, idx) => {
      const bulb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), marrowBulbMat);
      bulb.position.set(ox, 0.5, -3 - idx * 2.2);
      group.add(bulb);
    });

    return group;
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
          emissiveIntensity: 0.95,
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
          emissiveIntensity: 0.75,
          roughness: 0.35,
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
          emissiveIntensity: 0.85,
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
        const foliage = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1.6),
          new THREE.MeshStandardMaterial({ color: 0x2e7d32, emissive: 0x14532d, emissiveIntensity: 0.25 })
        );
        foliage.position.y = 4.2;
        foliage.castShadow = true;
        group.add(foliage);
        break;

      case 'ferrite':
      default: // Pure Ferrite Rock / Boulder
        mat = new THREE.MeshStandardMaterial({
          color: 0x78909c,
          roughness: 0.85,
          metalness: 0.45,
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
   * Creates 3D Iconic No Man's Sky Alien Flora Mesh (Tiered Bioluminescent Mushrooms & Multi-Canopy Alien Trees)
   */
  public static createFloraMesh(flora: FloraEntity): THREE.Group {
    const group = new THREE.Group();
    const x = flora.lx * 0.15;
    const z = flora.ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);

    const plantColor = new THREE.Color(flora.color || '#48bb78');
    const accentGlow = plantColor.clone().offsetHSL(0.18, 0.35, 0.15);
    const scaleFactor = Math.max(0.85, Math.min(1.65, (flora.size || 1) * 0.95));
    group.scale.setScalar(scaleFactor);

    if (flora.type === 'MUSHROOM') {
      // Iconic NMS Tiered Bioluminescent Mushroom Tree with Glowing Gill Ring & Floating Spores
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0xdbeafe,
        roughness: 0.55,
        metalness: 0.1,
      });
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.85, 4.6, 10), stemMat);
      stem.position.y = 2.3;
      stem.castShadow = true;
      group.add(stem);

      // Primary Bioluminescent Umbrella Cap
      const capMat = new THREE.MeshStandardMaterial({
        color: plantColor,
        emissive: plantColor,
        emissiveIntensity: 0.65,
        roughness: 0.28,
      });
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(2.6, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
        capMat
      );
      cap.position.y = 4.4;
      cap.castShadow = true;
      group.add(cap);

      // Glowing Underneath Gill Ring
      const gillRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.55, 0.18, 8, 24),
        new THREE.MeshBasicMaterial({ color: accentGlow })
      );
      gillRing.rotation.x = Math.PI / 2;
      gillRing.position.y = 4.35;
      group.add(gillRing);

      // Secondary Shelf Mini-Caps on Stem
      [-1, 1].forEach((dir, idx) => {
        const subCap = new THREE.Mesh(
          new THREE.SphereGeometry(1.05, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
          capMat
        );
        subCap.position.set(dir * 0.65, 2.1 + idx * 0.9, 0.3 * dir);
        subCap.rotation.z = -dir * 0.25;
        group.add(subCap);
      });

      // Floating Bioluminescent Spore Orbs
      for (let s = 0; s < 3; s++) {
        const spore = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 8, 8),
          new THREE.MeshBasicMaterial({ color: accentGlow })
        );
        const ang = (s * Math.PI * 2) / 3;
        spore.position.set(Math.cos(ang) * 2.1, 3.6 + s * 0.7, Math.sin(ang) * 2.1);
        group.add(spore);
      }
    } else {
      // Worlds Part I Multi-Canopy Alien Dragon-Palm with Luminous Fruit Pods
      const barkMat = new THREE.MeshStandardMaterial({
        color: 0x4a3525,
        roughness: 0.85,
      });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.9, 6.2, 8), barkMat);
      trunk.position.y = 3.1;
      trunk.castShadow = true;
      group.add(trunk);

      // Segmented Bark Rings along Trunk
      [1.8, 3.4, 4.9].forEach((ry) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.58 - ry * 0.04, 0.09, 6, 12),
          new THREE.MeshStandardMaterial({ color: 0x291d12, roughness: 0.9 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = ry;
        group.add(ring);
      });

      // Multi-layered vibrant alien canopy domes
      const canopyMat = new THREE.MeshStandardMaterial({
        color: plantColor,
        emissive: plantColor.clone().multiplyScalar(0.35),
        emissiveIntensity: 0.4,
        roughness: 0.45,
        flatShading: true,
      });
      const mainCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), canopyMat);
      mainCanopy.position.y = 6.5;
      mainCanopy.scale.set(1.35, 0.65, 1.35);
      mainCanopy.castShadow = true;
      group.add(mainCanopy);

      const upperCanopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.65, 1),
        new THREE.MeshStandardMaterial({
          color: accentGlow,
          emissive: accentGlow,
          emissiveIntensity: 0.45,
          roughness: 0.4,
          flatShading: true,
        })
      );
      upperCanopy.position.set(0.4, 7.6, -0.3);
      upperCanopy.scale.set(1.2, 0.6, 1.2);
      group.add(upperCanopy);

      // Hanging Bioluminescent Fruit Pods under Canopy
      [-1.2, 1.2].forEach((ox, idx) => {
        const pod = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.32, 0),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        pod.position.set(ox, 5.4, idx === 0 ? 0.8 : -0.8);
        group.add(pod);
      });
    }

    return group;
  }

  /**
   * Procedural Flora Seeder when no fixed list is present
   */
  private static generateProceduralFlora(group: THREE.Group, biomeColor: THREE.Color) {
    const numFlora = 52;
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
   * Creates iconic 3D No Man's Sky Alien Monolith Sanctuary with Levitating Crimson Atlas Octahedron Core
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
      color: 0x111827,
      roughness: 0.18,
      metalness: 0.88,
    });
    const glowRuneMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
    });
    const crimsonAtlasMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff0044,
      emissiveIntensity: 1.4,
      roughness: 0.15,
      metalness: 0.5,
    });

    // Stepped Ancient Obsidian Sanctuary Base Platform
    const basePlatform = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 10.2, 1.2, 6), stoneMat);
    basePlatform.position.y = 0.6;
    basePlatform.receiveShadow = true;
    group.add(basePlatform);

    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(7.8, 0.15, 8, 6), glowRuneMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = 1.25;
    group.add(baseRing);

    // Central Twin Obelisk Towers framing the Crimson Atlas Core
    [-2.4, 2.4].forEach((ox) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 15.0, 2.8), stoneMat);
      pillar.position.set(ox, 8.0, 0);
      pillar.castShadow = true;
      group.add(pillar);
    });

    // Upper Monolith Crown Bridge
    const crown = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.2, 3.0), stoneMat);
    crown.position.set(0, 16.2, 0);
    crown.castShadow = true;
    group.add(crown);

    // Levitating Crimson Atlas Octahedron Core in the Monolith Chamber
    const atlasCore = new THREE.Mesh(new THREE.OctahedronGeometry(2.1, 0), crimsonAtlasMat);
    atlasCore.position.set(0, 9.2, 0);
    group.add(atlasCore);

    // Golden Orbital Ring around the Atlas Core
    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.1, 0.12, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    orbitRing.position.set(0, 9.2, 0);
    orbitRing.rotation.set(0.6, 0.4, 0.2);
    group.add(orbitRing);

    // Glowing Glyph Band on Crown
    const ringGeo = new THREE.BoxGeometry(7.4, 0.35, 3.2);
    const ring = new THREE.Mesh(ringGeo, glowRuneMat);
    ring.position.y = 16.2;
    group.add(ring);

    // Surrounding hovering monolith stones
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const subStone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4.5, 1.2), stoneMat);
      subStone.position.set(Math.sin(angle) * 7.2, 4.0, Math.cos(angle) * 7.2);
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
