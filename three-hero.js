/**
 * IlmHub AI - 3D Hero Antigravity Canvas
 * Interactive Three.js scene featuring floating books, glowing percentage rings,
 * geometric knowledge crystals, and a dynamic particle field reacting smoothly to mouse/touch.
 */

class HeroScene {
  constructor(containerId = 'hero-canvas-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Animation objects
    this.floatingGroup = null;
    this.ringsGroup = null;
    this.particles = null;
    this.crystals = [];
    this.bookMesh = null;

    // Interaction state
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.clock = new THREE.Clock();
    this.isLightMode = document.documentElement.classList.contains('light');

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 16);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.setupLighting();

    // 5. Build 3D Objects
    this.buildSceneObjects();

    // 6. Event Listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });

    // 7. Start Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(this.ambientLight);

    // Primary Emerald Light
    this.emeraldLight = new THREE.PointLight(0x10b981, 2.5, 50);
    this.emeraldLight.position.set(6, 6, 8);
    this.scene.add(this.emeraldLight);

    // Secondary Cyan/Indigo Light
    this.cyanLight = new THREE.PointLight(0x06b6d4, 2.2, 50);
    this.cyanLight.position.set(-8, -4, 6);
    this.scene.add(this.cyanLight);

    // Rim Purple Light
    this.purpleLight = new THREE.PointLight(0x8b5cf6, 1.8, 40);
    this.purpleLight.position.set(0, 8, -5);
    this.scene.add(this.purpleLight);
  }

  buildSceneObjects() {
    this.floatingGroup = new THREE.Group();
    this.scene.add(this.floatingGroup);

    // A. 3D Glowing Chrono / Percentage Rings
    this.ringsGroup = new THREE.Group();
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x059669,
      emissiveIntensity: 0.45,
      wireframe: false
    });

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x0891b2,
      emissiveIntensity: 0.35,
      wireframe: true
    });

    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.3
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.08, 16, 100), ringMat1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.05, 16, 80), ringMat2);
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.04, 16, 90), ringMat3);

    ring1.rotation.x = Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    ring3.rotation.z = Math.PI / 6;

    this.ringsGroup.add(ring1);
    this.ringsGroup.add(ring2);
    this.ringsGroup.add(ring3);
    this.floatingGroup.add(this.ringsGroup);

    // B. Floating Holographic Book Mesh
    this.bookMesh = this.createStylizedBook();
    this.bookMesh.scale.set(1.3, 1.3, 1.3);
    this.bookMesh.position.set(0, 0, 0);
    this.floatingGroup.add(this.bookMesh);

    // C. Geometric Knowledge Crystals (Floating Orbiters)
    const crystalGeos = [
      new THREE.IcosahedronGeometry(0.55, 0),
      new THREE.OctahedronGeometry(0.65, 0),
      new THREE.DodecahedronGeometry(0.5, 0),
      new THREE.TetrahedronGeometry(0.7, 0)
    ];

    const crystalColors = [0x10b981, 0x06b6d4, 0x3b82f6, 0xa855f7];
    const orbDistances = [
      { x: -5, y: 2.2, z: 1.5 },
      { x: 5.2, y: -2, z: -1 },
      { x: -3.8, y: -3.2, z: 2 },
      { x: 4.2, y: 3.5, z: -2 }
    ];

    this.crystals = [];
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshPhysicalMaterial({
        color: crystalColors[i],
        emissive: crystalColors[i],
        emissiveIntensity: 0.35,
        roughness: 0.1,
        metalness: 0.4,
        transmission: 0.65,
        ior: 1.5,
        transparent: true,
        opacity: 0.88
      });

      const crystal = new THREE.Mesh(crystalGeos[i], mat);
      crystal.position.set(orbDistances[i].x, orbDistances[i].y, orbDistances[i].z);
      crystal.userData = {
        baseX: orbDistances[i].x,
        baseY: orbDistances[i].y,
        baseZ: orbDistances[i].z,
        rotSpeedX: 0.01 + Math.random() * 0.015,
        rotSpeedY: 0.015 + Math.random() * 0.015,
        floatFreq: 1.2 + Math.random() * 0.8,
        floatAmp: 0.35 + Math.random() * 0.2
      };

      this.crystals.push(crystal);
      this.floatingGroup.add(crystal);
    }

    // D. Particle Cloud (Stars / Cyber Dust)
    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x10b981); // Emerald
    const c2 = new THREE.Color(0x06b6d4); // Cyan
    const c3 = new THREE.Color(0x8b5cf6); // Violet

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const pick = Math.random();
      const col = pick < 0.4 ? c1 : pick < 0.75 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);
  }

  createStylizedBook() {
    const bookGroup = new THREE.Group();

    // Book Cover Material (Cyber Emerald Leather/Glass)
    const coverMat = new THREE.MeshPhysicalMaterial({
      color: 0x064e3b,
      emissive: 0x047857,
      emissiveIntensity: 0.25,
      roughness: 0.2,
      metalness: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2
    });

    // Book Pages Material (Glowing Cream)
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdf4,
      emissive: 0x10b981,
      emissiveIntensity: 0.15,
      roughness: 0.6
    });

    // Gold/Neon Accent Material
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1
    });

    // Left Cover
    const coverLeft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 0.08), coverMat);
    coverLeft.position.set(-0.8, 0, -0.05);
    coverLeft.rotation.y = 0.25;
    bookGroup.add(coverLeft);

    // Right Cover
    const coverRight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 0.08), coverMat);
    coverRight.position.set(0.8, 0, -0.05);
    coverRight.rotation.y = -0.25;
    bookGroup.add(coverRight);

    // Book Spine
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.3, 16), goldMat);
    spine.position.set(0, 0, -0.2);
    bookGroup.add(spine);

    // Pages (Left & Right)
    const pagesLeft = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.1, 0.25), pagesMat);
    pagesLeft.position.set(-0.75, 0, 0.08);
    pagesLeft.rotation.y = 0.25;
    bookGroup.add(pagesLeft);

    const pagesRight = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.1, 0.25), pagesMat);
    pagesRight.position.set(0.75, 0, 0.08);
    pagesRight.rotation.y = -0.25;
    bookGroup.add(pagesRight);

    // Glowing Bookmark Ribbon
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.6, 0.02), goldMat);
    ribbon.position.set(0, -0.2, 0.22);
    ribbon.rotation.z = -0.08;
    bookGroup.add(ribbon);

    // Angle the book naturally
    bookGroup.rotation.x = 0.4;
    bookGroup.rotation.y = -0.3;

    return bookGroup;
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX - this.windowHalfX) / this.windowHalfX;
    this.targetMouseY = (e.clientY - this.windowHalfY) / this.windowHalfY;
  }

  onTouchMove(e) {
    if (e.touches.length > 0) {
      this.targetMouseX = (e.touches[0].clientX - this.windowHalfX) / this.windowHalfX;
      this.targetMouseY = (e.touches[0].clientY - this.windowHalfY) / this.windowHalfY;
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  setTheme(isDark) {
    if (!this.ambientLight || !this.emeraldLight || !this.cyanLight) return;
    if (isDark) {
      this.ambientLight.intensity = 0.85;
      this.ambientLight.color.setHex(0xffffff);
      this.emeraldLight.intensity = 2.5;
      this.cyanLight.intensity = 2.2;
    } else {
      this.ambientLight.intensity = 1.4;
      this.ambientLight.color.setHex(0xffffff);
      this.emeraldLight.intensity = 3.2;
      this.cyanLight.intensity = 2.8;
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth Mouse Lerp (Inertia)
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Floating Group Parallax
    if (this.floatingGroup) {
      this.floatingGroup.rotation.y = this.mouseX * 0.55 + Math.sin(elapsedTime * 0.4) * 0.08;
      this.floatingGroup.rotation.x = -this.mouseY * 0.4 + Math.cos(elapsedTime * 0.35) * 0.06;
      this.floatingGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.25;
    }

    // Rings Rotation
    if (this.ringsGroup) {
      const [r1, r2, r3] = this.ringsGroup.children;
      if (r1) {
        r1.rotation.x += 0.008;
        r1.rotation.y += 0.012;
      }
      if (r2) {
        r2.rotation.y -= 0.014;
        r2.rotation.z += 0.009;
      }
      if (r3) {
        r3.rotation.z += 0.006;
        r3.rotation.x -= 0.01;
      }
    }

    // Book Micro-Floating
    if (this.bookMesh) {
      this.bookMesh.position.y = Math.sin(elapsedTime * 1.2) * 0.15;
      this.bookMesh.rotation.z = Math.sin(elapsedTime * 0.7) * 0.05;
    }

    // Crystals floating in orbit
    this.crystals.forEach((crystal) => {
      const u = crystal.userData;
      crystal.rotation.x += u.rotSpeedX;
      crystal.rotation.y += u.rotSpeedY;
      crystal.position.y = u.baseY + Math.sin(elapsedTime * u.floatFreq) * u.floatAmp;
      crystal.position.x = u.baseX + Math.cos(elapsedTime * u.floatFreq * 0.7) * 0.15;
    });

    // Particle Cloud slow drift
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02 + this.mouseX * 0.15;
      this.particles.rotation.x = elapsedTime * 0.015 - this.mouseY * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize on window load
window.addEventListener('DOMContentLoaded', () => {
  window.heroScene = new HeroScene('hero-canvas-container');
});
