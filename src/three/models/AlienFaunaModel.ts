import * as THREE from 'three';
import { FaunaEntity } from '../../types';
import { getTerrainHeight } from './TerrainModel';

export class AlienFaunaModel {
  /**
   * Generates a 3D procedural No Man's Sky Alien Creature (외계 동물)
   * Supports 3 iconic NMS archetypes:
   * - DIPLO (장경룡 브라키오형 거대 초식동물)
   * - CARAPACE_BEAST (발광 등갑 골판 외계 거수)
   * - CRESTED_STALKER (볏/뿔 장식 외계 사족수)
   * Preserves articulated node names (neck_group, head_mesh, tail_group, leg_fl/fr/bl/br, companion_heart).
   */
  public static createFaunaMesh(fauna: FaunaEntity): THREE.Group {
    const group = new THREE.Group();
    group.name = `fauna_${fauna.id}`;

    const x = fauna.lx * 0.15;
    const z = fauna.ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);
    group.rotation.y = fauna.facing || 0;

    // Hash ID to deterministically pick archetype
    let hash = 0;
    const idStr = String(fauna.id || '0');
    for (let i = 0; i < idStr.length; i++) {
      hash = (hash * 31 + idStr.charCodeAt(i)) | 0;
    }
    const archetypeIdx = Math.abs(hash) % 3; // 0: DIPLO, 1: CARAPACE_BEAST, 2: CRESTED_STALKER

    const baseColorHex = fauna.speciesRef?.color || '#a855f7';
    const baseCol = new THREE.Color(baseColorHex).multiplyScalar(0.8);
    const accentCol = baseCol.clone().offsetHSL(0.14, 0.1, 0.12);
    const bellyCol = baseCol.clone().offsetHSL(0.05, -0.2, -0.1);

    const mainMat = new THREE.MeshStandardMaterial({
      color: baseCol,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: true,
    });
    const secondaryMat = new THREE.MeshStandardMaterial({
      color: bellyCol,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
    const crestMat = new THREE.MeshStandardMaterial({
      color: accentCol,
      roughness: 0.65,
      metalness: 0.15,
      flatShading: true,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const bioSpotMat = new THREE.MeshBasicMaterial({ color: accentCol });

    const isLarge = (fauna.speciesRef?.weight || 50) > 120 || archetypeIdx === 0;
    const scaleFactor = archetypeIdx === 0 ? 1.55 : isLarge ? 1.35 : 0.98;

    // 1. Torso / Sculpted Organic Body
    const torsoGroup = new THREE.Group();
    const chestMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.78 * scaleFactor, 1),
      mainMat
    );
    chestMesh.scale.set(0.95, 0.85, 1.45);
    chestMesh.position.set(0, 1.35 * scaleFactor, 0.15 * scaleFactor);
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    torsoGroup.add(chestMesh);

    // Underbelly armor plates
    const bellyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.95 * scaleFactor, 0.35 * scaleFactor, 1.55 * scaleFactor),
      secondaryMat
    );
    bellyMesh.position.set(0, 0.92 * scaleFactor, 0.1 * scaleFactor);
    torsoGroup.add(bellyMesh);

    // Dorsal Back Plates / Carapace Ridges (Iconic NMS procedural back parts)
    const numPlates = archetypeIdx === 1 ? 5 : 4;
    for (let p = 0; p < numPlates; p++) {
      const t = p / (numPlates - 1);
      const plateZ = (0.75 - t * 1.4) * scaleFactor;
      const plateSize = (0.28 - Math.abs(t - 0.4) * 0.12) * scaleFactor;
      const plateGeo =
        archetypeIdx === 1
          ? new THREE.OctahedronGeometry(plateSize * 1.25, 0)
          : new THREE.ConeGeometry(plateSize * 0.7, plateSize * 2.1, 4);
      const plate = new THREE.Mesh(plateGeo, archetypeIdx === 1 ? bioSpotMat : crestMat);
      plate.position.set(0, 1.92 * scaleFactor, plateZ);
      plate.rotation.x = -0.25;
      torsoGroup.add(plate);
    }

    group.add(torsoGroup);

    // 2. Neck & Head (Tall Diplo Neck vs Stalker Neck)
    const neckGroup = new THREE.Group();
    neckGroup.name = 'neck_group';
    neckGroup.position.set(0, 1.55 * scaleFactor, 0.88 * scaleFactor);

    const neckLen = archetypeIdx === 0 ? 1.85 * scaleFactor : 0.75 * scaleFactor;
    const neckStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24 * scaleFactor, 0.38 * scaleFactor, neckLen, 7),
      mainMat
    );
    neckStem.position.set(0, neckLen * 0.42, 0.25 * scaleFactor);
    neckStem.rotation.x = archetypeIdx === 0 ? 0.28 : 0.48;
    neckStem.castShadow = true;
    neckGroup.add(neckStem);

    const headY = archetypeIdx === 0 ? neckLen * 0.85 : 0.48 * scaleFactor;
    const headZ = archetypeIdx === 0 ? 0.52 * scaleFactor : 0.55 * scaleFactor;

    const headMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.45 * scaleFactor, 1),
      mainMat
    );
    headMesh.scale.set(0.9, 0.78, 1.25);
    headMesh.position.set(0, headY, headZ);
    headMesh.name = 'head_mesh';
    headMesh.castShadow = true;
    neckGroup.add(headMesh);

    // Snout / Beak
    const snoutGeo = new THREE.ConeGeometry(0.28 * scaleFactor, 0.58 * scaleFactor, 5);
    snoutGeo.rotateX(Math.PI / 2);
    const snoutMesh = new THREE.Mesh(snoutGeo, secondaryMat);
    snoutMesh.position.set(0, headY - 0.04 * scaleFactor, headZ + 0.55 * scaleFactor);
    neckGroup.add(snoutMesh);

    // Eyes
    [-0.32, 0.32].forEach((eyeSide) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085 * scaleFactor, 8, 8), eyeMat);
      eye.position.set(eyeSide * scaleFactor, headY + 0.08 * scaleFactor, headZ + 0.22 * scaleFactor);
      neckGroup.add(eye);
    });

    // Iconic Head Crown / Diplo Frill / Rhino Horns
    if (archetypeIdx === 0) {
      // Diplo Cobra Hood / Crown Frill
      const frill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58 * scaleFactor, 0.25 * scaleFactor, 0.14 * scaleFactor, 6),
        crestMat
      );
      frill.position.set(0, headY + 0.22 * scaleFactor, headZ - 0.05 * scaleFactor);
      frill.rotation.x = -0.45;
      neckGroup.add(frill);
    } else {
      // Twin Swept Alien Horns
      const hornGeo = new THREE.ConeGeometry(0.11 * scaleFactor, 0.78 * scaleFactor, 5);
      [-0.24, 0.24].forEach((hornSide) => {
        const horn = new THREE.Mesh(hornGeo, crestMat);
        horn.position.set(hornSide * scaleFactor, headY + 0.42 * scaleFactor, headZ - 0.05 * scaleFactor);
        horn.rotation.x = -0.35;
        horn.rotation.z = hornSide * 0.28;
        neckGroup.add(horn);
      });
    }

    group.add(neckGroup);

    // 3. Sweeping Counterbalance Tail
    const tailGroup = new THREE.Group();
    tailGroup.name = 'tail_group';
    tailGroup.position.set(0, 1.38 * scaleFactor, -0.88 * scaleFactor);
    const tailLen = archetypeIdx === 0 ? 1.8 * scaleFactor : 1.25 * scaleFactor;
    const tailGeo = new THREE.ConeGeometry(0.28 * scaleFactor, tailLen, 6);
    tailGeo.rotateX(-Math.PI / 2.3);
    const tailMesh = new THREE.Mesh(tailGeo, secondaryMat);
    tailMesh.position.set(0, -0.1 * scaleFactor, -tailLen * 0.42);
    tailGroup.add(tailMesh);
    group.add(tailGroup);

    // 4. Four Articulated Multi-Jointed Legs
    const createLeg = (name: string, lx: number, lz: number) => {
      const legPivot = new THREE.Group();
      legPivot.name = name;
      legPivot.position.set(lx, 1.12 * scaleFactor, lz);

      const upperLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22 * scaleFactor, 0.16 * scaleFactor, 0.65 * scaleFactor, 6),
        mainMat
      );
      upperLeg.position.set(0, -0.3 * scaleFactor, 0);
      upperLeg.castShadow = true;
      legPivot.add(upperLeg);

      const lowerLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * scaleFactor, 0.18 * scaleFactor, 0.62 * scaleFactor, 6),
        secondaryMat
      );
      lowerLeg.position.set(0, -0.82 * scaleFactor, 0);
      lowerLeg.castShadow = true;
      legPivot.add(lowerLeg);

      return legPivot;
    };

    group.add(createLeg('leg_fl', -0.58 * scaleFactor, 0.62 * scaleFactor));
    group.add(createLeg('leg_fr', 0.58 * scaleFactor, 0.62 * scaleFactor));
    group.add(createLeg('leg_bl', -0.58 * scaleFactor, -0.62 * scaleFactor));
    group.add(createLeg('leg_br', 0.58 * scaleFactor, -0.62 * scaleFactor));

    // 5. Tamed Companion Indicator
    if (fauna.isTamed) {
      const heartMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });
      const heartGeo = new THREE.OctahedronGeometry(0.24, 0);
      const heartMesh = new THREE.Mesh(heartGeo, heartMat);
      heartMesh.name = 'companion_heart';
      heartMesh.position.set(0, (archetypeIdx === 0 ? 3.4 : 2.5) * scaleFactor, 0);
      group.add(heartMesh);
    }

    return group;
  }
}
