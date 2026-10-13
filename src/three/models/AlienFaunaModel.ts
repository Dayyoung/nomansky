import * as THREE from 'three';
import { FaunaEntity } from '../../types';
import { getTerrainHeight } from './TerrainModel';

export class AlienFaunaModel {
  /**
   * Generates a 3D procedural No Man's Sky Alien Creature (외계 동물)
   * with articulated limbs, head, horns/frills, and procedural color markings.
   */
  public static createFaunaMesh(fauna: FaunaEntity): THREE.Group {
    const group = new THREE.Group();
    group.name = `fauna_${fauna.id}`;

    const x = fauna.lx * 0.15;
    const z = fauna.ly * 0.15;
    const groundY = getTerrainHeight(x, z);
    group.position.set(x, groundY, z);
    group.rotation.y = fauna.facing || 0;

    // Procedural color derived from species color or fallback
    const baseColorHex = fauna.speciesRef?.color || '#a855f7';
    const mainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColorHex),
      roughness: 0.7,
      metalness: 0.15,
      flatShading: true,
    });
    const secondaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(baseColorHex).offsetHSL(0.08, -0.2, 0.15),
      roughness: 0.6,
      metalness: 0.2,
      flatShading: true,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff }); // Glowing alien cyan eyes
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xfde047, // Golden alien crest / horn
      roughness: 0.4,
      metalness: 0.3,
    });

    const isLarge = (fauna.speciesRef?.weight || 50) > 120;
    const scaleFactor = isLarge ? 1.4 : 0.95;

    // 1. Torso / Body (Organic quad faceted geometry)
    const bodyGeo = new THREE.BoxGeometry(1.2 * scaleFactor, 1.0 * scaleFactor, 1.8 * scaleFactor);
    const bodyMesh = new THREE.Mesh(bodyGeo, mainMat);
    bodyMesh.position.y = 1.3 * scaleFactor;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // Belly / Underbelly plates
    const bellyGeo = new THREE.BoxGeometry(1.0 * scaleFactor, 0.4 * scaleFactor, 1.5 * scaleFactor);
    const bellyMesh = new THREE.Mesh(bellyGeo, secondaryMat);
    bellyMesh.position.set(0, 0.95 * scaleFactor, 0);
    group.add(bellyMesh);

    // 2. Neck & Head
    const neckGroup = new THREE.Group();
    neckGroup.name = 'neck_group';
    neckGroup.position.set(0, 1.6 * scaleFactor, 0.9 * scaleFactor);

    const headGeo = new THREE.BoxGeometry(0.8 * scaleFactor, 0.7 * scaleFactor, 1.0 * scaleFactor);
    const headMesh = new THREE.Mesh(headGeo, mainMat);
    headMesh.position.set(0, 0.4 * scaleFactor, 0.5 * scaleFactor);
    headMesh.name = 'head_mesh';
    headMesh.castShadow = true;
    neckGroup.add(headMesh);

    // Alien Snout / Beak
    const snoutGeo = new THREE.ConeGeometry(0.35 * scaleFactor, 0.6 * scaleFactor, 5);
    snoutGeo.rotateX(Math.PI / 2);
    const snoutMesh = new THREE.Mesh(snoutGeo, secondaryMat);
    snoutMesh.position.set(0, 0.35 * scaleFactor, 1.15 * scaleFactor);
    neckGroup.add(snoutMesh);

    // Glowing Eyes
    [-0.38, 0.38].forEach((eyeSide) => {
      const eyeGeo = new THREE.SphereGeometry(0.1 * scaleFactor, 8, 8);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(eyeSide * scaleFactor, 0.5 * scaleFactor, 0.8 * scaleFactor);
      neckGroup.add(eye);
    });

    // Alien Crest / Horns
    const hornGeo = new THREE.ConeGeometry(0.12 * scaleFactor, 0.8 * scaleFactor, 4);
    [-0.25, 0.25].forEach((hornSide) => {
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(hornSide * scaleFactor, 0.95 * scaleFactor, 0.4 * scaleFactor);
      horn.rotation.x = -0.3;
      horn.rotation.z = hornSide * 0.2;
      neckGroup.add(horn);
    });

    group.add(neckGroup);

    // 3. Tail
    const tailGroup = new THREE.Group();
    tailGroup.name = 'tail_group';
    tailGroup.position.set(0, 1.4 * scaleFactor, -0.9 * scaleFactor);
    const tailGeo = new THREE.CylinderGeometry(0.12 * scaleFactor, 0.25 * scaleFactor, 1.2 * scaleFactor, 5);
    tailGeo.rotateX(-Math.PI / 3);
    const tailMesh = new THREE.Mesh(tailGeo, secondaryMat);
    tailMesh.position.set(0, 0, -0.5 * scaleFactor);
    tailGroup.add(tailMesh);
    group.add(tailGroup);

    // 4. Four Articulated Legs
    const legGeo = new THREE.BoxGeometry(0.3 * scaleFactor, 1.1 * scaleFactor, 0.35 * scaleFactor);
    legGeo.translate(0, -0.55 * scaleFactor, 0); // Pivot from top shoulder/hip

    // Front Left Leg
    const legFL = new THREE.Mesh(legGeo, mainMat);
    legFL.name = 'leg_fl';
    legFL.position.set(-0.6 * scaleFactor, 1.1 * scaleFactor, 0.65 * scaleFactor);
    legFL.castShadow = true;
    group.add(legFL);

    // Front Right Leg
    const legFR = new THREE.Mesh(legGeo, mainMat);
    legFR.name = 'leg_fr';
    legFR.position.set(0.6 * scaleFactor, 1.1 * scaleFactor, 0.65 * scaleFactor);
    legFR.castShadow = true;
    group.add(legFR);

    // Back Left Leg
    const legBL = new THREE.Mesh(legGeo, mainMat);
    legBL.name = 'leg_bl';
    legBL.position.set(-0.6 * scaleFactor, 1.1 * scaleFactor, -0.65 * scaleFactor);
    legBL.castShadow = true;
    group.add(legBL);

    // Back Right Leg
    const legBR = new THREE.Mesh(legGeo, mainMat);
    legBR.name = 'leg_br';
    legBR.position.set(0.6 * scaleFactor, 1.1 * scaleFactor, -0.65 * scaleFactor);
    legBR.castShadow = true;
    group.add(legBR);

    // 5. Tamed Companion Heart / Saddle Indicator
    if (fauna.isTamed) {
      const heartMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });
      const heartGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const heartMesh = new THREE.Mesh(heartGeo, heartMat);
      heartMesh.name = 'companion_heart';
      heartMesh.position.set(0, 2.5 * scaleFactor, 0);
      group.add(heartMesh);
    }

    return group;
  }

  /**
   * Procedural stride walking & idling animation updates
   */
  public static updateAnimation(group: THREE.Group, fauna: FaunaEntity, delta: number, totalTime: number) {
    const isMoving = fauna.state === 'WANDER' || fauna.state === 'FLEE' || fauna.state === 'FOLLOW';
    const animSpeed = fauna.state === 'FLEE' ? 12.0 : 6.0;

    if (isMoving) {
      fauna.walkCycle = (fauna.walkCycle || 0) + delta * animSpeed;
    } else {
      fauna.walkCycle = 0;
    }

    const swing = Math.sin(fauna.walkCycle || 0) * 0.55;

    const legFL = group.getObjectByName('leg_fl');
    const legFR = group.getObjectByName('leg_fr');
    const legBL = group.getObjectByName('leg_bl');
    const legBR = group.getObjectByName('leg_br');

    if (legFL && legFR && legBL && legBR) {
      if (isMoving) {
        legFL.rotation.x = swing;
        legFR.rotation.x = -swing;
        legBL.rotation.x = -swing;
        legBR.rotation.x = swing;
      } else {
        legFL.rotation.x = 0;
        legFR.rotation.x = 0;
        legBL.rotation.x = 0;
        legBR.rotation.x = 0;
      }
    }

    // Head bobbing & looking
    const neckGroup = group.getObjectByName('neck_group');
    if (neckGroup) {
      neckGroup.rotation.y = Math.sin(totalTime * 1.5 + Number(fauna.id.slice(-2) || 0)) * 0.15;
      neckGroup.rotation.x = Math.sin(totalTime * 2.0) * 0.08;
    }

    // Tail wagging
    const tailGroup = group.getObjectByName('tail_group');
    if (tailGroup) {
      tailGroup.rotation.y = Math.sin(totalTime * 3.0) * 0.35;
    }

    // Floating heart bobbing if tamed
    const heart = group.getObjectByName('companion_heart');
    if (heart) {
      heart.position.y = 2.5 + Math.sin(totalTime * 4.0) * 0.2;
      heart.rotation.y += delta * 2.0;
    }
  }
}
