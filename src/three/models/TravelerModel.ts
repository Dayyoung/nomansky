import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class TravelerBuilder {
  private static gltfLoader = new GLTFLoader();

  /**
   * Generates the Masterpiece 3D Traveler Astronaut model.
   * Defaults to the Ultra-High-Fidelity No Man's Sky Exosuit (zero jitter, zero clipping, perfect PBR materials),
   * while also seamlessly supporting Kenney Space Kit GLB models with exact origin recentering.
   */
  public static createTraveler(modelKey: string = 'master_exosuit'): THREE.Group {
    const traveler = new THREE.Group();
    traveler.name = 'traveler_player';

    // 1. Initial Masterpiece Exosuit container (Immediate 60fps rendering, never blinks or clips)
    const masterGroup = this.createMasterExosuit();
    masterGroup.name = 'traveler_master';
    traveler.add(masterGroup);

    // 2. Attach jetpack thruster plasma flames (fixed anchor to traveler group)
    const glowBlueMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    [-0.26, 0.26].forEach((xPos) => {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 8), glowBlueMat);
      flame.name = `jet_flame_${xPos > 0 ? 'r' : 'l'}`;
      flame.position.set(xPos, 0.72, -0.42);
      flame.rotation.x = Math.PI;
      flame.visible = false;
      flame.frustumCulled = false;
      traveler.add(flame);
    });

    // 3. Multi-tool laser emitter anchor point
    const toolGroup = new THREE.Group();
    toolGroup.name = 'multitool';
    toolGroup.position.set(0.55, 1.35, 0.68);
    traveler.add(toolGroup);

    // 4. Apply requested model if GLB is selected
    if (modelKey && modelKey !== 'master_exosuit' && modelKey !== 'classic') {
      this.applyGlbModel(traveler, modelKey);
    }

    // Ensure entire traveler group has frustum culling disabled for 100% stable visibility
    traveler.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.frustumCulled = false;
      }
    });

    return traveler;
  }

  /**
   * Applies an external GLB model (Kenney Space Kit) with exact mathematical origin recentering
   */
  public static applyGlbModel(travelerGroup: THREE.Group, modelKey: string) {
    if (modelKey === 'master_exosuit' || modelKey === 'classic') {
      const existingGlb = travelerGroup.getObjectByName('traveler_glb_root');
      if (existingGlb) travelerGroup.remove(existingGlb);
      const master = travelerGroup.getObjectByName('traveler_master');
      if (master) master.visible = true;
      return;
    }

    const glbPath = `/assets/kenney/models/${modelKey}.glb`;

    this.gltfLoader.load(
      glbPath,
      (gltf) => {
        // Remove previous GLB mesh
        const existingGlb = travelerGroup.getObjectByName('traveler_glb_root');
        if (existingGlb) travelerGroup.remove(existingGlb);

        // Hide master model
        const master = travelerGroup.getObjectByName('traveler_master');
        if (master) master.visible = false;

        const glbRoot = new THREE.Group();
        glbRoot.name = 'traveler_glb_root';

        const characterModel = gltf.scene.clone();

        // Disable frustum culling on all child meshes to prevent blinking
        characterModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = false;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
              mat.roughness = 0.45;
              mat.metalness = 0.35;
              mesh.material = mat;
            }
          }
        });

        // Exact mathematical origin recentering:
        // Kenney models have arbitrary root node offsets (e.g. translation: [2, 0, 1.5]).
        // We recompute bounding box in world space, scale to height 2.0u, and shift to exact (0,0,0) pivot.
        characterModel.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(characterModel);
        const size = bbox.getSize(new THREE.Vector3());
        const targetHeight = 2.0;
        const scale = targetHeight / (size.y || 1);
        characterModel.scale.setScalar(scale);

        // Recompute bbox after scaling
        characterModel.updateMatrixWorld(true);
        const scaledBbox = new THREE.Box3().setFromObject(characterModel);
        const scaledCenter = scaledBbox.getCenter(new THREE.Vector3());

        // Shift position so that feet are at Y=0 and center is at X=0, Z=0
        characterModel.position.x -= scaledCenter.x;
        characterModel.position.y -= scaledBbox.min.y;
        characterModel.position.z -= scaledCenter.z;

        // Map Kenney limbs to standard names for walking animation
        const kenneyLegL = characterModel.getObjectByName('legLeft');
        const kenneyLegR = characterModel.getObjectByName('legRight');
        const kenneyArmL = characterModel.getObjectByName('armLeft');
        const kenneyArmR = characterModel.getObjectByName('armRight');

        if (kenneyLegL) kenneyLegL.name = 'glb_leg_l';
        if (kenneyLegR) kenneyLegR.name = 'glb_leg_r';
        if (kenneyArmL) kenneyArmL.name = 'glb_arm_l';
        if (kenneyArmR) kenneyArmR.name = 'glb_arm_r';

        glbRoot.add(characterModel);
        travelerGroup.add(glbRoot);
      },
      undefined,
      (err) => {
        console.warn(`[TravelerBuilder] Could not load ${glbPath}, keeping Masterpiece Exosuit:`, err);
        const master = travelerGroup.getObjectByName('traveler_master');
        if (master) master.visible = true;
      }
    );
  }

  /**
   * --- AUTHENTIC NO MAN'S SKY MASTERPIECE 3D EXOSUIT ---
   * Crafted with high-grade PBR physical materials, reflective amber visor,
   * neon life-support core, dual thruster jetpack, and multi-tool blaster.
   * Completely immune to camera clipping and frustum culling.
   */
  public static createMasterExosuit(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'traveler_master';

    // Premium PBR Materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Deep space slate exosuit weave
      roughness: 0.6,
      metalness: 0.2,
    });
    const armorWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Pristine ceramic composite armor plates
      roughness: 0.35,
      metalness: 0.4,
    });
    const armorCyanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant sci-fi cyan armor trim
      roughness: 0.3,
      metalness: 0.5,
    });
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b, // Iconic Golden Amber reflective visor
      metalness: 0.95,
      roughness: 0.08,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const metalDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark titanium mechanical chassis
      roughness: 0.4,
      metalness: 0.85,
    });
    const neonCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff, // Life support energy glow
    });

    // 1. Torso & Life Support Chest Rig
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'torso';

    // Core under-suit
    const torsoCore = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.85, 16), suitMat);
    torsoCore.position.y = 1.25;
    torsoCore.castShadow = true;
    torsoGroup.add(torsoCore);

    // Front Chest Armor Plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.48, 0.22), armorWhiteMat);
    chestPlate.position.set(0, 1.38, 0.22);
    chestPlate.castShadow = true;
    torsoGroup.add(chestPlate);

    // Cyan Chest Accent
    const chestAccent = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.08), armorCyanMat);
    chestAccent.position.set(0, 1.48, 0.32);
    torsoGroup.add(chestAccent);

    // Neon Life Support Atlas Indicator
    const lifeCore = new THREE.Mesh(new THREE.CircleGeometry(0.065, 16), neonCyanMat);
    lifeCore.position.set(0.18, 1.42, 0.35);
    torsoGroup.add(lifeCore);

    // Abdominal Segmented Armor
    const abPlate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.24, 0.16), metalDarkMat);
    abPlate.position.set(0, 1.05, 0.18);
    torsoGroup.add(abPlate);

    root.add(torsoGroup);

    // 2. Iconic Helmet & Amber Visor
    const headGroup = new THREE.Group();
    headGroup.name = 'head';

    // Helmet Dome
    const domeGeo = new THREE.SphereGeometry(0.34, 24, 24);
    domeGeo.scale(1.0, 1.08, 1.05);
    const helmetDome = new THREE.Mesh(domeGeo, armorWhiteMat);
    helmetDome.position.set(0, 1.95, 0.02);
    helmetDome.castShadow = true;
    headGroup.add(helmetDome);

    // Amber Reflective Visor
    const visorGeo = new THREE.SphereGeometry(0.28, 24, 24, 0, Math.PI, 0, Math.PI * 0.72);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 1.95, 0.14);
    visorMesh.rotation.y = -Math.PI / 2;
    headGroup.add(visorMesh);

    // Helmet Chin & Oxygen Rebreather Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.08, 12, 24), metalDarkMat);
    collar.position.set(0, 1.74, 0.04);
    collar.rotation.x = Math.PI / 2;
    headGroup.add(collar);

    // Side Antenna Fins
    [-0.34, 0.34].forEach((xPos) => {
      const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.08), armorCyanMat);
      antenna.position.set(xPos, 2.05, -0.04);
      headGroup.add(antenna);
    });

    root.add(headGroup);

    // 3. Dual-Thruster Jetpack Unit
    const jetpackGroup = new THREE.Group();
    jetpackGroup.name = 'jetpack';

    const packMain = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.76, 0.32), armorWhiteMat);
    packMain.position.set(0, 1.38, -0.36);
    packMain.castShadow = true;
    jetpackGroup.add(packMain);

    const packCoreAccent = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.12), armorCyanMat);
    packCoreAccent.position.set(0, 1.5, -0.5);
    jetpackGroup.add(packCoreAccent);

    // Twin Exhaust Nozzles
    [-0.26, 0.26].forEach((xPos) => {
      const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.36, 16), metalDarkMat);
      thruster.position.set(xPos, 1.02, -0.42);
      thruster.castShadow = true;
      jetpackGroup.add(thruster);
    });

    root.add(jetpackGroup);

    // 4. Fully Articulated Legs (Hip Pivots for realistic walking strides)
    [-0.22, 0.22].forEach((xPos, idx) => {
      const legPivot = new THREE.Group();
      legPivot.name = idx === 0 ? 'leg_l' : 'leg_r';
      legPivot.position.set(xPos, 0.88, 0);

      // Thigh
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.48, 0.28), suitMat);
      thigh.position.set(0, -0.22, 0);
      thigh.castShadow = true;
      legPivot.add(thigh);

      // Knee Guard
      const knee = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.14), armorCyanMat);
      knee.position.set(0, -0.38, 0.14);
      legPivot.add(knee);

      // Shin
      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.44, 0.26), armorWhiteMat);
      shin.position.set(0, -0.56, 0);
      shin.castShadow = true;
      legPivot.add(shin);

      // Magnetic Boots
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.42), metalDarkMat);
      boot.position.set(0, -0.78, 0.08);
      boot.castShadow = true;
      legPivot.add(boot);

      root.add(legPivot);
    });

    // 5. Fully Articulated Arms & Multi-Tool Blaster
    // Left Arm (Swings naturally opposite to leg)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.name = 'arm_l';
    leftArmPivot.position.set(-0.54, 1.52, 0);

    const leftPauldron = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), armorCyanMat);
    leftPauldron.position.set(0, 0, 0);
    leftArmPivot.add(leftPauldron);

    const leftBicep = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.42, 0.22), suitMat);
    leftBicep.position.set(0, -0.24, 0);
    leftBicep.castShadow = true;
    leftArmPivot.add(leftBicep);

    const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.24), armorWhiteMat);
    leftForearm.position.set(0, -0.54, 0.04);
    leftForearm.castShadow = true;
    leftArmPivot.add(leftForearm);

    root.add(leftArmPivot);

    // Right Arm (Holding Atlantid Multi-Tool Weapon)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.name = 'arm_r';
    rightArmPivot.position.set(0.54, 1.52, 0);
    rightArmPivot.rotation.x = -Math.PI / 4.5;

    const rightPauldron = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), armorCyanMat);
    rightPauldron.position.set(0, 0, 0);
    rightArmPivot.add(rightPauldron);

    const rightBicep = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.42, 0.22), suitMat);
    rightBicep.position.set(0, -0.24, 0);
    rightArmPivot.add(rightBicep);

    const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 0.24), armorWhiteMat);
    rightForearm.position.set(0, -0.54, 0.04);
    rightArmPivot.add(rightForearm);

    // Atlantid Multi-Tool Weapon
    const multiToolMesh = new THREE.Group();
    multiToolMesh.position.set(0, -0.68, 0.35);

    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.62), metalDarkMat);
    gunBody.castShadow = true;
    multiToolMesh.add(gunBody);

    const gunChassis = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.42), armorCyanMat);
    gunChassis.position.set(0, 0.08, -0.06);
    multiToolMesh.add(gunChassis);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.32, 12), metalDarkMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.42);
    multiToolMesh.add(barrel);

    const muzzleGlow = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.065, 12), neonCyanMat);
    muzzleGlow.position.set(0, 0.02, 0.59);
    multiToolMesh.add(muzzleGlow);

    rightArmPivot.add(multiToolMesh);
    root.add(rightArmPivot);

    // Disable frustum culling on all parts so it NEVER clips or vanishes
    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.frustumCulled = false;
      }
    });

    return root;
  }
}
