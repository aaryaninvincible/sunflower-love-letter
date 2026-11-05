/**
 * Interactive 3D Sunflower Engine (Three.js)
 * Procedural Fibonacci Disc, Organic Petal Whorls, Floating Pollen & Heliotropism
 */

class Sunflower3DScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.wrapper = document.getElementById('canvas-3d-wrapper');
    this.petals = [];
    this.falling3DPetals = [];
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();
    this.pluckedCount = 0;

    this.initScene();
    this.buildSunflower();
    this.createPollenCloud();
    this.setupEvents();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();

    // Subtle atmospheric distance fog for romantic depth
    this.scene.fog = new THREE.FogExp2(0x0d0a08, 0.05);

    const width = this.wrapper.clientWidth || window.innerWidth / 2;
    const height = this.wrapper.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.8, 5.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 8.0;
    this.controls.enablePan = false;

    // Golden Hour Lighting
    const ambientLight = new THREE.AmbientLight(0xfff1dc, 0.8);
    this.scene.add(ambientLight);

    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xffb834, 2.2);
    sunLight.position.set(4, 5, 3);
    this.scene.add(sunLight);

    // Golden Rim Light behind the flower for that glowing petal halo
    const rimLight = new THREE.DirectionalLight(0xff7700, 3.0);
    rimLight.position.set(-2, 3, -4);
    this.scene.add(rimLight);

    // Soft Blue-Violet ground bounce
    const fillLight = new THREE.PointLight(0xa58265, 1.2, 10);
    fillLight.position.set(0, -3, 2);
    this.scene.add(fillLight);
  }

  buildSunflower() {
    this.flowerRoot = new THREE.Group();
    this.flowerHead = new THREE.Group();

    // 1. Procedural Fibonacci Center Disc (Phyllotaxis)
    const seedGeo = new THREE.SphereGeometry(0.045, 6, 6);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x241407,
      roughness: 0.85,
      metalness: 0.1
    });

    const numSeeds = 260;
    const goldenAngle = 137.5077 * (Math.PI / 180);
    const discGroup = new THREE.Group();

    for (let i = 0; i < numSeeds; i++) {
      const r = 0.075 * Math.sqrt(i);
      const theta = i * goldenAngle;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const z = 0.12 * Math.cos(r * 1.5);

      const seedMesh = new THREE.Mesh(seedGeo, discMat);
      seedMesh.position.set(x, y, z);
      const scale = 0.6 + 0.45 * (i / numSeeds);
      seedMesh.scale.set(scale, scale, scale * 1.2);
      discGroup.add(seedMesh);
    }
    this.flowerHead.add(discGroup);

    // 2. Petal Geometry (Curved shape)
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(-0.25, 0.6, -0.28, 1.1);
    petalShape.quadraticCurveTo(-0.15, 1.7, 0, 2.0); // Petal tip
    petalShape.quadraticCurveTo(0.15, 1.7, 0.28, 1.1);
    petalShape.quadraticCurveTo(0.25, 0.6, 0, 0);

    const petalGeo = new THREE.ShapeGeometry(petalShape, 12);
    // Add subtle organic curve along Z axis
    const pos = petalGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = 0.08 * Math.sin((y / 2.0) * Math.PI) - 0.12 * Math.abs(x);
      pos.setZ(i, z);
    }
    petalGeo.computeVertexNormals();

    // Petal Material with warm golden gradient feel
    const innerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xffb515,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const outerPetalMat = new THREE.MeshStandardMaterial({
      color: 0xffa400,
      roughness: 0.38,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Inner Petals Whorl
    const innerCount = 28;
    const innerRadius = 1.05;
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, innerPetalMat);
      petal.position.set(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0.04);
      petal.rotation.z = angle - Math.PI / 2;
      petal.rotation.x = 0.18 + Math.random() * 0.08; // Gentle cup forward
      petal.scale.set(0.85, 0.88, 0.85);
      petal.userData = { isPetal: true, index: i };
      this.flowerHead.add(petal);
      this.petals.push(petal);
    }

    // Outer Petals Whorl
    const outerCount = 32;
    const outerRadius = 1.18;
    for (let i = 0; i < outerCount; i++) {
      const angle = ((i + 0.5) / outerCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, outerPetalMat);
      petal.position.set(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, -0.02);
      petal.rotation.z = angle - Math.PI / 2;
      petal.rotation.x = 0.32 + Math.random() * 0.08;
      petal.scale.set(0.96, 1.02, 0.96);
      petal.userData = { isPetal: true, index: innerCount + i };
      this.flowerHead.add(petal);
      this.petals.push(petal);
    }

    // 3. Flower Stem (Smooth bezier spline)
    const stemCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, -0.8, -0.1),
      new THREE.Vector3(-0.15, -1.8, 0.15),
      new THREE.Vector3(0, -3.2, 0)
    );
    const stemGeo = new THREE.TubeGeometry(stemCurve, 32, 0.09, 12, false);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x3d661e,
      roughness: 0.65,
      metalness: 0.05
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    this.flowerRoot.add(stemMesh);

    // 4. Leaves attached to stem
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(-0.4, 0.5, -0.45, 1.0);
    leafShape.quadraticCurveTo(-0.2, 1.6, 0, 1.9);
    leafShape.quadraticCurveTo(0.2, 1.6, 0.45, 1.0);
    leafShape.quadraticCurveTo(0.4, 0.5, 0, 0);

    const leafGeo = new THREE.ShapeGeometry(leafShape, 8);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x487524,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    const leaf1 = new THREE.Mesh(leafGeo, leafMat);
    leaf1.position.set(-0.08, -1.1, 0.05);
    leaf1.rotation.set(0.5, 0.8, 1.6);
    leaf1.scale.set(0.7, 0.7, 0.7);
    this.flowerRoot.add(leaf1);

    const leaf2 = new THREE.Mesh(leafGeo, leafMat);
    leaf2.position.set(0.02, -1.9, -0.05);
    leaf2.rotation.set(-0.3, -1.0, -1.8);
    leaf2.scale.set(0.85, 0.85, 0.85);
    this.flowerRoot.add(leaf2);

    // Assemble Flower Head & Root
    this.flowerHead.position.set(0, 0.1, 0);
    this.flowerRoot.add(this.flowerHead);
    this.flowerRoot.position.set(0, 0.5, 0);

    this.scene.add(this.flowerRoot);
  }

  createPollenCloud() {
    const pollenCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pollenCount * 3);
    const velocities = [];

    for (let i = 0; i < pollenCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      velocities.push({
        x: (Math.random() - 0.5) * 0.003,
        y: Math.random() * 0.004 + 0.002,
        z: (Math.random() - 0.5) * 0.003
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Canvas circular soft glowing particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 220, 100, 1)');
    grad.addColorStop(0.4, 'rgba(255, 180, 40, 0.6)');
    grad.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.pollenPoints = new THREE.Points(geometry, material);
    this.pollenVelocities = velocities;
    this.scene.add(this.pollenPoints);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Heliotropism: track mouse movement to tilt sunflower head towards user's cursor
    this.wrapper.addEventListener('mousemove', (e) => {
      const rect = this.wrapper.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.mouse.targetX = nx * 0.45;
      this.mouse.targetY = ny * 0.35;
    });

    // Click on 3D sunflower to pluck petal
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    this.wrapper.addEventListener('click', (e) => {
      const rect = this.wrapper.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseCoord, this.camera);
      const intersects = raycaster.intersectObjects(this.petals);

      if (intersects.length > 0) {
        const plucked = intersects[0].object;
        this.pluckPetal(plucked);
      } else {
        // If clicking disc or flower in general, pluck a random available petal
        const generalHits = raycaster.intersectObject(this.flowerHead, true);
        if (generalHits.length > 0 && this.petals.length > 0) {
          const randomIdx = Math.floor(Math.random() * this.petals.length);
          this.pluckPetal(this.petals[randomIdx]);
        }
      }
    });
  }

  pluckPetal(petalMesh) {
    if (!petalMesh || !petalMesh.parent) return;

    // Remove from active petals list
    const idx = this.petals.indexOf(petalMesh);
    if (idx > -1) {
      this.petals.splice(idx, 1);
    }

    // Convert to world space to let it fall
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    petalMesh.getWorldPosition(worldPos);
    petalMesh.getWorldQuaternion(worldQuat);

    petalMesh.parent.remove(petalMesh);
    this.scene.add(petalMesh);

    petalMesh.position.copy(worldPos);
    petalMesh.quaternion.copy(worldQuat);

    // Physics data for falling
    petalMesh.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      -0.035 - Math.random() * 0.02,
      (Math.random() - 0.5) * 0.02
    );
    petalMesh.userData.rotSpeed = new THREE.Vector3(
      Math.random() * 0.05,
      Math.random() * 0.05,
      Math.random() * 0.05
    );

    this.falling3DPetals.push(petalMesh);
    this.pluckedCount++;

    // Audio Chime
    if (window.romanticAudio) {
      window.romanticAudio.playPetalChime(this.pluckedCount);
    }

    // Trigger UI Oracle update
    if (window.onPetalPlucked) {
      window.onPetalPlucked(this.pluckedCount);
    }
  }

  onResize() {
    const width = this.wrapper.clientWidth;
    const height = this.wrapper.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Heliotropism (face follows mouse lightly)
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // 2. Natural Wind Sway (Breeze)
    const breezeX = Math.sin(elapsedTime * 0.8) * 0.08;
    const breezeZ = Math.cos(elapsedTime * 0.6) * 0.05;

    if (this.flowerHead) {
      this.flowerHead.rotation.y = this.mouse.x + breezeX;
      this.flowerHead.rotation.x = -this.mouse.y + breezeZ;
    }

    if (this.flowerRoot) {
      this.flowerRoot.rotation.z = Math.sin(elapsedTime * 0.5) * 0.03;
    }

    // 3. Falling 3D Petals Animation
    for (let i = this.falling3DPetals.length - 1; i >= 0; i--) {
      const p = this.falling3DPetals[i];
      p.position.add(p.userData.velocity);
      p.rotation.x += p.userData.rotSpeed.x;
      p.rotation.y += p.userData.rotSpeed.y;
      p.rotation.z += p.userData.rotSpeed.z;

      // Flutter drift
      p.position.x += Math.sin(elapsedTime * 3 + p.id) * 0.015;

      // Remove after falling below view
      if (p.position.y < -4.5) {
        this.scene.remove(p);
        this.falling3DPetals.splice(i, 1);
      }
    }

    // 4. Pollen drifting animation
    if (this.pollenPoints) {
      const pos = this.pollenPoints.geometry.attributes.position.array;
      for (let i = 0; i < pos.length / 3; i++) {
        const vel = this.pollenVelocities[i];
        pos[i * 3 + 1] += vel.y;
        pos[i * 3] += vel.x + Math.sin(elapsedTime + i) * 0.001;

        // Loop back to bottom
        if (pos[i * 3 + 1] > 3.0) {
          pos[i * 3 + 1] = -2.5;
        }
      }
      this.pollenPoints.geometry.attributes.position.needsUpdate = true;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate on load
window.addEventListener('DOMContentLoaded', () => {
  window.sunflowerScene = new Sunflower3DScene('sunflower-canvas');
});
