import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class TravelerBuilder {
  private static gltfLoader = new GLTFLoader();
  private static hexBumpTexture: THREE.CanvasTexture | null = null;
  private static carbonBumpTexture: THREE.CanvasTexture | null = null;

  /**
   * Generates a high-tech procedural hex weave bump map for exosuit armor plates
   */
  private static getHexBumpTexture(): THREE.CanvasTexture {
    if (!this.hexBumpTexture) {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#a8a8a8';
        ctx.lineWidth = 1.5;
        const s = 16;
        for (let y = 0; y < 128; y += s) {
          for (let x = 0; x < 128; x += s) {
            ctx.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3);
          }
        }
      }
      this.hexBumpTexture = new THREE.CanvasTexture(canvas);
      this.hexBumpTexture.wrapS = THREE.RepeatWrapping;
      this.hexBumpTexture.wrapT = THREE.RepeatWrapping;
      this.hexBumpTexture.repeat.set(5, 5);
    }
    return this.hexBumpTexture;
  }

  /**
   * Generates fine carbon fiber weave bump map for technical exosuit fabrics
   */
  private static getCarbonBumpTexture(): THREE.CanvasTexture {
    if (!this.carbonBumpTexture) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#777777';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#999999';
        for (let y = 0; y < 64; y += 4) {
          for (let x = 0; x < 64; x += 4) {
            if ((x + y) % 8 === 0) {
              ctx.fillRect(x, y, 4, 4);
            }
          }
        }
      }
      this.carbonBumpTexture = new THREE.CanvasTexture(canvas);
      this.carbonBumpTexture.wrapS = THREE.RepeatWrapping;
      this.carbonBumpTexture.wrapT = THREE.RepeatWrapping;
      this.carbonBumpTexture.repeat.set(8, 8);
    }
    return this.carbonBumpTexture;
  }

  /**
   * Generates the Masterpiece 3D Traveler Astronaut model.
   * Recreates the authentic No Man's Sky Anomaly Traveler Exosuit with museum-grade precision:
   * Full-face amber bubble visor, Atlas life-support diamond core, dual swiveling thruster jetpack,
   * tactical multi-tool blaster, wrist HUD terminal, and articulated magnetic planetary boots.
   */
  public static createTraveler(modelKey: string = 'master_exosuit'): THREE.Group {
    const traveler = new THREE.Group();
    traveler.name = 'traveler_player';

    // 1. Masterpiece Exosuit Container (Immediate, stable 60fps rendering)
    const masterGroup = this.createMasterExosuit();
    masterGroup.name = 'traveler_master';
    traveler.add(masterGroup);

    // 2. High-energy dual plasma thruster flames
    const flameCoreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const flameOuterMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    [-0.30, 0.30].forEach((xPos) => {
      const flameGroup = new THREE.Group();
      flameGroup.name = `jet_flame_${xPos > 0 ? 'r' : 'l'}`;
      flameGroup.position.set(xPos, 0.76, -0.44);
      flameGroup.visible = false;

      // Inner concentrated blue core
      const innerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.55, 8), flameCoreMat);
      innerFlame.rotation.x = Math.PI;
      innerFlame.position.y = -0.25;
      innerFlame.frustumCulled = false;
      flameGroup.add(innerFlame);

      // Outer luminous sheath
      const outerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.80, 8), flameOuterMat);
      outerFlame.rotation.x = Math.PI;
      outerFlame.position.y = -0.38;
      outerFlame.frustumCulled = false;
      flameGroup.add(outerFlame);

      traveler.add(flameGroup);
    });

    // 3. Multi-tool laser emitter anchor point (exactly at rifle barrel tip)
    const toolAnchor = new THREE.Group();
    toolAnchor.name = 'multitool';
    toolAnchor.position.set(0.52, 1.34, 0.78);
    traveler.add(toolAnchor);

    // 4. Load Kenney model if specifically requested via Appearance Modifier
    if (modelKey && modelKey !== 'master_exosuit' && modelKey !== 'classic') {
      this.applyGlbModel(traveler, modelKey);
    }

    // Mathematical immunity to frustum culling
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
        const existingGlb = travelerGroup.getObjectByName('traveler_glb_root');
        if (existingGlb) travelerGroup.remove(existingGlb);

        const master = travelerGroup.getObjectByName('traveler_master');
        if (master) master.visible = false;

        const glbRoot = new THREE.Group();
        glbRoot.name = 'traveler_glb_root';

        const characterModel = gltf.scene.clone();

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

        // Exact origin recentering: cancel Kenney root translation offset [2, 0, 1.5]
        characterModel.updateMatrixWorld(true);
        const bbox = new THREE.Box3().setFromObject(characterModel);
        const size = bbox.getSize(new THREE.Vector3());
        const targetHeight = 2.0;
        const scale = targetHeight / (size.y || 1);
        characterModel.scale.setScalar(scale);

        characterModel.updateMatrixWorld(true);
        const scaledBbox = new THREE.Box3().setFromObject(characterModel);
        const scaledCenter = scaledBbox.getCenter(new THREE.Vector3());

        characterModel.position.x -= scaledCenter.x;
        characterModel.position.y -= scaledBbox.min.y;
        characterModel.position.z -= scaledCenter.z;

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
   * --- 100% AUTHENTIC NO MAN'S SKY MASTERPIECE EXOSUIT ---
   * Fully handcrafted 3D character incorporating all signature No Man's Sky visual elements:
   * - Golden Amber Physical Glass Visor with clearcoat reflective coating
   * - Atlas Diamond Pulse Core in the center chest
   * - Twin Ribbed Life-Support Breathing Hoses
   * - Tactical Dual Swiveling Thruster Jetpack with Turbine Vents
   * - Atlantid Multi-Tool Weapon with Holographic Sight & Crystal Muzzle
   * - Wrist-mounted Exosuit Hologram Terminal (Cyan illuminated)
   * - Heavy Articulated Magnetic Planetary Boots
   */
  public static createMasterExosuit(): THREE.Group {
    const root = new THREE.Group();
    root.name = 'traveler_master';

    const hexBump = this.getHexBumpTexture();
    const carbonBump = this.getCarbonBumpTexture();

    // =========================================================================
    // --- 1. PREMIUM PBR PHYSICAL MATERIALS (Real-time IBL reflection) ---
    // =========================================================================

    // Undersuit weave: high-density ribbed synthetic weave
    const underSuitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Deep dark slate
      roughness: 0.72,
      metalness: 0.15,
      bumpMap: carbonBump,
      bumpScale: 1.2,
    });

    // Primary ceramic armor: pristine orbital white composite
    const armorWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.32,
      metalness: 0.35,
      bumpMap: hexBump,
      bumpScale: 0.8,
    });

    // Secondary sci-fi armor: vibrant No Man's Sky teal/cyan trim
    const armorTealMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Radiant sky/teal cyan
      roughness: 0.28,
      metalness: 0.55,
      bumpMap: hexBump,
      bumpScale: 0.6,
    });

    // Mechanical chassis: dark brushed titanium
    const darkTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.38,
      metalness: 0.88,
    });

    // Rubber gaskets, joint seals & breathing hoses
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.05,
    });

    // Iconic No Man's Sky Golden Amber Visor (Reflective PBR Physical Material)
    const visorPhysicalMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b, // Radiant amber gold
      metalness: 0.96,
      roughness: 0.06,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      ior: 1.55,
    });

    // Atlas Neon Core & Headlamp LEDs
    const neonAtlasMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const neonHeadlampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const neonAmberMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    // =========================================================================
    // --- 2. PELVIS & LOWER TORSO ---
    // =========================================================================
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'pelvis';
    pelvisGroup.position.set(0, 0.95, 0);

    // Pelvis core block
    const pelvisCore = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.24, 16), underSuitMat);
    pelvisCore.castShadow = true;
    pelvisGroup.add(pelvisCore);

    // Groin protector plate
    const groinPlate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.12), armorWhiteMat);
    groinPlate.position.set(0, -0.04, 0.18);
    groinPlate.castShadow = true;
    pelvisGroup.add(groinPlate);

    // Heavy tactical belt
    const beltTorus = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 8, 24), darkTitaniumMat);
    beltTorus.rotation.x = Math.PI / 2;
    beltTorus.position.y = 0.08;
    pelvisGroup.add(beltTorus);

    // Tactical utility survival pouches (4 units around waist)
    [-0.30, 0.30].forEach((xPos) => {
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.16), darkTitaniumMat);
      pouch.position.set(xPos, 0.06, 0.05);
      pelvisGroup.add(pouch);
    });
    [-0.14, 0.14].forEach((xPos) => {
      const rearPouch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.10), darkTitaniumMat);
      rearPouch.position.set(xPos, 0.06, -0.28);
      pelvisGroup.add(rearPouch);
    });

    root.add(pelvisGroup);

    // =========================================================================
    // --- 3. UPPER TORSO & ATLAS LIFE-SUPPORT CHEST RIG ---
    // =========================================================================
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'torso';

    // Segmented Abdominal Armor (3 flexible articulative segments)
    [1.08, 1.18, 1.28].forEach((yPos, i) => {
      const abSeg = new THREE.Mesh(new THREE.BoxGeometry(0.48 - i * 0.02, 0.08, 0.32), darkTitaniumMat);
      abSeg.position.set(0, yPos, 0.06);
      abSeg.castShadow = true;
      torsoGroup.add(abSeg);
    });

    // Upper Ribcage Under-suit
    const ribcage = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.34, 0.45, 16), underSuitMat);
    ribcage.position.set(0, 1.48, 0);
    ribcage.castShadow = true;
    torsoGroup.add(ribcage);

    // Front Ceramic Chest Plate (Aerodynamic beveled armor)
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.38, 0.26), armorWhiteMat);
    chestPlate.position.set(0, 1.54, 0.18);
    chestPlate.castShadow = true;
    torsoGroup.add(chestPlate);

    // Chest Teal Accents & Framing
    const chestBorder = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.08), armorTealMat);
    chestBorder.position.set(0, 1.62, 0.30);
    torsoGroup.add(chestBorder);

    // Atlas Life Support Diamond Core (Iconic No Man's Sky centerpiece)
    const atlasDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), neonAtlasMat);
    atlasDiamond.position.set(0, 1.54, 0.34);
    atlasDiamond.scale.set(0.8, 1.2, 0.5);
    torsoGroup.add(atlasDiamond);

    // Status Indicator Bar
    const statusBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.02), neonAmberMat);
    statusBar.position.set(0, 1.44, 0.32);
    torsoGroup.add(statusBar);

    // Collar Armor Ring protecting throat
    const throatCollar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 12, 24), darkTitaniumMat);
    throatCollar.position.set(0, 1.76, 0.04);
    throatCollar.rotation.x = Math.PI / 2;
    torsoGroup.add(throatCollar);

    // Twin Ribbed Life-Support Breathing Hoses (from collar to lower chest rig)
    [-0.18, 0.18].forEach((xPos) => {
      const hoseCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(xPos * 0.9, 1.80, 0.20),
        new THREE.Vector3(xPos * 1.3, 1.66, 0.28),
        new THREE.Vector3(xPos * 0.8, 1.48, 0.30),
      ]);
      const hoseGeo = new THREE.TubeGeometry(hoseCurve, 12, 0.028, 8, false);
      const hoseMesh = new THREE.Mesh(hoseGeo, rubberMat);
      torsoGroup.add(hoseMesh);
    });

    root.add(torsoGroup);

    // =========================================================================
    // --- 4. ICONIC HELMET & AMBER BUBBLE VISOR ---
    // =========================================================================
    const headGroup = new THREE.Group();
    headGroup.name = 'head';

    // Aerodynamic Helmet Outer Shell (Beveled spheroid)
    const helmetGeo = new THREE.SphereGeometry(0.36, 32, 24);
    helmetGeo.scale(1.0, 1.10, 1.08);
    const helmetDome = new THREE.Mesh(helmetGeo, armorWhiteMat);
    helmetDome.position.set(0, 2.02, 0.02);
    helmetDome.castShadow = true;
    headGroup.add(helmetDome);

    // Helmet Teal Crown Strip
    const helmetCrown = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.62), armorTealMat);
    helmetCrown.position.set(0, 2.14, 0.04);
    headGroup.add(helmetCrown);

    // Full-Face Amber Bubble Visor (Iconic curvature with PBR reflections)
    const visorGeo = new THREE.SphereGeometry(0.30, 32, 24, 0, Math.PI, 0, Math.PI * 0.74);
    const visorMesh = new THREE.Mesh(visorGeo, visorPhysicalMat);
    visorMesh.position.set(0, 2.02, 0.15);
    visorMesh.rotation.y = -Math.PI / 2;
    headGroup.add(visorMesh);

    // Visor Rubber Gasket Frame Seal
    const gasket = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.022, 10, 32), rubberMat);
    gasket.position.set(0, 2.02, 0.16);
    headGroup.add(gasket);

    // Forehead Exploration LED Headlamps (Twin High-Output Mini Lenses)
    [-0.10, 0.10].forEach((xPos) => {
      const lampBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.04, 12), darkTitaniumMat);
      lampBezel.position.set(xPos, 2.22, 0.26);
      lampBezel.rotation.x = Math.PI / 2.8;
      headGroup.add(lampBezel);

      const lampLens = new THREE.Mesh(new THREE.CircleGeometry(0.022, 12), neonHeadlampMat);
      lampLens.position.set(xPos, 2.23, 0.28);
      headGroup.add(lampLens);
    });

    // Side Oxygen Filter Puck Canisters & Comms Earpieces
    [-0.35, 0.35].forEach((xPos) => {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.08, 16), darkTitaniumMat);
      can.position.set(xPos, 2.02, 0);
      can.rotation.z = Math.PI / 2;
      headGroup.add(can);

      const canRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 16), armorTealMat);
      canRing.position.set(xPos * 1.1, 2.02, 0);
      canRing.rotation.y = Math.PI / 2;
      headGroup.add(canRing);
    });

    root.add(headGroup);

    // =========================================================================
    // --- 5. AUTHENTIC DUAL-THRUSTER JETPACK UNIT ---
    // =========================================================================
    const jetpackGroup = new THREE.Group();
    jetpackGroup.name = 'jetpack';

    // Streamlined Main Shell Housing
    const packBody = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.78, 0.32), armorWhiteMat);
    packBody.position.set(0, 1.44, -0.36);
    packBody.castShadow = true;
    jetpackGroup.add(packBody);

    // Center Core Inset & Power Cells
    const packCore = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.12), darkTitaniumMat);
    packCore.position.set(0, 1.44, -0.50);
    jetpackGroup.add(packCore);

    // Top Air Intake Honeycomb Grille
    const packGrille = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.18), darkTitaniumMat);
    packGrille.position.set(0, 1.84, -0.38);
    jetpackGroup.add(packGrille);

    // Whip Antenna (Tactical carbon fiber communications mast)
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 0.52, 8), darkTitaniumMat);
    antenna.position.set(0.24, 2.08, -0.40);
    antenna.rotation.z = -0.12;
    jetpackGroup.add(antenna);

    // Emergency Flashing Beacon Light
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), neonAmberMat);
    beacon.position.set(0, 1.88, -0.42);
    jetpackGroup.add(beacon);

    // Left & Right Swiveling Gimbal Thruster Pods (Authentic No Man's Sky Pods)
    [-0.30, 0.30].forEach((xPos, idx) => {
      const podGroup = new THREE.Group();
      podGroup.name = idx === 0 ? 'thruster_l' : 'thruster_r';
      podGroup.position.set(xPos, 1.34, -0.38);

      // Main cylindrical rocket pod
      const podCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.42, 16), armorTealMat);
      podCyl.castShadow = true;
      podGroup.add(podCyl);

      // Top Intake Turbine Ring
      const topRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 16), darkTitaniumMat);
      topRing.position.y = 0.21;
      topRing.rotation.x = Math.PI / 2;
      podGroup.add(topRing);

      // Titanium Bell Nozzle (Exhaust bell where flame originates)
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.28, 16), darkTitaniumMat);
      nozzle.position.y = -0.30;
      nozzle.castShadow = true;
      podGroup.add(nozzle);

      // Inner Glow Ring
      const glowRing = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.12, 12), neonAtlasMat);
      glowRing.position.y = -0.43;
      glowRing.rotation.x = Math.PI / 2;
      podGroup.add(glowRing);

      jetpackGroup.add(podGroup);
    });

    root.add(jetpackGroup);

    // =========================================================================
    // --- 6. FULLY ARTICULATED LEGS & MAGNETIC PLANETARY BOOTS ---
    // =========================================================================
    [-0.22, 0.22].forEach((xPos, idx) => {
      const legPivot = new THREE.Group();
      legPivot.name = idx === 0 ? 'leg_l' : 'leg_r';
      legPivot.position.set(xPos, 0.88, 0);

      // Thigh Core (Thermal fabric)
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.44, 16), underSuitMat);
      thigh.position.set(0, -0.20, 0);
      thigh.castShadow = true;
      legPivot.add(thigh);

      // Outer Thigh Ballistic Armor Plate
      const thighArmor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.24), armorWhiteMat);
      thighArmor.position.set(xPos > 0 ? 0.13 : -0.13, -0.18, 0);
      thighArmor.castShadow = true;
      legPivot.add(thighArmor);

      // Articulated Round Knee Guard
      const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16), armorTealMat);
      knee.rotation.z = Math.PI / 2;
      knee.position.set(0, -0.42, 0.08);
      knee.castShadow = true;
      legPivot.add(knee);

      // Shin Guard & Rear Calf Servos
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.38, 16), armorWhiteMat);
      shin.position.set(0, -0.62, 0);
      shin.castShadow = true;
      legPivot.add(shin);

      const calfExo = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.28, 0.06), darkTitaniumMat);
      calfExo.position.set(0, -0.62, -0.12);
      legPivot.add(calfExo);

      // Magnetic Planetary Boots (Heavy treaded off-world boots)
      const bootGroup = new THREE.Group();
      bootGroup.position.set(0, -0.80, 0);

      // Upper Boot Cuff
      const bootCuff = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.28), darkTitaniumMat);
      bootCuff.position.set(0, 0.02, 0);
      bootGroup.add(bootCuff);

      // Front Toe Box Cap
      const toeCap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.22), armorTealMat);
      toeCap.position.set(0, -0.04, 0.15);
      toeCap.castShadow = true;
      bootGroup.add(toeCap);

      // Rugged Magnetic Tread Sole
      const treadSole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.44), rubberMat);
      treadSole.position.set(0, -0.08, 0.06);
      treadSole.castShadow = true;
      bootGroup.add(treadSole);

      legPivot.add(bootGroup);
      root.add(legPivot);
    });

    // =========================================================================
    // --- 7. ARTICULATED ARMS, WRIST HUD & ATLANTID MULTI-TOOL ---
    // =========================================================================

    // --- LEFT ARM (Natural dynamic walking swing opposite to legs) ---
    const leftArmPivot = new THREE.Group();
    leftArmPivot.name = 'arm_l';
    leftArmPivot.position.set(-0.52, 1.54, 0);

    // 2-Piece Articulated Shoulder Pauldron
    const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), armorTealMat);
    leftShoulder.scale.set(1.1, 0.9, 1.1);
    leftArmPivot.add(leftShoulder);

    // Upper Arm Bicep (Fabric + Carbon plating)
    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.36, 12), underSuitMat);
    leftBicep.position.set(0, -0.22, 0);
    leftBicep.castShadow = true;
    leftArmPivot.add(leftBicep);

    // Elbow Guard
    const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), darkTitaniumMat);
    leftElbow.position.set(0, -0.40, -0.04);
    leftArmPivot.add(leftElbow);

    // Forearm Gauntlet & Wrist Hologram Terminal
    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.34, 12), armorWhiteMat);
    leftForearm.position.set(0, -0.58, 0.02);
    leftForearm.castShadow = true;
    leftArmPivot.add(leftForearm);

    // Exosuit Wrist Terminal Screen (Illuminated Cyan Status HUD)
    const wristScreen = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), neonAtlasMat);
    wristScreen.position.set(0, -0.54, 0.13);
    wristScreen.rotation.x = -0.2;
    leftArmPivot.add(wristScreen);

    // Tactical Gloved Hand
    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.16), darkTitaniumMat);
    leftHand.position.set(0, -0.78, 0.04);
    leftHand.castShadow = true;
    leftArmPivot.add(leftHand);

    root.add(leftArmPivot);

    // --- RIGHT ARM (Forward Tactical Grip on Atlantid Multi-Tool) ---
    const rightArmPivot = new THREE.Group();
    rightArmPivot.name = 'arm_r';
    rightArmPivot.position.set(0.52, 1.54, 0);
    rightArmPivot.rotation.x = -Math.PI / 4.2;

    // Right Shoulder Pauldron
    const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), armorTealMat);
    rightShoulder.scale.set(1.1, 0.9, 1.1);
    rightArmPivot.add(rightShoulder);

    // Right Bicep
    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.36, 12), underSuitMat);
    rightBicep.position.set(0, -0.22, 0);
    rightBicep.castShadow = true;
    rightArmPivot.add(rightBicep);

    // Right Forearm
    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.34, 12), armorWhiteMat);
    rightForearm.position.set(0, -0.58, 0.02);
    rightForearm.castShadow = true;
    rightArmPivot.add(rightForearm);

    // Right Gloved Hand gripping gun handle
    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.16), darkTitaniumMat);
    rightHand.position.set(0, -0.76, 0.06);
    rightHand.castShadow = true;
    rightArmPivot.add(rightHand);

    // =========================================================================
    // --- 8. ICONIC ATLANTID MULTI-TOOL BLASTER ---
    // =========================================================================
    const multiToolMesh = new THREE.Group();
    multiToolMesh.position.set(0, -0.74, 0.38);

    // Main Receiver Chassis (Angled Bullpup Profile)
    const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.68), darkTitaniumMat);
    rifleBody.castShadow = true;
    multiToolMesh.add(rifleBody);

    // Teal Upper Composite Housing
    const rifleUpper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.48), armorTealMat);
    rifleUpper.position.set(0, 0.10, -0.06);
    rifleUpper.castShadow = true;
    multiToolMesh.add(rifleUpper);

    // Top Holographic Optical Sight
    const holoOptic = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.18), darkTitaniumMat);
    holoOptic.position.set(0, 0.20, -0.08);
    multiToolMesh.add(holoOptic);

    const holoLens = new THREE.Mesh(new THREE.RingGeometry(0.015, 0.035, 8), neonAtlasMat);
    holoLens.position.set(0, 0.20, 0.01);
    multiToolMesh.add(holoLens);

    // Heavy Barrel & Cooling Heat-sink Ribs
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.36, 16), darkTitaniumMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.46);
    multiToolMesh.add(barrel);

    // Focusing Crystal Chamber (Emitting intense blue laser readiness)
    const crystalRing = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.018, 8, 16), neonAtlasMat);
    crystalRing.position.set(0, 0.02, 0.58);
    multiToolMesh.add(crystalRing);

    // Muzzle Emitter Disc
    const muzzleDisc = new THREE.Mesh(new THREE.CircleGeometry(0.042, 12), neonAtlasMat);
    muzzleDisc.position.set(0, 0.02, 0.64);
    multiToolMesh.add(muzzleDisc);

    // Lower Energy Battery Mag (Removable carbon cartridge)
    const batteryMag = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.16, 0.14), armorWhiteMat);
    batteryMag.position.set(0, -0.16, -0.12);
    multiToolMesh.add(batteryMag);

    rightArmPivot.add(multiToolMesh);
    root.add(rightArmPivot);

    // =========================================================================
    // --- 9. GLOBAL GUARANTEE: NEVER CLIPS, NEVER CULLED, 100% PERSISTENT ---
    // =========================================================================
    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.frustumCulled = false;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return root;
  }
}
