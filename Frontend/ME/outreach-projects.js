const carousel = document.querySelector(".image-carousel");

if (carousel) {
  const image = carousel.querySelector(".carousel-image");
  const viewerContainer = carousel.querySelector("[data-3d-viewer]");
  const viewerStatus = viewerContainer.querySelector(".model-viewer-status");
  const indicators = Array.from(
    carousel.querySelectorAll(".carousel-indicators button"),
  );
  const images = [
    {
      src: "ME/media/penn-holder-1-black-background.png",
      alt: "Penn Holder, viewed from the side",
    },
    {
      src: "ME/media/penn-holder-2-black-background.png",
      alt: "Penn Holder, viewed from an angle",
    },
    {
      src: "ME/media/penn-holder-3-black-background.png",
      alt: "Penn Holder, viewed from behind",
    },
    {
      src: "ME/media/penn-holder-4-black-background.png",
      alt: "Penn Holder, viewed from the top",
    },
  ];
  let activeImageIndex = 0;
  let renderer;
  let camera;
  let controls;
  let scene;
  let resizeObserver;
  let viewerPromise;

  function showImage(index) {
    const slideCount = images.length + 1;
    activeImageIndex = (index + slideCount) % slideCount;
    const isViewerSlide = activeImageIndex === images.length;

    image.hidden = isViewerSlide;
    viewerContainer.hidden = !isViewerSlide;
    if (!isViewerSlide) {
      image.src = images[activeImageIndex].src;
      image.alt = images[activeImageIndex].alt;
    }

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === activeImageIndex;
      indicator.classList.toggle("active", isActive);
      if (isActive) {
        indicator.setAttribute("aria-current", "true");
      } else {
        indicator.removeAttribute("aria-current");
      }
    });

    if (isViewerSlide) {
      loadViewer();
    } else if (renderer) {
      renderer.setAnimationLoop(null);
    }
  }

  const downloadTermsDialog = document.querySelector(
    "[data-download-terms-dialog]",
  );
  const downloadTermsCheckbox = document.querySelector(
    "[data-agree-to-download-terms]",
  );
  const continueDownloadButton = document.querySelector(
    "[data-continue-download]",
  );
  const downloadFileLink = document.querySelector("[data-download-file]");

  if (
    downloadTermsDialog instanceof HTMLDialogElement &&
    downloadTermsCheckbox instanceof HTMLInputElement &&
    continueDownloadButton instanceof HTMLButtonElement &&
    downloadFileLink instanceof HTMLAnchorElement
  ) {
    document
      .querySelector("[data-open-download-terms]")
      ?.addEventListener("click", () => downloadTermsDialog.showModal());

    downloadTermsCheckbox.addEventListener("change", () => {
      continueDownloadButton.disabled = !downloadTermsCheckbox.checked;
    });

    document
      .querySelector("[data-cancel-download]")
      ?.addEventListener("click", () => downloadTermsDialog.close("cancel"));

    continueDownloadButton.addEventListener("click", () => {
      if (downloadTermsCheckbox.checked) {
        downloadTermsDialog.close("continue");
      }
    });

    downloadTermsDialog.addEventListener("close", () => {
      if (
        downloadTermsDialog.returnValue === "continue" &&
        downloadTermsCheckbox.checked
      ) {
        downloadFileLink.click();
      }

      downloadTermsCheckbox.checked = false;
      continueDownloadButton.disabled = true;
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

  carousel
    .closest(".tool-card")
    .querySelector("[data-show-3d-model]")
    .addEventListener("click", () => showImage(images.length));

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
    const [THREE, { ThreeMFLoader }, { OrbitControls }] = await Promise.all([
      import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"),
      import(
        "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/3MFLoader.js"
      ),
      import(
        "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js"
      ),
    ]);

    const response = await fetch("ME/media/Pen%20Holder%20Silas.3mf", {
      cache: "no-cache",
    });
    if (!response.ok) {
      throw new Error(`Unable to load the 3MF file (${response.status}).`);
    }

    const model = new ThreeMFLoader().parse(await response.arrayBuffer());
    model.rotation.x = -Math.PI / 2;
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);

    if (!Number.isFinite(largestDimension) || largestDimension === 0) {
      throw new Error("The 3MF file does not contain a valid 3D model.");
    }

    const center = bounds.getCenter(new THREE.Vector3());
    const modelScale = 2 / largestDimension;
    model.scale.setScalar(modelScale);
    model.position.set(
      -center.x * modelScale,
      -center.y * modelScale,
      -center.z * modelScale,
    );

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202a37);

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.5);
    camera.lookAt(0, 0, 0);

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

    scene.add(model);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 8;
    controls.update();

    resizeObserver = new ResizeObserver(resizeViewer);
    resizeObserver.observe(viewerContainer);
    resizeViewer();
    viewerStatus.remove();
  }

  async function loadViewer() {
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
        console.error("Unable to load the Penn Holder 3D viewer.", error);
        viewerStatus.textContent =
          "The 3D model could not be loaded. Check your connection and try again.";
        return;
      }
    }

    if (activeImageIndex === images.length) {
      renderer.setAnimationLoop(renderFrame);
    }
  }
}
