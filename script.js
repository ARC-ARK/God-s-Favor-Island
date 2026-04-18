const locations = [
  {
    id: "forest",
    eyebrow: "目標位置",
    title: "原始森林",
    image: "./assets/forest.png",
    thumbnail: "./assets/forest.png",
    description: "潮濕林蔭與古老樹冠交疊，是神眷島最原始的入口。",
    distance: "270.1",
    heading: "324° NN",
    pin: { x: 33, y: 30 },
    camera: { scale: 1.08 },
  },
  {
    id: "village",
    eyebrow: "熱點",
    title: "原住民部落",
    image: "./assets/village.png",
    thumbnail: "./assets/village.png",
    description: "沿火光與木屋聚落前進，可觀察島民生活的核心區域。",
    distance: "184.3",
    heading: "072° EN",
    pin: { x: 74, y: 56 },
    camera: { scale: 1.06 },
  },
  {
    id: "ritual",
    eyebrow: "祭場",
    title: "祭祀場地",
    image: "./assets/ritual-site.png",
    thumbnail: "./assets/ritual-site.png",
    description: "石階與祭壇位於島嶼高處，是觀測儀式軌跡的主要節點。",
    distance: "96.8",
    heading: "018° NE",
    pin: { x: 54, y: 43 },
    camera: { scale: 1.05 },
  },
  {
    id: "coastline",
    eyebrow: "邊界",
    title: "海岸線",
    image: "./assets/coastline.png",
    thumbnail: "./assets/coastline.png",
    description: "海霧與礁岩形成天然邊界，適合觀測潮汐與星光。",
    distance: "312.5",
    heading: "241° SW",
    pin: { x: 24, y: 71 },
    camera: { scale: 1.04 },
  },
];

const appShell = document.querySelector("#appShell");
const pinLayer = document.querySelector("#pinLayer");
const distanceValue = document.querySelector("#distanceValue");
const headingValue = document.querySelector("#headingValue");
const activeEyebrow = document.querySelector("#activeEyebrow");
const activeTitle = document.querySelector("#activeTitle");
const panelEyebrow = document.querySelector("#panelEyebrow");
const panelTitle = document.querySelector("#panelTitle");
const panelDescription = document.querySelector("#panelDescription");
const sceneLayers = Array.from(document.querySelectorAll(".scene__layer"));

const locationMap = new Map(locations.map((location) => [location.id, location]));
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  activeId: "",
  layerIndex: 0,
  travelTimers: [],
};

function preloadImages() {
  locations.forEach((location) => {
    const image = new Image();
    image.src = location.image;
  });
}

function getLocationFromHash() {
  const hash = window.location.hash.replace(/^#/, "").trim();
  return locationMap.has(hash) ? hash : locations[0].id;
}

function syncHash(id) {
  const nextHash = `#${id}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(null, "", nextHash);
  }
}

function renderPins() {
  const pins = locations.map((location) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hud-pin";
    button.dataset.locationId = location.id;
    button.setAttribute("aria-label", `聚焦${location.title}`);
    button.style.setProperty("--x", location.pin.x);
    button.style.setProperty("--y", location.pin.y);
    button.innerHTML = `
      <span class="hud-pin__core" aria-hidden="true"></span>
      <span class="hud-pin__label">${location.title}</span>
    `;
    button.addEventListener("click", () => setActiveLocation(location.id, { animate: true }));
    return button;
  });

  pinLayer.replaceChildren(...pins);
}

function applyScene(location) {
  const nextIndex = state.layerIndex === 0 ? 1 : 0;
  const nextLayer = sceneLayers[nextIndex];
  const currentLayer = sceneLayers[state.layerIndex];

  nextLayer.style.backgroundImage = `url("${location.image}")`;
  nextLayer.style.setProperty("--scene-scale", location.camera.scale.toFixed(2));
  nextLayer.classList.add("is-active");
  currentLayer.classList.remove("is-active");
  state.layerIndex = nextIndex;
}

function updateUI(location) {
  state.activeId = location.id;
  distanceValue.textContent = location.distance;
  headingValue.textContent = location.heading;
  activeEyebrow.textContent = location.eyebrow;
  activeTitle.textContent = location.title;
  panelEyebrow.textContent = location.eyebrow;
  panelTitle.textContent = location.title;
  panelDescription.textContent = location.description;

  pinLayer.querySelectorAll(".hud-pin").forEach((pin) => {
    const isActive = pin.dataset.locationId === location.id;
    pin.dataset.active = String(isActive);
    pin.setAttribute("aria-pressed", String(isActive));
  });

  syncHash(location.id);
}

function clearTravelTimers() {
  state.travelTimers.forEach((timer) => window.clearTimeout(timer));
  state.travelTimers = [];
}

function setActiveLocation(id, options = {}) {
  const location = locationMap.get(id) ?? locations[0];
  const isSameLocation = state.activeId === location.id;
  const shouldAnimate =
    options.animate &&
    !reducedMotionQuery.matches &&
    Boolean(state.activeId) &&
    !isSameLocation;

  clearTravelTimers();

  if (shouldAnimate) {
    appShell.classList.add("is-traveling");

    const swapTimer = window.setTimeout(() => {
      applyScene(location);
      updateUI(location);
    }, 220);

    const endTimer = window.setTimeout(() => {
      appShell.classList.remove("is-traveling");
    }, 680);

    state.travelTimers.push(swapTimer, endTimer);
    return;
  }

  appShell.classList.remove("is-traveling");
  applyScene(location);
  updateUI(location);
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    setActiveLocation(getLocationFromHash(), { animate: false });
  });

  reducedMotionQuery.addEventListener?.("change", () => {
    appShell.classList.remove("is-traveling");
  });
}

function init() {
  preloadImages();
  renderPins();
  bindEvents();
  setActiveLocation(getLocationFromHash(), { animate: false });
}

init();
