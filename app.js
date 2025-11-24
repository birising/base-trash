const dataBaseUrl = window.DATA_BASE_URL || "./data";

const fallbackKose = [
  {
    lat: 50.130144,
    lng: 14.219936,
    name: "Koš plný",
    description: null,
    category: "kos",
    fillLevel: 92,
    lastUpdated: "2024-05-12 08:15",
    batteryLevel: 34,
  },
  {
    lat: 50.128687,
    lng: 14.221423,
    name: "Koš",
    description: null,
    category: "kos",
    fillLevel: 38,
    lastUpdated: "2024-05-12 09:02",
    batteryLevel: 78,
  },
  {
    lat: 50.129602,
    lng: 14.221984,
    name: "Koš",
    description: null,
    category: "kos",
    fillLevel: 56,
    lastUpdated: "2024-05-11 18:41",
    batteryLevel: 82,
  },
  {
    lat: 50.132469,
    lng: 14.220607,
    name: "Koš",
    description: null,
    category: "kos",
    fillLevel: 21,
    lastUpdated: "2024-05-12 06:58",
    batteryLevel: 64,
  },
  {
    lat: 50.132801,
    lng: 14.220461,
    name: "Koš",
    description: null,
    category: "kos",
    fillLevel: 49,
    lastUpdated: "2024-05-11 22:16",
    batteryLevel: 59,
  },
  {
    lat: 50.133472,
    lng: 14.225753,
    name: "Koš",
    description: null,
    category: "kos",
    fillLevel: 73,
    lastUpdated: "2024-05-12 07:45",
    batteryLevel: 41,
  },
  {
    lat: 50.132557,
    lng: 14.220691,
    name: "Koš",
    description: null,
    category: "kos",
    fillLevel: 12,
    lastUpdated: "2024-05-12 08:55",
    batteryLevel: 91,
  },
];

const fallbackKontejnery = [
  { lat: 50.132911, lng: 14.224212, name: "Zimni udrzba", description: null, category: "zimni_udrzba" },
  { lat: 50.132602, lng: 14.224192, name: "Zimni udrzba", description: null, category: "zimni_udrzba" },
  { lat: 50.130817, lng: 14.221791, name: "Zimni udrba", description: null, category: "zimni_udrzba" },
  { lat: 50.132204, lng: 14.222392, name: "Zimni idezba", description: null, category: "zimni_udrzba" },
];

const fallbackLampy = [
  { lat: 50.133935, lng: 14.222031, name: "Rozbita lampa", description: null, category: "lampy" },
  { lat: 50.132683, lng: 14.22153, name: "Rozbita", description: null, category: "lampy" },
  { lat: 50.130526, lng: 14.220269, name: "Lampa rozbita", description: null, category: "lampy" },
  { lat: 50.132075, lng: 14.225998, name: "Lampa rozbita", description: null, category: "lampy" },
  { lat: 50.130589, lng: 14.221878, name: "Lampa 15", description: null, category: "lampy" },
  { lat: 50.130105, lng: 14.222052, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.131003, lng: 14.221204, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.13117, lng: 14.220722, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.130949, lng: 14.220521, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.130093, lng: 14.219836, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.129781, lng: 14.219071, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.131421, lng: 14.220844, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132316, lng: 14.220784, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132836, lng: 14.220645, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133054, lng: 14.220365, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133314, lng: 14.21992, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133076, lng: 14.219179, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133666, lng: 14.220194, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133295, lng: 14.221099, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133599, lng: 14.221485, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133897, lng: 14.221747, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132773, lng: 14.221132, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132649, lng: 14.22213, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132459, lng: 14.222365, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132207, lng: 14.222406, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132609, lng: 14.222559, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132825, lng: 14.222919, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133015, lng: 14.223248, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.13304, lng: 14.223699, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132968, lng: 14.2241, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133074, lng: 14.224404, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133565, lng: 14.224416, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133423, lng: 14.224041, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.133372, lng: 14.224993, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132633, lng: 14.224092, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132452, lng: 14.223862, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132232, lng: 14.224346, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132147, lng: 14.225015, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132281, lng: 14.223662, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132101, lng: 14.222946, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.132001, lng: 14.222607, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.131776, lng: 14.22183, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.131564, lng: 14.221154, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.131401, lng: 14.22157, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.131108, lng: 14.221686, name: "Lampa", description: null, category: "lampy" },
  { lat: 50.130743, lng: 14.220386, name: "lampa", description: null, category: "lampy" },
];

const fallbackZelene = [
  {
    name: "Park Na Stráni",
    description: "Tráva a okraje",
    category: "zelen",
    lastMowed: "2024-05-08 14:20",
    frequency: "1× za 2 týdny",
    coords: [
      [50.1337, 14.2211],
      [50.1336, 14.2222],
      [50.1331, 14.2223],
      [50.1332, 14.2210],
    ],
  },
  {
    name: "Alej U Potoka",
    description: "Tráva + keře",
    category: "zelen",
    lastMowed: "2024-05-03 09:45",
    frequency: "1× měsíčně",
    coords: [
      [50.1319, 14.2230],
      [50.1316, 14.2242],
      [50.1310, 14.2239],
      [50.1314, 14.2227],
    ],
  },
  {
    name: "Náves Běloky",
    description: "Centrální plocha",
    category: "zelen",
    lastMowed: "2024-05-10 07:30",
    frequency: "Každý týden",
    coords: [
      [50.1328, 14.2205],
      [50.1326, 14.2212],
      [50.1322, 14.2210],
      [50.1324, 14.2203],
    ],
  },
];

let dataKose = [];
let dataKontejnery = [];
let dataLampy = [];
let dataZelene = [];

const dataHladina = [
  {
    lat: 50.1309,
    lng: 14.2227,
    name: "Senzor hladiny potoka",
    description: "Běloky – úroveň vody",
    category: "hladina",
    sensorId: 24470,
  },
];

const wasteSchedule = {
  frequency: "Každých 14 dní",
  lastPickup: "17.11.2025",
  intervalDays: 14,
  contactEmail: "info@beloky.cz",
};

// Primární zdroj hladiny a seznam záložních adres (kvůli CORS a mixovanému obsahu na GitHub Pages).
const streamSourceUrl = "http://hladiny-vox.pwsplus.eu/Senzors/Details/24470";
const streamFetchCandidates = [
  // Bez-CORS proxy vracející čistý HTML obsah
  `https://api.allorigins.win/raw?url=${encodeURIComponent(streamSourceUrl)}`,
  // Textový snapshot (markdown) vhodný pro čtení regexem, pokud HTML nejde načíst
  `https://r.jina.ai/${streamSourceUrl}`,
  `https://r.jina.ai/${streamSourceUrl.replace("http://", "https://")}`,
  `https://cors.isomorphic-git.org/${streamSourceUrl}`,
  `https://cors.isomorphic-git.org/${streamSourceUrl.replace("http://", "https://")}`,
  streamSourceUrl.replace("http://", "https://"),
  streamSourceUrl,
];
const floodThresholds = [
  { label: "SPA 1", value: 90, color: "#22c55e" },
  { label: "SPA 2", value: 100, color: "#facc15" },
  { label: "SPA 3", value: 120, color: "#f97316" },
];
function buildHistory(hours = 72, start = 38, variance = 4) {
  const history = [];
  for (let i = 0; i < hours; i += 1) {
    const wave = Math.sin(i / 8) * 1.5;
    const drift = i * 0.02;
    const micro = Math.cos(i / 5) * 0.8;
    const swing = ((i % 12) / 12) * (variance * 0.6);
    const value = Math.max(24, Math.round((start + wave + drift + micro + swing) * 10) / 10);
    history.push(value);
  }
  return history;
}

let streamHistory = buildHistory();
const streamState = {
  level: `${streamHistory.at(-1)} cm`,
  updated: "Základní údaje",
  numeric: streamHistory.at(-1),
  status: "Načítám…",
};

async function loadDataset(name, fallback = []) {
  const url = `${dataBaseUrl}/${name}.json`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload) ? payload : fallback;
  } catch (error) {
    console.warn(`Nepodařilo se načíst dataset ${name} (${url})`, error);
    return fallback;
  }
}

async function loadAllData() {
  const [kose, lampy, kontejnery, zelene] = await Promise.all([
    loadDataset("kose", fallbackKose),
    loadDataset("lampy", fallbackLampy),
    loadDataset("kontejnery", fallbackKontejnery),
    loadDataset("zelene", fallbackZelene),
  ]);

  dataKose = kose;
  dataLampy = lampy;
  dataKontejnery = kontejnery;
  dataZelene = zelene;
}

function showMapError(message) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;
  mapContainer.innerHTML = `<div class="map-error">${message}</div>`;
}

window.addEventListener("DOMContentLoaded", async () => {
  if (!window.L) {
    showMapError("Mapový modul se nepodařilo načíst. Zkuste obnovit stránku.");
    return;
  }

  await loadAllData();

  const map = L.map("map", {
    zoomControl: false,
    attributionControl: false,
  });

  const baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap přispěvatelé",
  });
  baseLayer.addTo(map);

  const toolbarZoom = L.control.zoom({ position: "topright" });
  toolbarZoom.addTo(map);

  const defaultView = [50.1322, 14.222];
  map.setView(defaultView, 16);

  map.whenReady(() => refreshMapSize(0));

  function refreshMapSize(delay = 120) {
    setTimeout(() => map.invalidateSize(), delay);
  }

  const iconColors = {
    kose: "#1b8a63",
    lampy: "#f28c38",
    kontejnery: "#4ab7ff",
    zelen: "#7dd3fc",
    hladina: "#7c3aed",
    odpad: "#67e8f9",
  };

  const iconSymbols = {
    kose: { emoji: "🗑️", label: "Koš" },
    lampy: { emoji: "💡", label: "Lampa" },
  };

  const iconSizes = {
    kose: { size: [42, 46], anchor: [21, 44], popup: [0, -34] },
    lampy: { size: [26, 30], anchor: [13, 28], popup: [0, -24] },
  };

  const layers = {
    kose: L.layerGroup(),
    lampy: L.layerGroup(),
    kontejnery: L.layerGroup(),
    zelen: L.layerGroup(),
    hladina: L.layerGroup(),
    odpad: L.layerGroup(),
  };

  const counters = {
    kose: document.getElementById("countKose"),
    lampy: document.getElementById("countLampy"),
    kontejnery: document.getElementById("countKontejnery"),
    zelen: document.getElementById("countZelen"),
    hladina: document.getElementById("countHladina"),
    odpad: document.getElementById("countOdpad"),
  };

  const zelenSummary = document.getElementById("zelenSummary");

  const levelReading = document.getElementById("levelReading");
  const streamLevelEl = document.getElementById("streamLevel");
  const streamUpdatedEl = document.getElementById("streamUpdated");
  const streamStatusEl = document.getElementById("streamStatus");
  const nextPickupDateEl = document.getElementById("nextPickupDate");
  const nextPickupCountdownEl = document.getElementById("nextPickupCountdown");
  const nextPickupLabelEl = document.getElementById("nextPickupLabel");
  const lastPickupLabelEl = document.getElementById("lastPickupLabel");
  const upcomingPickupsEl = document.getElementById("upcomingPickups");
  const nextPickupSummaryEl = document.getElementById("nextPickupSummary");

  const categoryLabel = document.getElementById("activeCategoryLabel");
  const mapOverlay = document.getElementById("mapOverlay");
  const mapView = document.getElementById("mapView");
  const streamView = document.getElementById("streamView");
  const wasteView = document.getElementById("wasteView");

  const mapCategories = ["kose", "lampy", "kontejnery", "zelen"];

  function parsePickupDate(dateStr) {
    const parts = dateStr.split(".").filter(Boolean);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const now = new Date();
    const year = parts[2] ? parseInt(parts[2], 10) : now.getFullYear();
    const parsed = new Date(year, month, day);
    if (!parts[2] && parsed > now) parsed.setFullYear(year - 1);
    return parsed;
  }

  function getNextPickupDate(lastDate, intervalDays = 14, reference = new Date()) {
    const next = new Date(lastDate);
    next.setHours(0, 0, 0, 0);
    next.setDate(next.getDate() + intervalDays);

    const ref = new Date(reference);
    ref.setHours(0, 0, 0, 0);

    while (next <= ref) {
      next.setDate(next.getDate() + intervalDays);
    }

    return next;
  }

  function formatDate(date) {
    return date.toLocaleDateString("cs-CZ", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatCountdown(target) {
    const now = new Date();
    const diffMs = target - now;
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    if (days === 0) return "Dnes";
    if (days === 1) return "Zítra";
    return `Za ${days} dny`;
  }

  function buildUpcomingPickups(startDate, count = 4, intervalDays = 14) {
    const list = [];
    for (let i = 0; i < count; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * intervalDays);
      list.push(date);
    }
    return list;
  }

  function renderStreamChart(latestValue = null) {
    const chart = document.getElementById("levelChart");
    if (!chart) return;

    const series = [...streamHistory];
    const normalizedLatest = latestValue != null ? latestValue : streamState.numeric;
    if (normalizedLatest != null) {
      series.push(normalizedLatest);
    }

    while (series.length > 72) series.shift();

    const width = 720;
    const height = 320;
    const paddingLeft = 44;
    const paddingRight = 92;
    const paddingY = 36;

    const thresholdValues = floodThresholds.map((t) => t.value);
    const minVal = Math.min(...series, ...thresholdValues) - 4;
    const maxVal = Math.max(...series, ...thresholdValues) + 6;
    const range = Math.max(maxVal - minVal, 1);

    const points = series.map((val, idx) => {
      const x =
        paddingLeft + (idx / (series.length - 1)) * (width - paddingLeft - paddingRight);
      const y = height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
      return { x, y };
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const areaD = `${pathD} L${points.at(-1).x},${height - paddingY} L${points[0].x},${height - paddingY} Z`;

    const gridLines = [0.25, 0.5, 0.75].map((ratio) => {
      const y = paddingY + (height - paddingY * 2) * ratio;
      return `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid" />`;
    }).join("");

    chart.innerHTML = `
      <defs>
        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#6ff0d5" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#6ff0d5" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect x="${paddingLeft}" y="${paddingY}" width="${width - paddingLeft - paddingRight}" height="${height - paddingY * 2}" rx="12" class="chart-frame" />
      ${gridLines}
      ${floodThresholds
        .map((t) => {
          const y = height - paddingY - ((t.value - minVal) / range) * (height - paddingY * 2);
          return `
            <line x1="${paddingLeft}" x2="${width - paddingRight}" y1="${y}" y2="${y}" class="threshold-line" stroke="${t.color}" />
            <text x="${width - paddingRight + 10}" y="${y + 4}" class="threshold-label" fill="${t.color}">${t.label} · ${t.value} cm</text>
          `;
        })
        .join("")}
      <path d="${areaD}" class="chart-area" />
      <path d="${pathD}" class="chart-line" />
      ${points
        .map((p, idx) => {
          const isTick = idx % 12 === 0 || idx === points.length - 1;
          const hoursAgo = points.length - 1 - idx;
          const label = idx === points.length - 1 ? "Nyní" : `-${hoursAgo}h`;
          return `
            ${isTick ? `<text x="${p.x}" y="${height - paddingY + 16}" class="chart-label">${label}</text>` : ""}
          `;
        })
        .join("")}
      <text x="${points.at(-1).x}" y="${points.at(-1).y - 12}" class="chart-value">${series.at(-1)} cm</text>
    `;
  }

  function buildIcon(category) {
    const symbol = iconSymbols[category];
    if (!symbol) return null;
    const sizing = iconSizes[category] || { size: [40, 44], anchor: [20, 42], popup: [0, -32] };
    return L.divIcon({
      className: `marker-wrapper marker-${category}`,
      html: `
        <div class="marker-icon marker-${category}" style="--marker-color:${iconColors[category]}">
          <span class="marker-emoji">${symbol.emoji}</span>
          <span class="marker-label">${symbol.label}</span>
        </div>
      `,
      iconSize: sizing.size,
      iconAnchor: sizing.anchor,
      popupAnchor: sizing.popup,
    });
  }

  function createMarker(item, color) {
    const { lat, lng, name } = item;
    const useIcon = item.category === "kose" || item.category === "lampy";
    const marker = useIcon
      ? L.marker([lat, lng], { icon: buildIcon(item.category) })
      : L.circleMarker([lat, lng], {
          radius: 8,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.85,
        });

    let popupContent = `<strong>${name}</strong>`;
    if (item.category === "kos") {
      const fill = item.fillLevel != null ? `${item.fillLevel}%` : "–";
      const battery = item.batteryLevel != null ? `${item.batteryLevel}%` : "–";
      const updated = item.lastUpdated || "–";
      popupContent += `
        <div class="popup-details">
          <div><span>Naplněnost:</span><strong>${fill}</strong></div>
          <div><span>Poslední aktualizace:</span><strong>${updated}</strong></div>
          <div><span>Stav baterie:</span><strong>${battery}</strong></div>
        </div>`;
    } else if (item.category === "lampy") {
      const subject = encodeURIComponent(`Porucha lampy – ${name}`);
      const body = encodeURIComponent(
        "Popište závadu a případně přidejte fotku. Děkujeme!"
      );
      popupContent += `
        <div class="popup-details">
          <div><span>Stav:</span><strong>Potřebuje ověření?</strong></div>
        </div>
        <div class="popup-actions">
          <a class="popup-button" href="mailto:info@beloky.cz?subject=${subject}&body=${body}">Nahlásit závadu</a>
        </div>`;
    } else if (item.category === "hladina") {
      const levelText = streamState.level ? `${streamState.level}` : "Načítám…";
      const updatedText = streamState.updated || "–";
      popupContent += `
        <div class="popup-details">
          <div><span>Úroveň vody:</span><strong>${levelText}</strong></div>
          <div><span>Poslední data:</span><strong>${updatedText}</strong></div>
        </div>`;
    }

    marker.bindPopup(popupContent);
    return marker;
  }

  function createPolygon(area, color) {
    const polygon = L.polygon(area.coords, {
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.2,
      dashArray: "6 4",
    });

    const subject = encodeURIComponent(`Údržba zeleně – ${area.name}`);
    const body = encodeURIComponent(
      `Prosím o prověření plochy: ${area.name}. Potřeba posekat / ošetřit. Děkujeme.`
    );

    const popupContent = `
      <strong>${area.name}</strong>
      <div class="popup-details">
        <div><span>Poslední sečení:</span><strong>${area.lastMowed}</strong></div>
        <div><span>Frekvence:</span><strong>${area.frequency}</strong></div>
        <div><span>Popis:</span><strong>${area.description || "Zeleň"}</strong></div>
      </div>
      <div class="popup-actions">
        <a class="popup-button" href="mailto:info@beloky.cz?subject=${subject}&body=${body}">Nahlásit posekání</a>
      </div>
    `;

    polygon.bindPopup(popupContent);
    return polygon;
  }

  function populateLayer(category) {
    layers[category].clearLayers();
    let source = [];
    if (category === "kose") source = dataKose;
    if (category === "lampy") source = dataLampy;
    if (category === "kontejnery") source = dataKontejnery;
    if (category === "zelen") source = dataZelene;
    if (category === "hladina") source = dataHladina;

    source.forEach((item) => {
      const shape = category === "zelen"
        ? createPolygon(item, iconColors[category])
        : createMarker(item, iconColors[category]);
      shape.addTo(layers[category]);
    });
  }

  populateLayer("kose");
  populateLayer("lampy");
  populateLayer("kontejnery");
  populateLayer("zelen");
  populateLayer("hladina");

  function updateCounters() {
    if (counters.kose) counters.kose.textContent = dataKose.length;
    if (counters.lampy) counters.lampy.textContent = dataLampy.length;
    if (counters.kontejnery) counters.kontejnery.textContent = dataKontejnery.length;
    if (counters.zelen) counters.zelen.textContent = dataZelene.length;
    if (counters.hladina) {
      counters.hladina.textContent = streamState.level ? streamState.level : `${dataHladina.length} senzor`;
    }
    if (counters.odpad && nextPickupSummaryEl) {
      counters.odpad.textContent = nextPickupSummaryEl.textContent || "–";
    }
    if (zelenSummary) {
      const latest = dataZelene[0]?.lastMowed || "–";
      zelenSummary.textContent = `Poslední sečení: ${latest}`;
    }
    if (levelReading) {
      const levelText = streamState.level ? `Aktuální: ${streamState.level}` : "Načítám data senzorů…";
      const stamp = streamState.updated ? ` · ${streamState.updated}` : "";
      levelReading.textContent = `${levelText}${stamp}`;
    }
    if (streamLevelEl) streamLevelEl.textContent = streamState.level || "–";
    if (streamUpdatedEl) {
      streamUpdatedEl.textContent = streamState.updated ? `Aktualizace: ${streamState.updated}` : "Načítám…";
    }
    if (streamStatusEl) streamStatusEl.textContent = streamState.status || "–";
    renderStreamChart(streamState.numeric);
  }

  function updateWasteDashboard() {
    if (!nextPickupDateEl || !nextPickupCountdownEl || !nextPickupLabelEl || !upcomingPickupsEl) return;

    const lastPickupDate = parsePickupDate(wasteSchedule.lastPickup);
    const nextPickupDate = getNextPickupDate(lastPickupDate, wasteSchedule.intervalDays, new Date());
    const countdown = formatCountdown(nextPickupDate);

    nextPickupDateEl.textContent = formatDate(nextPickupDate);
    nextPickupLabelEl.textContent = formatDate(nextPickupDate);
    nextPickupCountdownEl.textContent = countdown;
    if (lastPickupLabelEl) lastPickupLabelEl.textContent = formatDate(lastPickupDate);
    if (nextPickupSummaryEl) nextPickupSummaryEl.textContent = `Další svoz: ${nextPickupDate.toLocaleDateString("cs-CZ")}`;

    const upcoming = buildUpcomingPickups(nextPickupDate, 4, wasteSchedule.intervalDays);
    upcomingPickupsEl.innerHTML = upcoming
      .map(
        (date, idx) => `
        <div class="waste-row">
          <div>
            <div class="date">${formatDate(date)}</div>
            <div class="label">${idx === 0 ? "Příští svoz" : `${idx + 1}. termín`}</div>
          </div>
          <span class="stat-chip subtle">14 dní</span>
        </div>`
      )
      .join("");
  }

  updateWasteDashboard();
  updateCounters();

  Object.values(layers).forEach((layer) => layer.addTo(map));

  function setActiveCategory(category) {
    const isStreamView = category === "hladina";
    const isWasteView = category === "odpad";
    const isMapCategory = mapCategories.includes(category);
    // Always keep the map layers in sync with the chosen category.
    Object.entries(layers).forEach(([key, layer]) => {
      if (key === category) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    });

    const activeButton = document.querySelector('.nav-item.active');
    if (activeButton) activeButton.classList.remove('active');
    const targetButton = document.querySelector(`.nav-item[data-category="${category}"]`);
    if (targetButton) targetButton.classList.add('active');

    const activeStat = document.querySelector('.stat-card.active');
    if (activeStat) activeStat.classList.remove('active');
    const targetStat = document.querySelector(`.stat-card[data-category="${category}"]`);
    if (targetStat) targetStat.classList.add('active');

    if (isMapCategory) {
      const activeData =
        category === "kose"
          ? dataKose
          : category === "lampy"
            ? dataLampy
            : category === "kontejnery"
              ? dataKontejnery
              : dataZelene;

      const coords =
        category === "zelen" ? activeData.flatMap((area) => area.coords) : activeData.map((item) => [item.lat, item.lng]);

      if (coords.length) {
        const bounds = L.latLngBounds(coords);
        map.flyToBounds(bounds, { padding: [28, 28], duration: 0.6, easeLinearity: 0.25 });
      }
    }

    if (categoryLabel) {
      const labelText =
        category === "kose"
          ? "Koše"
          : category === "lampy"
            ? "Lampy"
            : category === "kontejnery"
              ? "Kontejnery"
              : category === "zelen"
                ? "Údržba zeleně"
                : category === "hladina"
                  ? "Hladina potoka"
                  : "Odvoz odpadu";
      categoryLabel.textContent = `${labelText}`;
    }

    // Switch the visible view explicitly so returning from the stream panel always shows the map again.
    if (mapOverlay) mapOverlay.classList.toggle("hidden", !isMapCategory);
    if (mapView) mapView.classList.toggle("hidden", !isMapCategory);
    if (streamView) streamView.classList.toggle("hidden", !isStreamView);
    if (wasteView) wasteView.classList.toggle("hidden", !isWasteView);

    // Refresh the map size after toggling visibility to avoid a blank map when coming back from other views.
    if (isMapCategory) {
      refreshMapSize(0);
      refreshMapSize(180);
    }
  }

  function setupSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const backdrop = document.createElement("div");
    backdrop.className = "overlay-backdrop";
    document.body.appendChild(backdrop);

    function ensureInitialState() {
      if (window.innerWidth <= 960) {
        sidebar.classList.add("sidebar-hidden");
      } else {
        sidebar.classList.remove("sidebar-hidden");
      }
    }

    function openSidebar() {
      document.body.classList.add("overlay-visible");
      sidebar.classList.remove("sidebar-hidden");
      menuToggle.setAttribute("aria-expanded", "true");
      refreshMapSize();
    }

    function closeSidebar() {
      document.body.classList.remove("overlay-visible");
      sidebar.classList.add("sidebar-hidden");
      menuToggle.setAttribute("aria-expanded", "false");
      refreshMapSize();
    }

    menuToggle.addEventListener("click", () => {
      if (document.body.classList.contains("overlay-visible")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    backdrop.addEventListener("click", closeSidebar);

    const mediaQuery = window.matchMedia("(min-width: 961px)");
    mediaQuery.addEventListener("change", (e) => {
      if (e.matches) {
        document.body.classList.remove("overlay-visible");
        sidebar.classList.remove("sidebar-hidden");
        menuToggle.setAttribute("aria-expanded", "false");
        refreshMapSize();
      } else {
        sidebar.classList.add("sidebar-hidden");
        refreshMapSize();
      }
    });

    ensureInitialState();
  }

  function initNav() {
    const buttonSelectors = [".nav-item", ".stat-card"];
    buttonSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((btn) =>
        btn.addEventListener("click", () => {
          const category = btn.dataset.category;
          setActiveCategory(category);
          if (window.innerWidth <= 960) {
            document.body.classList.remove("overlay-visible");
            document.getElementById("sidebar").classList.add("sidebar-hidden");
            document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
          }
        })
      );
    });
  }

  function extractStreamData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const fallbackValue = doc
      .querySelector(".sensor-value, .value, .measurement, .card-body strong, [data-value]")
      ?.textContent;
    const fallbackTime = doc.querySelector("time, .timestamp")?.textContent;

    // Vytvoř kombinovaný text (HTML + stripnutý text), abychom zachytili i markdown snapshoty (r.jina.ai).
    const textOnly = doc.body ? doc.body.textContent || "" : "";
    const combinedText = `${html}\n${textOnly}`;

    const valueFromText = (() => {
      const regexes = [
        /Aktuální[^0-9]*([0-9]+(?:[.,][0-9]+)?)\s*cm/i,
        /Stav[^0-9]*([0-9]+(?:[.,][0-9]+)?)\s*cm/i,
        /Hladina[^0-9]*([0-9]+(?:[.,][0-9]+)?)\s*cm/i,
        /([0-9]+(?:[.,][0-9]+)?)\s*cm/i,
      ];
      for (const r of regexes) {
        const match = combinedText.match(r);
        if (match) return `${match[1].replace(",", ".")} cm`;
      }
      return fallbackValue ? fallbackValue.trim() : null;
    })();

    const timeFromText = (() => {
      const match = combinedText.match(/(\d{1,2}\.\d{1,2}\.\d{2,4}[^\d]*\d{1,2}:\d{2})/);
      if (match) return match[1];
      return fallbackTime ? fallbackTime.trim() : null;
    })();

    const numericMatch = (valueFromText || "").match(/([0-9]+(?:[.,][0-9]+)?)/);
    const numeric = numericMatch ? parseFloat(numericMatch[1].replace(",", ".")) : null;

    return { valueFromText, timeFromText, numeric };
  }

  async function fetchStreamLevel() {
    let lastError = null;
    for (const candidate of streamFetchCandidates) {
      try {
        const response = await fetch(candidate, { cache: "no-store", mode: "cors" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();

        const { valueFromText, timeFromText, numeric } = extractStreamData(html);
        if (numeric != null && !Number.isNaN(numeric)) {
          streamState.numeric = numeric;
          streamState.level = `${numeric} cm`;
          streamHistory = [...streamHistory.slice(-(72 - 1)), numeric];
        } else if (valueFromText) {
          streamState.level = valueFromText;
        }
        if (timeFromText) streamState.updated = timeFromText;

        streamState.updated = streamState.updated || new Date().toLocaleString("cs-CZ");
        streamState.status = `Live data (${new URL(candidate).hostname}) · ${new Date().toLocaleTimeString("cs-CZ")}`;
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (lastError) {
      streamState.level = streamState.level || `${streamHistory.at(-1)} cm`;
      streamState.updated = streamState.updated || "Zdroj nepřístupný";
      streamState.numeric = streamState.numeric || streamHistory.at(-1);
      streamState.status = "Zdroj nepřístupný (CORS / blokováno)";
      console.warn("Chyba při načítání hladiny", lastError);
    }

    populateLayer("hladina");
    updateCounters();
  }

  setActiveCategory("kose");
  setupSidebarToggle();
  initNav();
  refreshMapSize(0);
  window.addEventListener("resize", () => refreshMapSize(80));
  fetchStreamLevel();
});
