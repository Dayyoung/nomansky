import * as THREE from 'three';

export interface AsteroidItem {
  mesh: THREE.Mesh;
  hp: number;
  maxHp: number;
  rotSpeed: { x: number; y: number; z: number };
  resourceType: 'tritium' | 'silver' | 'gold';
}

export class AsteroidFieldBuilder {
  /**
   * Generates a field of 3D procedural Asteroids with irregular rock geometries
   */
  public static createAsteroidField(count: number = 80, radius: number = 1200): {
    group: THREE.Group;
    asteroids: AsteroidItem[];
  } {
    const group = new THREE.Group();
    group.name = 'asteroid_field';
    const asteroids: AsteroidItem[] = [];

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x606f7b,
      roughness: 0.9,
      metalness: 0.2,
      flatShading: true,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.4,
      metalness: 0.8,
      flatShading: true,
    });
    const tritiumMat = new THREE.MeshStandardMaterial({
      color: 0x4fd1c5,
      emissive: 0x319795,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.5,
      flatShading: true,
    });

    for (let i = 0; i < count; i++) {
      // Procedural deformed icosahedron for rocky asteroid shape
      const baseSize = 6 + Math.random() * 22;
      const geo = new THREE.DodecahedronGeometry(baseSize, 1);

      // Jitter vertices for rocky natural roughness
      const pos = geo.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const vx = pos.getX(j);
        const vy = pos.getY(j);
        const vz = pos.getZ(j);
        const noise = 1 + (Math.random() - 0.5) * 0.35;
        pos.setXYZ(j, vx * noise, vy * noise, vz * noise);
      }
      geo.computeVertexNormals();

      // Pick mineral type
      const rand = Math.random();
      let mat = rockMat;
      let resourceType: 'tritium' | 'silver' | 'gold' = 'silver';
      if (rand < 0.6) {
        mat = tritiumMat;
        resourceType = 'tritium';
      } else if (rand > 0.85) {
        mat = goldMat;
        resourceType = 'gold';
      }

      const mesh = new THREE.Mesh(geo, mat);

      // Distribute in a spherical/toroidal orbital belt
      const dist = 350 + Math.random() * (radius - 350);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.7; // Belt thickness

      mesh.position.set(
        Math.cos(theta) * Math.cos(phi) * dist,
        Math.sin(phi) * dist,
        Math.sin(theta) * Math.cos(phi) * dist
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      asteroids.push({
        mesh,
        hp: Math.round(baseSize * 4),
        maxHp: Math.round(baseSize * 4),
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.015,
        },
        resourceType,
      });
    }

    return { group, asteroids };
  }
}
