const carousel = document.querySelector(".image-carousel");

if (carousel) {
  const image = carousel.querySelector(".carousel-image");
  const indicators = Array.from(
    carousel.querySelectorAll(".carousel-indicators button"),
  );
  const images = [
    {
      src: "ME/media/unnamed.png",
      alt: "Penn Holder, viewed from the side",
    },
    {
      src: "ME/media/unnamed%20(1).png",
      alt: "Penn Holder, viewed from an angle",
    },
  ];
  let activeImageIndex = 0;

  function showImage(index) {
    activeImageIndex = (index + images.length) % images.length;
    image.src = images[activeImageIndex].src;
    image.alt = images[activeImageIndex].alt;

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === activeImageIndex;
      indicator.classList.toggle("active", isActive);
      if (isActive) {
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });
  }

  carousel
    .querySelector(".carousel-control.previous")
    .addEventListener("click", () => showImage(activeImageIndex - 1));
  carousel
    .querySelector(".carousel-control.next")
    .addEventListener("click", () => showImage(activeImageIndex + 1));

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => showImage(index));
  });
}

const stlDialog = document.querySelector(".stl-dialog");
const viewerContainer = stlDialog.querySelector("[data-stl-viewer]");
const viewerStatus = viewerContainer.querySelector(".stl-viewer-status");
let renderer;
let camera;
let controls;
let scene;
let resizeObserver;
let viewerPromise;

function resizeViewer() {
  if (!renderer) {
    return;
  }

  const { width, height } = viewerContainer.getBoundingClientRect();
  if (width === 0 || height === 0) {
    return;
  }

  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function renderFrame() {
  controls.update();
  renderer.render(scene, camera);
}

async function initializeViewer() {
  const [THREE, { STLLoader }, { OrbitControls }] = await Promise.all([
    import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"),
    import(
      "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/STLLoader.js"
    ),
    import(
      "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js"
    ),
  ]);

  const response = await fetch("ME/media/penn-holder.stl");
  if (!response.ok) {
    throw new Error(`Unable to load the STL file (${response.status}).`);
  }

  const geometry = new STLLoader().parse(await response.arrayBuffer());
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox;
  const size = bounds.getSize(new THREE.Vector3());
  const largestDimension = Math.max(size.x, size.y, size.z);

  if (!Number.isFinite(largestDimension) || largestDimension === 0) {
    throw new Error("The STL file does not contain a valid 3D model.");
  }

  const center = bounds.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  geometry.scale(
    2 / largestDimension,
    2 / largestDimension,
    2 / largestDimension,
  );
  geometry.computeVertexNormals();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202a37);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive 3D model of the Penn Holder",
  );
  viewerContainer.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444455, 2));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const model = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.2,
      roughness: 0.55,
    }),
  );
  scene.add(model);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 1.5;
  controls.maxDistance = 8;

  resizeObserver = new ResizeObserver(resizeViewer);
  resizeObserver.observe(viewerContainer);
  resizeViewer();
  viewerStatus.remove();
}

document.querySelector("[data-open-stl]").addEventListener("click", async () => {
  stlDialog.showModal();

  if (!renderer) {
    viewerStatus.textContent = "Loading 3D model…";
    try {
      viewerPromise ??= initializeViewer();
      await viewerPromise;
    } catch (error) {
      viewerPromise = undefined;
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = undefined;
      }
      if (controls) {
        controls.dispose();
        controls = undefined;
      }
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
        renderer = undefined;
      }
      console.error("Unable to open the Penn Holder 3D viewer.", error);
      viewerStatus.textContent =
        "The 3D model could not be loaded. Check your connection and try again.";
      return;
    }
  }

  if (stlDialog.open) {
    renderer.setAnimationLoop(renderFrame);
  }
});

stlDialog
  .querySelector(".stl-dialog-close")
  .addEventListener("click", () => stlDialog.close());

stlDialog.addEventListener("click", (event) => {
  if (event.target === stlDialog) {
    stlDialog.close();
  }
});

stlDialog.addEventListener("close", () => {
  if (renderer) {
    renderer.setAnimationLoop(null);
  }
});
