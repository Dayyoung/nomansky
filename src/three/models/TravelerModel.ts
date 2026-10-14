import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class TravelerBuilder {
  private static gltfLoader = new GLTFLoader();
  private static cachedGlbMap: Map<string, THREE.Group> = new Map();

  /**
   * Generates a 3D Traveler astronaut model.
   * Loads high-fidelity Kenney Space Kit GLB (astronautA, astronautB, alien)
   * while falling back seamlessly to procedural mesh during loading.
   */
  public static createTraveler(modelKey: string = 'astronautA'): THREE.Group {
    const traveler = new THREE.Group();
    traveler.name = 'traveler_player';

    // 1. Initial procedural fallback container
    const proceduralGroup = this.createProceduralTraveler();
    proceduralGroup.name = 'traveler_procedural';
    traveler.add(proceduralGroup);

    // 2. Attach jetpack flames (always present so particle/engine refs never break)
    const glowBlueMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    [-0.22, 0.22].forEach((xPos) => {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 8), glowBlueMat);
      flame.name = `jet_flame_${xPos > 0 ? 'r' : 'l'}`;
      flame.position.set(xPos, 0.7, -0.42);
      flame.rotation.x = Math.PI;
      flame.visible = false;
      traveler.add(flame);
    });

    // 3. Multi-tool emitter reference point
    const toolGroup = new THREE.Group();
    toolGroup.name = 'multitool';
    toolGroup.position.set(0.55, 1.3, 0.65);
    traveler.add(toolGroup);

    // 4. Load Kenney 3D GLB Model
    this.applyGlbModel(traveler, modelKey);

    return traveler;
  }

  /**
   * Loads and applies a Kenney Space Kit GLB model to the traveler group
   */
  public static applyGlbModel(travelerGroup: THREE.Group, modelKey: string) {
    if (modelKey === 'classic') {
      // Revert to procedural
      const existingGlb = travelerGroup.getObjectByName('traveler_glb_root');
      if (existingGlb) travelerGroup.remove(existingGlb);
      const proc = travelerGroup.getObjectByName('traveler_procedural');
      if (proc) proc.visible = true;
      return;
    }

    const glbPath = `/assets/kenney/models/${modelKey}.glb`;

    this.gltfLoader.load(
      glbPath,
      (gltf) => {
        // Remove existing GLB mesh if any
        const existingGlb = travelerGroup.getObjectByName('traveler_glb_root');
        if (existingGlb) {
          travelerGroup.remove(existingGlb);
        }

        // Hide procedural fallback
        const proc = travelerGroup.getObjectByName('traveler_procedural');
        if (proc) proc.visible = false;

        const glbRoot = new THREE.Group();
        glbRoot.name = 'traveler_glb_root';

        const characterModel = gltf.scene.clone();

        // Enable shadows and enhance materials
        characterModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.max(0.3, mat.roughness ?? 0.5);
              mat.metalness = Math.min(0.6, mat.metalness ?? 0.2);
            }
          }
        });

        // Compute Bounding Box and normalize height to 2.2 units
        const bbox = new THREE.Box3().setFromObject(characterModel);
        const size = bbox.getSize(new THREE.Vector3());
        const targetHeight = 2.2;
        const scale = targetHeight / (size.y || 1);
        characterModel.scale.setScalar(scale);

        // Ground bottom to Y=0 and center X/Z
        bbox.setFromObject(characterModel);
        characterModel.position.y = -bbox.min.y;
        characterModel.position.x = -(bbox.min.x + bbox.max.x) / 2;
        characterModel.position.z = -(bbox.min.z + bbox.max.z) / 2;

        // Kenney models usually face +Z or -Z, orient forward facing +Z
        characterModel.rotation.y = Math.PI;

        glbRoot.add(characterModel);
        travelerGroup.add(glbRoot);
      },
      undefined,
      (err) => {
        console.warn(`[TravelerBuilder] Could not load ${glbPath}, using procedural fallback:`, err);
        const proc = travelerGroup.getObjectByName('traveler_procedural');
        if (proc) proc.visible = true;
      }
    );
  }

  /**
   * Generates a 3D procedural Traveler astronaut model with exo-suit
   */
  public static createProceduralTraveler(): THREE.Group {
    const procedural = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.5,
      metalness: 0.3,
    });
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x3182ce,
      roughness: 0.4,
      metalness: 0.5,
    });
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0xffb703,
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 1.0,
      clearcoat: 1.0,
    });
    const jetpackMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      metalness: 0.8,
      roughness: 0.3,
    });
    const glowBlueMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.85, 1.1, 0.55);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    procedural.add(torso);

    // Chest Plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.15), armorMat);
    chestPlate.position.set(0, 1.45, 0.28);
    procedural.add(chestPlate);

    // Life support indicator light
    const lifeLight = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), glowBlueMat);
    lifeLight.position.set(0.18, 1.5, 0.37);
    procedural.add(lifeLight);

    // 2. Helmet
    const helmetGeo = new THREE.SphereGeometry(0.38, 16, 16);
    helmetGeo.scale(1.0, 1.1, 1.0);
    const helmet = new THREE.Mesh(helmetGeo, suitMat);
    helmet.position.y = 2.15;
    helmet.castShadow = true;
    procedural.add(helmet);

    // Visor
    const visorGeo = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI, 0, Math.PI * 0.7);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.15, 0.14);
    visor.rotation.y = -Math.PI / 2;
    procedural.add(visor);

    // 3. Jetpack (Backpack unit)
    const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.35), jetpackMat);
    packBody.position.set(0, 1.45, -0.42);
    packBody.castShadow = true;
    procedural.add(packBody);

    // Twin Jetpack Thruster Nozzles
    [-0.22, 0.22].forEach((xPos) => {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 12), jetpackMat);
      nozzle.position.set(xPos, 1.05, -0.42);
      procedural.add(nozzle);
    });

    // 4. Legs
    [-0.22, 0.22].forEach((xPos, idx) => {
      const legGroup = new THREE.Group();
      legGroup.name = idx === 0 ? 'leg_l' : 'leg_r';
      legGroup.position.set(xPos, 0.85, 0);

      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 0.3), suitMat);
      leg.position.set(0, -0.4, 0);
      leg.castShadow = true;
      legGroup.add(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.42), armorMat);
      boot.position.set(0, -0.74, 0.05);
      boot.castShadow = true;
      legGroup.add(boot);

      procedural.add(legGroup);
    });

    // 5. Arms
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.25), suitMat);
    leftArm.position.set(-0.55, 1.3, 0);
    procedural.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.7, 0.25), suitMat);
    rightArm.position.set(0.55, 1.35, 0.2);
    rightArm.rotation.x = -Math.PI / 4;
    procedural.add(rightArm);

    return procedural;
  }
}
