const config = JSON.parse(document.getElementById("configurator-data").textContent);

window.DubraeApp = {
  // =========================
  // PROPERTIES
  // =========================
  canvas: null,
  scene: null,
  camera: null,
  renderer: null,
  raycaster: null,
  mouse: null,
  controls: null,
  controls2: null,
  loader: null,
  model: null,
  dirLight: null,
  floor: null,

  mouseDown: false,
  startX: 0,
  startY: 0,
  clickThreshold: 5,
  viewport_width: 0,
  viewport_height: 1,

  activeMesh: null,
  textMesh: null,
  fonts: {},
  fontLoader: null,
  activeFont: "futura",

  customLogos: null,

  price: {
    current: 5.0,
    base: 5.0,
    text: 4.95,
    logos: 4.95,
  },

  selectedOptions: {
    text: false,
    logos: false,
  },

  models: {
    medium: config.models.medium,
    small: config.models.small,
    shoe: config.models.shoe,
  },

  dubraes: [],
  airforceShoe: [],
  textClones: [],
  customLogosClones: [],
  customLogosColor: "#000000",
  clone: null,

  activeModel: "small",
  activeColor: "N/a",
  activeText: "N/a",
  activeTextColor: "N/a",
  activeTextColorTitle: "N/a",
  activeCustomLogo: "N/a",
  activeLogoColor: "N/a",

  targetPosition: new THREE.Vector3(),
  isMoving: false,
  activeFontSize: 0.5,

  cameraStates: {},

  // =========================
  // INIT
  // =========================
  init() {
    this.loadingScreen();
    this.setupScene();
    this.setupLights();
    this.setupFloor();
    this.loadModel();
    this.loadFont();
    this.setupEvents();
    this.setupUI();
    this.customLogo();
    this.animate();
  },

  loadingScreen() {
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = () => {
      document.getElementById("loader").style.display = "flex";
    };

    this.loadingManager.onLoad = () => {
      const loader = document.getElementById("loader");

      loader.classList.add("hiddens");

      setTimeout(() => {
        loader.style.display = "none";
      }, 400);
    };

    this.loadingManager.onError = (url) => {
      console.error("Error loading:", url);
    };

    this.loader = new THREE.GLTFLoader(this.loadingManager);
    this.fontLoader = new THREE.FontLoader(this.loadingManager);
  },

  // =========================
  // SCENE SETUP
  // =========================
  setupScene() {
    this.canvas = document.getElementById("dubrae-config");
    const isMobile = window.innerWidth < 992 || window.innerHeight < 430;


    const v_width = isMobile ? 0 : 500;
    const v_height = window.innerWidth < 992 ? 2 : 1;

    const width = window.innerWidth - v_width;
    const height = window.innerHeight / v_height;

    const btn = document.querySelector(".icon-container");
    btn.style.right = v_width + 20 + "px";
    btn.style.opacity = 1;

    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 10);

    this.snapshotCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.snapshotCamera.position.set(0, 0, 10);
    this.snapshotCamera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Color + Lighting Setup
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2.5;
    this.renderer.physicallyCorrectLights = true;

    // Orbit Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.enablePan = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Trackball Controls
    this.controls2 = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls2.noRotate = true;
    this.controls2.noPan = true;
    this.controls2.noZoom = false;
    this.controls2.zoomSpeed = 0.3;

    this.saveCameraState("default");
  },

  // =========================
  // LIGHTS
  // =========================

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 3);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 10);
    dirLight.position.set(0, 10, 5);
    dirLight.castShadow = true;

    this.dirLight = dirLight;

    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.radius = 6;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.normalBias = 0.02;

    dirLight.shadow.camera.left = -8;
    dirLight.shadow.camera.right = 8;
    dirLight.shadow.camera.top = 8;
    dirLight.shadow.camera.bottom = -8;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.updateProjectionMatrix();

    this.scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 8);
    dirLight2.position.set(-5, 1, -5);
    this.scene.add(dirLight2);
  },

  // =========================
  // FLOOR
  // =========================

  setupFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.4 })
    );

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.5;
    floor.receiveShadow = true;

    this.floor = floor;
    this.scene.add(floor);
  },

  saveCameraState(name) {
    this.cameraStates[name] = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
    };
  },

  goToCameraState(name) {
    const state = this.cameraStates[name];
    if (!state) return;

    gsap.to(this.camera.position, {
      x: state.position.x,
      y: state.position.y,
      z: state.position.z,
      duration: 1,
      ease: "power2.out",
    });

    gsap.to(this.controls.target, {
      x: state.target.x,
      y: state.target.y,
      z: state.target.z,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => this.controls.update(),
    });
  },

  // =========================
  // Font Used in Personalization Text
  // =========================

  loadFont() {
    Object.entries(config.fonts).forEach(([name, path]) => {
      this.fontLoader.load(path, (font) => {
        this.fonts[name] = font;
      });
    });
  },

  // =========================
  // LOAD MODEL
  // =========================

  loadModel() {
    this.dubraes = [];
    this.airforceShoe = [];

    Object.entries(this.models).forEach(([key, modelPath]) => {
      this.loader.load(modelPath, (gltf) => {
        const model = gltf.scene;

        this.model = model;

        model.traverse((child) => {
          if (child.isMesh) {
            child.material = Array.isArray(child.material) ? child.material.map((mat) => mat.clone()) : child.material.clone();

            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name.includes("Plane_Plane")) {
              this.dubraes.push(child);
              child.userData.originalPosition = child.position.clone();
              child.userData.originalQuaternion = child.quaternion.clone();
            } else if (child.name.includes("airforce")) {
              this.airforceShoe.push(child);
              child.castShadow = false;
              child.receiveShadow = false;
              child.userData.originalPosition = child.position.clone();
            } else if (child.name.includes("Text")){
              this.airforceShoe.push(child);
              child.castShadow = false;
              child.receiveShadow = false;
              child.visible = false;
            }
          }
        });

        this.scene.add(model);

        if (key === "shoe") {
          model.position.set(50, 0, 0);
          model.rotation.y = 7.5;

          this.shoe = model;
        }

        this.dubraes.forEach((child) => {
          if (child.name.includes("Plane_Plane002") || child.name.includes("Plane_Plane001")) {
            child.visible = false;
            child.userData.originalPosition = child.position.clone();
          }
        });

        this.airforceShoe.forEach((child) => {
          if (child.name.includes("airforce")) {
            child.visible = false;
            child.userData.originalPosition = child.position.clone();
          }
        });
      });
    });
  },
  // =========================
  // EVENTS
  // =========================
  setupEvents() {
    this.renderer.domElement.addEventListener("mousedown", (event) => {
      this.mouseDown = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
    });

    this.renderer.domElement.addEventListener("mouseup", (event) => {
      if (!this.mouseDown) return;

      this.mouseDown = false;

      const deltaX = Math.abs(event.clientX - this.startX);
      const deltaY = Math.abs(event.clientY - this.startY);

      if (deltaX < this.clickThreshold && deltaY < this.clickThreshold) {
        this.onClick(event);
      }
    });

    window.addEventListener("resize", () => this.onResize());
  },

  // =========================
  // Clicking a mesh
  // =========================
  onClick(event) {
    if (!this.model) return;

    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.dubraes, true).filter((i) => i.object.visible);

    if (!intersects || intersects.length === 0) return;

    const clickedObject = intersects[0].object;

    if (clickedObject.isMesh && clickedObject.name.includes("Plane_Plane")) {
      this.activeMesh = clickedObject;
    }

    this.focusOnObject(clickedObject);
  },

  focusOnObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    box.getCenter(this.targetPosition);
    this.isMoving = true;
  },

  // =========================
  // Add 3D Text
  // =========================

  addText3D(text) {
    if (!this.fonts[this.activeFont]) {
      console.warn("Font not loaded yet");
      return;
    }

    this.hideCustomLogo();
    this.hidePesonalizationText();
   
    this.activeText = text;
    
    if (text.length <= 0) {
      this.selectedOptions.text = false;
      this.activeText = "N/a";
      this.calculatePrice();
    } else {
      this.selectedOptions.text = true;
      this.calculatePrice();
    }

    let fontSize = this.activeFontSize || 0.5;

    let geometry = new THREE.TextGeometry(text, {
      font: this.fonts[this.activeFont],
      size: fontSize,
      height: 0.075,
      curveSegments: 12,
      bevelEnabled: false,
    });

    geometry.computeBoundingBox();

    const maxTextWidth = this.activeModel === "small" ? 2.7 : 4.7;
    let textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;

    if (textWidth > maxTextWidth) {
      fontSize *= maxTextWidth / textWidth;

      geometry.dispose();

      geometry = new THREE.TextGeometry(text, {
        font: this.fonts[this.activeFont],
        size: fontSize,
        height: 0.075,
        curveSegments: 12,
        bevelEnabled: false,
      });

      geometry.computeBoundingBox();
    }

    geometry.center();

    const radius = this.activeModel === "small" ? 13 : 10;
    this.bendTextGeometry(geometry, radius);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.activeTextColor || 0x000000).convertSRGBToLinear(),
      metalness: 0.5,
      roughness: 1,
    });

    this.textClones = [];

    this.dubraes.forEach((mesh) => {
      if (!mesh.visible) return;

      const textClone = new THREE.Mesh(geometry.clone(), material.clone());

      const box = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      box.getCenter(center);

      mesh.worldToLocal(center);
      mesh.add(textClone);
      textClone.position.copy(center);

      if (this.activeModel === "small") {
        const dir = new THREE.Vector3(0.5, 0, 0.66);
        dir.applyQuaternion(mesh.quaternion);
        textClone.position.add(dir.multiplyScalar(-0.5));
        textClone.quaternion.set(-0.7, 0.05, -0.05, 0.7);
        this.textClones.push(textClone);
      } else {
        const dir = new THREE.Vector3(0, 0, 0.95);
        dir.applyQuaternion(mesh.quaternion);
        textClone.position.add(dir.multiplyScalar(-0.5));
   
        textClone.quaternion.set(-0.7071, -0.001, 0.001, 0.7071);
        this.textClones.push(textClone);
      }
    });
  },

  bendTextGeometry(geometry, radius) {
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const width = bbox.max.x - bbox.min.x;

    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    const totalAngle = width / radius;

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);

      const originalZ = vertex.z;

      const percent = (vertex.x - bbox.min.x) / width;
      const angle = (percent - 0.5) * totalAngle;

      const curvedX = Math.sin(angle) * radius;
      const curvedZ = Math.cos(angle) * radius - radius;

      vertex.x = curvedX;
      vertex.z = curvedZ + originalZ;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  },

  hideModel(model) {
    if (model.includes("medium")) {
      this.dubraes.forEach((child) => {
        if (child.name.includes("Plane_Plane003") || child.name.includes("Plane_Plane004")) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      });
    } else {
      this.dubraes.forEach((child) => {
        if (child.name.includes("Plane_Plane001") || child.name.includes("Plane_Plane002")) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      });
    }
  },

  hidePesonalizationText() {
    if (this.textClones && this.textClones.length > 0) {
      this.textClones.forEach((clone) => {
        if (clone.parent) clone.parent.remove(clone);

        clone.geometry.dispose();
        clone.material.dispose();
      });

      this.textClones = [];
      
      this.activeText = "N/a";
    }
  },

  hideCustomLogo() {
    if (!this.customLogosClones) return;

    document.getElementById("noneLogo").classList.add("active");

    this.customLogosClones.forEach((clone) => {
      if (clone.parent) clone.parent.remove(clone);

      clone.geometry.dispose();

      if (Array.isArray(clone.material)) {
        clone.material.forEach((m) => m.dispose());
      } else {
        clone.material.dispose();
      }
    });

    const dropZone = document.getElementById("drop-zone");

    if (dropZone) {
      dropZone.innerHTML = `
        Drag logo here or click<br>
        <small>(PNG, JPG, JPEG, SVG only)</small><br>
        <small>(Note: Background must be transparent)</small>
        <input type="file" id="fileInput" accept="image/*" hidden>
      `;
      this.customLogo();
    }

    this.activeCustomLogo = "N/a";
    this.customLogosClones = [];
    this.customLogoImage = null;

    this.selectedOptions.logos = false;
    this.calculatePrice();
  },

  // =========================
  // PDF Generating
  // =========================

  savePdfSnapshotState() {
    return {
      rendererShadowMapEnabled: this.renderer.shadowMap.enabled,
      dirLightCastShadow: this.dirLight?.castShadow,
      floorVisible: this.floor?.visible,
      floorReceiveShadow: this.floor?.receiveShadow,
      dubraes: this.dubraes.map((dubrae) => ({
        mesh: dubrae,
        visible: dubrae.visible,
        castShadow: dubrae.castShadow,
        receiveShadow: dubrae.receiveShadow,
        position: dubrae.position.clone(),
        quaternion: dubrae.quaternion.clone(),
      })),
      airforceShoe: this.airforceShoe.map((shoePart) => ({
        mesh: shoePart,
        visible: shoePart.visible,
        castShadow: shoePart.castShadow,
        receiveShadow: shoePart.receiveShadow,
        position: shoePart.position.clone(),
        materialOpacity: shoePart.material?.opacity,
        materialTransparent: shoePart.material?.transparent,
      })),
    };
  },

  restorePdfSnapshotState(state) {
    this.renderer.shadowMap.enabled = state.rendererShadowMapEnabled;

    if (this.dirLight && typeof state.dirLightCastShadow === "boolean") {
      this.dirLight.castShadow = state.dirLightCastShadow;
    }

    if (this.floor) {
      this.floor.visible = state.floorVisible;
      this.floor.receiveShadow = state.floorReceiveShadow;
    }

    state.dubraes.forEach((item) => {
      item.mesh.visible = item.visible;
      item.mesh.castShadow = item.castShadow;
      item.mesh.receiveShadow = item.receiveShadow;
      item.mesh.position.copy(item.position);
      item.mesh.quaternion.copy(item.quaternion);
    });

    state.airforceShoe.forEach((item) => {
      item.mesh.visible = item.visible;
      item.mesh.castShadow = item.castShadow;
      item.mesh.receiveShadow = item.receiveShadow;
      item.mesh.position.copy(item.position);

      if (item.mesh.material) {
        item.mesh.material.opacity = item.materialOpacity;
        item.mesh.material.transparent = item.materialTransparent;
      }
    });

    this.scene.updateMatrixWorld(true);
  },

  prepareDubraesForPdfSnapshot() {
    this.renderer.shadowMap.enabled = true;

    if (this.dirLight) {
      this.dirLight.castShadow = true;
    }

    if (this.floor) {
      this.floor.visible = true;
      this.floor.receiveShadow = true;
    }

    this.airforceShoe.forEach((shoePart) => {
      shoePart.visible = false;
    });

    this.dubraes.forEach((dubrae) => {
      if (!dubrae.userData.originalPosition || !dubrae.userData.originalQuaternion) return;

      dubrae.castShadow = true;
      dubrae.receiveShadow = true;
      dubrae.position.copy(dubrae.userData.originalPosition);
      dubrae.quaternion.copy(dubrae.userData.originalQuaternion);

      if (this.activeModel === "small") {
        dubrae.visible = dubrae.name.includes("Plane_Plane003") || dubrae.name.includes("Plane_Plane004");
      } else {
        dubrae.visible = dubrae.name.includes("Plane_Plane001") || dubrae.name.includes("Plane_Plane002");
      }
    });

    this.scene.updateMatrixWorld(true);
  },

  captureImage() {
    const width = 1000;
    const height = 1000;

    const originalSize = new THREE.Vector2();
    this.renderer.getSize(originalSize);

    const originalPixelRatio = this.renderer.getPixelRatio();
    const snapshotState = this.savePdfSnapshotState();

    this.prepareDubraesForPdfSnapshot();

    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);

    this.snapshotCamera.aspect = width / height;
    this.snapshotCamera.updateProjectionMatrix();

    this.scene.updateMatrixWorld(true);

    const box = new THREE.Box3();

    this.dubraes.forEach((d) => {
      if (d.visible) {
        box.expandByObject(d);
      }
    });

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.snapshotCamera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 1.5;

    this.snapshotCamera.position.set(center.x, center.y, center.z + cameraZ);
    this.snapshotCamera.lookAt(center);

    this.renderer.render(this.scene, this.snapshotCamera);

    const image = this.renderer.domElement.toDataURL("image/png");
    const img = new Image();
    img.src = image;

    const restoreRendererAndScene = () => {
      this.renderer.setPixelRatio(originalPixelRatio);
      this.renderer.setSize(originalSize.x, originalSize.y, false);
      this.restorePdfSnapshotState(snapshotState);
    };

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.rotate(-(Math.PI / 8));

        ctx.font = "bold 210px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText("DUBRAES", 0, 0);

        ctx.restore();

        restoreRendererAndScene();

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        restoreRendererAndScene();
        reject(new Error("Unable to prepare PDF image"));
      };
    });
  },

  async generatePDF() {
    const imageData = await this.captureImage();

    const { PDFDocument, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([600, 800]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 750;

    page.drawText("DUBRAES", {
      x: 50,
      y,
      size: 18,
      font: bold,
    });

    page.drawText(new Date().toLocaleDateString(), {
      x: 450,
      y,
      size: 10,
      font,
    });

    y -= 30;

    page.drawText("PRODUCT CONFIGURATION SUMMARY", {
      x: 50,
      y,
      size: 13,
      font: bold,
    });

    y -= 10;

    page.drawLine({
      start: { x: 50, y },
      end: { x: 550, y },
      thickness: 1,
    });

    y -= 20;

    const pngImage = await pdfDoc.embedPng(imageData);
    const { width, height } = pngImage.scale(0.35);

    page.drawImage(pngImage, {
      x: (600 - width) / 2,
      y: y - height,
      width,
      height,
    });

    y = y - height - 20;

    page.drawLine({
      start: { x: 50, y },
      end: { x: 550, y },
      thickness: 1,
    });

    y -= 20;

    page.drawText("CONFIGURATION DETAILS", {
      x: 50,
      y,
      size: 12,
      font: bold,
    });

    y -= 20;

    const labelX = 50;
    const valueX = 220;

    const data = [
      ["Model", this.capitalizeFirst(this.activeModel)],
      ["Main Color", this.capitalizeFirst(this.activeColor)],
      ["Text", this.activeText],
      ["Font Color", this.activeText !== "N/a" ? this.capitalizeFirst(this.activeTextColorTitle) : "N/a"],
      ["Font Style", this.activeText !== "N/a" ? this.capitalizeFirst(this.activeFont) : "N/a"],
      ["Custom Logo", this.capitalizeFirst(this.activeCustomLogo)],
      ["Design Color", this.customLogoImage ? this.capitalizeFirst(this.activeLogoColor) : "N/a"],
    ];

    data.forEach(([label, value]) => {
      page.drawText(label, { x: labelX, y, size: 11, font: bold });
      page.drawText(String(value), { x: valueX, y, size: 11, font });
      y -= 18;
    });

    y -= 10;

    page.drawLine({
      start: { x: 50, y },
      end: { x: 550, y },
      thickness: 1,
    });

    y -= 20;

    page.drawText("NOTES / TERMS", {
      x: 50,
      y,
      size: 12,
      font: bold,
    });

    y -= 20;

    page.drawText("• This document confirms the selected configuration.", {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 15;

    page.drawText("• Final product may vary slightly from preview.", {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 40;

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  },

  capitalizeFirst(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  downloadPDF(pdfBytes) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "dubrae-config.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  },

  // =========================
  // Calculate Price
  // =========================

  calculatePrice() {
    const price_tag = document.getElementById("price-tag");
    let total = this.price.base;

    if (this.selectedOptions.text && !this.customLogoImage) {
      total = total + this.price.text;
    }

    if (this.customLogoImage && !this.selectedOptions.text) {
      total = total + this.price.logos;
    }

    this.price.current = total;
    price_tag.innerHTML = "$" + this.price.current.toFixed(2);
  },

  // =========================
  // Custom Logos
  // =========================

  customLogo() {
    document.getElementById("fileInput").onchange = (e) => {
      this.hidePesonalizationText();
      this.hideCustomLogo();

      document.getElementById("customText").value = "";
      document.getElementById("noneLogo").classList.remove("active");

      const file = e.target.files[0];
      if (!file) {
        this.activeCustomLogo = "N/a";
        return;
      }

      this.activeCustomLogo = "Yes";
      this.activeLogoColor = this.activeLogoColor === "N/a" ? "Black" : this.activeLogoColor;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const MAX_SIZE = 2056;
          ctx.filter = "blur(0.5px)";

          const scales = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);

          canvas.width = Math.floor(img.width * scales);
          canvas.height = Math.floor(img.height * scales);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const imageDataURL = canvas.toDataURL("image/png");
          this.customLogoImage = imageDataURL;
          
          this.selectedOptions.logos = true; 
          this.calculatePrice(); 

          const texture = new THREE.CanvasTexture(canvas);
          texture.flipY = false;

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

          const grid = [];

          for (let y = 0; y < canvas.height; y++) {
            grid[y] = [];

            const row = y * canvas.width;

            for (let x = 0; x < canvas.width; x++) {
              const alpha = imgData[(row + x) * 4 + 3];

              grid[y][x] = alpha < 20 ? 1 : 0;
            }
          }

          const contours = MarchingSquaresJS.isoContours(grid, 1);

          const shapes = [];
          let currentShape = null;

          contours.forEach((contour) => {
            const path = new THREE.Path();

            contour.forEach((p, i) => {
              const x = p[0];
              const y = p[1];

              const vx = x - canvas.width / 2;
              const vy = canvas.height / 2 - y;

              if (i === 0) path.moveTo(vx, vy);
              else path.lineTo(vx, vy);
            });

            const isHole = THREE.ShapeUtils.isClockWise(path.getPoints());

            if (!isHole) {
              currentShape = new THREE.Shape(path.getPoints());
              shapes.push(currentShape);
            } else if (currentShape) {
              currentShape.holes.push(path);
            }
          });

          const geometry = new THREE.ExtrudeGeometry(shapes, {
            depth: 30,
            bevelEnabled: false,
            UVGenerator: {
              generateTopUV: function (geometry, vertices, indexA, indexB, indexC) {
                const ax = vertices[indexA * 3];
                const ay = vertices[indexA * 3 + 1];

                const bx = vertices[indexB * 3];
                const by = vertices[indexB * 3 + 1];

                const cx = vertices[indexC * 3];
                const cy = vertices[indexC * 3 + 1];

                return [new THREE.Vector2((ax + canvas.width / 2) / canvas.width, 1 - (ay + canvas.height / 2) / canvas.height), new THREE.Vector2((bx + canvas.width / 2) / canvas.width, 1 - (by + canvas.height / 2) / canvas.height), new THREE.Vector2((cx + canvas.width / 2) / canvas.width, 1 - (cy + canvas.height / 2) / canvas.height)];
              },

              generateSideWallUV: function () {
                return [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)];
              },
            },
          });

          geometry.computeBoundingBox();
          const box = geometry.boundingBox;

          const size = new THREE.Vector2(box.max.x - box.min.x, box.max.y - box.min.y);

          const maxDim = Math.max(size.x, size.y);
          const targetSize = 2;
          const scale = targetSize / maxDim;

          geometry.scale(scale, scale, scale);

          this.bendLogoGeometry(geometry, 15);

          const material = [new THREE.MeshStandardMaterial({ color: this.customLogosColor }), new THREE.MeshStandardMaterial({ color: this.customLogosColor })];

          material.forEach((mat) => {
            mat.color.set(this.customLogosColor).convertSRGBToLinear();
          });

          this.customLogosClones = [];

          this.dubraes.forEach((mesh) => {
            if (!mesh.visible) return;

            const logoClone = new THREE.Mesh(geometry.clone(), material);

            const box = new THREE.Box3().setFromObject(mesh);
            const center = new THREE.Vector3();
            box.getCenter(center);

            mesh.worldToLocal(center);

            mesh.add(logoClone);

            logoClone.position.copy(center);
            logoClone.position.x += 0.2;
            logoClone.position.z -= 0;
            logoClone.rotation.x = THREE.MathUtils.degToRad(-90);

            if (this.activeModel === "medium") {
              logoClone.position.y += 0.49;
              logoClone.rotation.z = THREE.MathUtils.degToRad(0);
              logoClone.rotation.y = THREE.MathUtils.degToRad(1);
            } else if (this.activeModel === "small") {
              logoClone.position.y += 0.4;

              logoClone.rotation.y = THREE.MathUtils.degToRad(8);
            }

            this.customLogosClones.push(logoClone);
          });
        };

        img.src = ev.target.result;
      };

      reader.readAsDataURL(file);
    };
  },
  
  bendLogoGeometry(geometry, radius) {
    geometry.computeBoundingBox();

    const bbox = geometry.boundingBox;
    const width = bbox.max.x - bbox.min.x;

    if (!width || width === 0) return;

    const position = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    const totalAngle = width / radius;

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);

      const originalZ = vertex.z;

      const percent = (vertex.x - bbox.min.x) / width;
      const angle = (percent - 0.5) * totalAngle;

      const curvedX = Math.sin(angle) * radius;
      const curvedZ = Math.cos(angle) * radius - radius;

      vertex.x = curvedX;
      vertex.z = curvedZ + originalZ;

      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
  },

  updateLogoSize(scale) {
    if (!this.customLogosClones) return;

    this.customLogosClones.forEach((logo) => {
      logo.scale.set(scale, scale, scale);
    });
  },

  changeShoeColor(color) {
    if (!this.shoe) return;

    this.shoe.traverse((child) => {
      if (!child.isMesh) return;

      if (child.name.includes("Text")) return;

      const apply = (mat) => {
        if (!mat.color) return;

        if (color === "white") {
          mat.color.set(0xBCBCBC).convertSRGBToLinear();
        } else if (color === "black") {
          mat.color.set(0x1D1D1D).convertSRGBToLinear();
        }

        mat.needsUpdate = true;
      };

      if (Array.isArray(child.material)) {
        child.material.forEach(apply);
      } else {
        apply(child.material);
      }
    });

    this.activeShoeColor = color;
  },

  setActiveShoeButton(event) {
    document.querySelectorAll(".shoe-btn").forEach(btn =>
      btn.classList.remove("active")
    );

    event.currentTarget.classList.add("active");
  },

  showSummaryModal() {
    const summaryData = [
      ["Model", this.capitalizeFirst(this.activeModel)],
      ["Main Color", this.capitalizeFirst(this.activeColor)],
      ["Text", this.activeText],
      ["Font Color", this.activeText !== "N/a" ? this.capitalizeFirst(this.activeTextColorTitle) : "N/a"],
      ["Font Style", this.activeText !== "N/a" ? this.capitalizeFirst(this.activeFont) : "N/a"],
      ["Custom Logo", this.capitalizeFirst(this.activeCustomLogo)],
      ["Design Color", this.customLogoImage ? this.capitalizeFirst(this.activeLogoColor) : "N/a"],
    ];

    const summaryTable = document.getElementById("summaryTable");

    summaryTable.innerHTML = summaryData
      .map(([label, value]) => `
        <div class="summary-row">
          <span class="summary-label">${label}</span>
          <span class="summary-value">${value || "N/a"}</span>
        </div>
      `)
      .join("");
  },

  // =========================
  // DOM buttons
  // =========================
  setupUI() {
    const input = document.getElementById("customText");
    const positionBtn = document.getElementById("position-btn");
    const backBtn = document.getElementById("backButton");
    const modelButtons = document.querySelectorAll(".model-btn");
    const noneBtn = document.getElementById("noneLogo");
    const whiteBtn = document.getElementById("shoeWhite");
    const blackBtn = document.getElementById("shoeBlack");
    const fontSizeSlider = document.getElementById("fontSizeSlider");
    const summaryModal = document.getElementById("summaryModal");
    const closeSummary = document.getElementById("closeSummary");

    if (input) {
      input.addEventListener("input", (e) => {
        this.addText3D(e.target.value);
      });
    }

    modelButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeModel = btn.dataset.model;

        const model = btn.dataset.model;
        this.hideModel(model);
        this.hidePesonalizationText();
        this.hideCustomLogo();
        
        document.getElementById("customText").value = "";

        modelButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    noneBtn.addEventListener("click", () => {
      this.hideCustomLogo();
    });

    positionBtn.addEventListener("click", () => {
      this.positionButton();
      positionBtn.classList.add("hidden");
    });

    backBtn.addEventListener("click", () => {
      this.backButton();
      positionBtn.classList.remove("hidden");
    });

    whiteBtn.addEventListener("click", (e) => {
      this.changeShoeColor("white");
      this.setActiveShoeButton(e);
    });

    blackBtn.addEventListener("click", (e) => {
      this.changeShoeColor("black");
      this.setActiveShoeButton(e);
    });

    document.getElementById("summaryBtn").addEventListener("click", () => {
      this.showSummaryModal();
      summaryModal.classList.add("active");
    });

    closeSummary.addEventListener("click", () => {
      summaryModal.classList.remove("active");
    });

    document.getElementById("summaryModal").addEventListener("click", (e) => {
      if (e.target.id === "summaryModal") {
        summaryModal.classList.remove("active");
      }
    });

    if (fontSizeSlider) {
      fontSizeSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);

        this.activeFontSize = value;
     
        if (this.activeText && this.activeText !== "N/a") {
          this.addText3D(this.activeText);
        }
      });
    }
  },

  positionButton() {
    this.positionShoe();
  },

  backButton() {
    this.backShoe();
  },

  // =========================
  // Position Camera into the shoe
  // =========================

  positionShoe() {
    const isMobile = window.innerWidth < 992;

    this.renderer.shadowMap.enabled = false;

    if (this.dirLight) {
      this.dirLight.castShadow = false;
    }

    if (this.floor) {
      this.floor.visible = false;
      this.floor.receiveShadow = false;
    }

    this.dubraes.forEach((dubrae) => {
      dubrae.castShadow = false;
      dubrae.receiveShadow = false;
    });

    this.airforceShoe.forEach((shoePart) => {
      shoePart.castShadow = false;
      shoePart.receiveShadow = false;
    });

    if (isMobile) {
      this.renderer.shadowMap.enabled = false;
    }

    const box = new THREE.Box3().setFromObject(this.shoe);
    const center = box.getCenter(new THREE.Vector3());

    this.cameraStates.preview = {
      position: center.clone().add(new THREE.Vector3(40, 20, 30)),
      target: center.clone(),
    };

    this.goToCameraState("preview");

    const product = document.querySelector("#productOptionsAccordion");
    const summary = document.querySelector("#summaryOptionsAccordion");

    product.classList.add("fade-out");

    this.airforceShoe.forEach((child) => {
      child.castShadow = false;
      child.receiveShadow = false;

      if (child.name.includes("airforce")) {
        gsap.killTweensOf(child.position);

        child.visible = true;

        if (!child.userData.originalPosition) return;

        child.position.copy(child.userData.originalPosition);

        gsap.to(child.position, {
          y: child.userData.originalPosition.y,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      if (child.name.includes("Text")) {
        child.visible = !isMobile;
      }

      if (child.name.includes("airforce_shoe") && child.material) {
        child.material.transparent = true;
        child.material.opacity = isMobile ? 0.85 : 0.6;
      }
    });

    document.querySelector(".icon-container").classList.add("hidden");

    setTimeout(() => {
      product.classList.add("hidden");
      product.classList.remove("fade-out");

      summary.classList.remove("hidden");

      requestAnimationFrame(() => {
        summary.classList.remove("fade-out");

        const targetShoe = this.airforceShoe.find((child) => child.name.includes("airforce"));

        if (!targetShoe) return;

        this.dubraes.forEach((dubrae) => {
          dubrae.castShadow = false;
          dubrae.receiveShadow = false;
        });

        if (this.activeModel === "small") {
          this.dubraes
            .filter((d) => d.name === "Plane_Plane003" || d.name === "Plane_Plane004")
            .forEach((dubrae) => {
              const world = new THREE.Vector3();
              dubrae.getWorldPosition(world);
              dubrae.visible = true;

              const worldPos = new THREE.Vector3();
              targetShoe.getWorldPosition(worldPos);

              const localPos = worldPos.clone();
              dubrae.parent.worldToLocal(localPos);

              dubrae.position.copy(localPos);

              if (dubrae.name === "Plane_Plane003") {
                dubrae.position.x += 18.6;
                dubrae.position.y += 2.4;
                dubrae.position.z += 3.5;
                dubrae.rotation.set(THREE.MathUtils.degToRad(70), THREE.MathUtils.degToRad(18), THREE.MathUtils.degToRad(-67));
              }
              if (dubrae.name === "Plane_Plane004") {
                dubrae.position.x += 24.5;
                dubrae.position.y += -3.3;
                dubrae.position.z += -18;
                dubrae.rotation.set(THREE.MathUtils.degToRad(55), THREE.MathUtils.degToRad(6), THREE.MathUtils.degToRad(-57));
              }
            });
        } else {
          this.dubraes
            .filter((d) => d.name === "Plane_Plane001" || d.name === "Plane_Plane002")
            .forEach((dubrae) => {
              const world = new THREE.Vector3();
              dubrae.getWorldPosition(world);

              dubrae.visible = true;

              const worldPos = new THREE.Vector3();
              targetShoe.getWorldPosition(worldPos);

              const localPos = worldPos.clone();
              dubrae.parent.worldToLocal(localPos);

              dubrae.position.copy(localPos);

              if (dubrae.name === "Plane_Plane001") {
                dubrae.position.x += 11.4;
                dubrae.position.y += 15.3;
                dubrae.position.z += 3.9;

                dubrae.quaternion.set(0.1665, 0.5555, -0.1248, 0.8051).normalize();
              } else if (dubrae.name === "Plane_Plane002") {
                dubrae.position.x += 19.6;
                dubrae.position.y += 15.2;
                dubrae.position.z += -17.8;

                dubrae.quaternion.set(0.2133, 0.3955, -0.095, 0.8883);
              }
            });
        }
      });
    }, 600);
  },

  // =========================
  // Position Camera into the Dubrae
  // =========================

  backShoe() {
    this.goToCameraState("default");

    const product = document.querySelector("#productOptionsAccordion");
    const summary = document.querySelector("#summaryOptionsAccordion");
    const dubraesContainer = document.getElementById("dubraesOnly");

    summary.classList.add("fade-out");

    this.renderer.shadowMap.enabled = true;

    if (this.dirLight) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.needsUpdate = true;
    }

    if (this.floor) {
      this.floor.visible = true;
      this.floor.receiveShadow = true;
    }

    this.dubraes.forEach((child) => {
      if (!child.userData.originalPosition || !child.userData.originalQuaternion) return;

      child.castShadow = true;
      child.receiveShadow = true;

      child.position.copy(child.userData.originalPosition);
      child.quaternion.copy(child.userData.originalQuaternion);

      if (this.activeModel === "small") {
        if (child.name.includes("Plane_Plane003") || child.name.includes("Plane_Plane004")) {
          child.visible = true;
        }
      } else {
        if (child.name.includes("Plane_Plane001") || child.name.includes("Plane_Plane002")) {
          child.visible = true;
        }
      }
    });

    document.querySelector(".icon-container").classList.remove("hidden");

    setTimeout(() => {
      summary.classList.add("hidden");
      summary.classList.remove("fade-out");

      product.classList.remove("hidden");

      requestAnimationFrame(() => {
        product.classList.remove("fade-out");

        dubraesContainer.classList.remove("hidden");
      });
    }, 600);

this.airforceShoe.forEach((child) => {
  if (child.name.includes("airforce")) {
    gsap.killTweensOf(child.position);

    gsap.to(child.position, {
      x: child.userData.originalPosition.x,
      y: child.userData.originalPosition.y,
      z: child.userData.originalPosition.z,
      duration: 0.6,
      ease: "power2.out",

      onComplete: () => {
        child.visible = false;

        // hide all Text after airforce animation completes
        this.airforceShoe.forEach((item) => {
          if (item.name.includes("Text")) {
            item.visible = false;
          }
        });
      },
    });
  }
});
  },

  // =========================
  // RESIZE
  // =========================
  onResize() {
    const isMobile = window.innerWidth < 992 || window.innerHeight < 430;

    this.viewport_width = isMobile ? 0 : 500;
    this.viewport_height = window.innerWidth < 992 ? 2 : 1;

    const width = window.innerWidth - this.viewport_width;
    const height = window.innerHeight / this.viewport_height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    const btn = document.querySelector(".icon-container");
    btn.style.right = this.viewport_width + 20 + "px";
  },

  // =========================
  // ANIMATION LOOP
  // =========================
  animate() {
    requestAnimationFrame(() => this.animate());

    const target = this.controls.target;
    this.controls.update();

    this.controls2.target.set(target.x, target.y, target.z);
    this.controls2.update();

    if (this.isMoving) {
      this.controls.target.lerp(this.targetPosition, 0.1);

      if (this.controls.target.distanceTo(this.targetPosition) < 0.01) {
        this.isMoving = false;
      }
    }

    this.renderer.render(this.scene, this.camera);
  },
};

// START
document.addEventListener("DOMContentLoaded", () => {
  DubraeApp.init();
});
