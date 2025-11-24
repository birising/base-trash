const dataBaseUrl = window.DATA_BASE_URL || "./data";

const fallbackKoseDefinitions = [
  {
    id: "K-01",
    lat: 50.130144,
    lng: 14.219936,
    name: "Koš plný",
    description: null,
    category: "kose",
  },
  {
    id: "K-02",
    lat: 50.128687,
    lng: 14.221423,
    name: "Koš",
    description: null,
    category: "kose",
  },
  {
    id: "K-03",
    lat: 50.129602,
    lng: 14.221984,
    name: "Koš",
    description: null,
    category: "kose",
  },
  {
    id: "K-04",
    lat: 50.132469,
    lng: 14.220607,
    name: "Koš",
    description: null,
    category: "kose",
  },
  {
    id: "K-05",
    lat: 50.132801,
    lng: 14.220461,
    name: "Koš",
    description: null,
    category: "kose",
  },
  {
    id: "K-06",
    lat: 50.133472,
    lng: 14.225753,
    name: "Koš",
    description: null,
    category: "kose",
  },
  {
    id: "K-07",
    lat: 50.132557,
    lng: 14.220691,
    name: "Koš",
    description: null,
    category: "kose",
  },
];

const fallbackKoseTelemetry = [
  { id: "K-01", fillLevel: 92, lastUpdated: "2025-05-12T08:15:00+02:00", batteryLevel: 82 },
  { id: "K-02", fillLevel: 40, lastUpdated: "2025-05-12T06:30:00+02:00", batteryLevel: 9 },
  { id: "K-03", fillLevel: 55, lastUpdated: "2024-10-01T07:00:00+02:00", batteryLevel: 74 },
  { id: "K-04", fillLevel: 28, lastUpdated: "2025-05-12T09:20:00+02:00", batteryLevel: 80 },
  { id: "K-05", fillLevel: 68, lastUpdated: "2025-05-11T21:05:00+02:00", batteryLevel: 35 },
  { id: "K-06", fillLevel: 47, lastUpdated: "2025-05-12T07:45:00+02:00", batteryLevel: 59 },
  { id: "K-07", fillLevel: 18, lastUpdated: "2025-05-12T08:55:00+02:00", batteryLevel: 92 },
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

function parseKoseTelemetry(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const header = lines.shift().split(",").map((h) => h.trim().toLowerCase());
  const idx = {
    id: header.indexOf("id"),
    fillLevel: header.indexOf("filllevel"),
    lastUpdated: header.indexOf("lastupdated"),
    batteryLevel: header.indexOf("batterylevel"),
  };

  return lines
    .map((row) => row.split(",").map((cell) => cell.trim()))
    .map((cells) => ({
      id: idx.id >= 0 ? cells[idx.id] : undefined,
      fillLevel: idx.fillLevel >= 0 ? Number(cells[idx.fillLevel]) : undefined,
      lastUpdated: idx.lastUpdated >= 0 ? cells[idx.lastUpdated] : undefined,
      batteryLevel: idx.batteryLevel >= 0 ? Number(cells[idx.batteryLevel]) : undefined,
    }))
    .filter((entry) => entry.id);
}

function pickLatestTelemetry(entries) {
  const latest = new Map();
  entries.forEach((entry, index) => {
    const current = latest.get(entry.id);
    const timeValue = Date.parse(entry.lastUpdated || "");
    const currentTime = current ? Date.parse(current.lastUpdated || "") : -Infinity;
    const isNewer = Number.isFinite(timeValue) && timeValue >= currentTime;
    const fallbackNewer = !Number.isFinite(timeValue) && current === undefined;
    if (isNewer || fallbackNewer) {
      latest.set(entry.id, { ...entry, order: index });
    }
  });
  return latest;
}

function mergeKose(definitions, telemetryEntries) {
  const latestTelemetry = pickLatestTelemetry(telemetryEntries);
  return definitions.map((def) => {
    const telem = latestTelemetry.get(def.id);
    return {
      ...def,
      category: "kose",
      fillLevel: telem?.fillLevel ?? null,
      lastUpdated: telem?.lastUpdated ?? "–",
      batteryLevel: telem?.batteryLevel ?? null,
    };
  });
}

async function loadKoseTelemetry() {
  const url = `${dataBaseUrl}/kose_telemetry.csv`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    const parsed = parseKoseTelemetry(csv);
    return parsed.length ? parsed : fallbackKoseTelemetry;
  } catch (error) {
    console.warn(`Nepodařilo se načíst telemetrii košů (${url})`, error);
    return fallbackKoseTelemetry;
  }
}

async function loadAllData() {
  const [koseDefinitions, koseTelemetry, lampy, kontejnery, zelene] = await Promise.all([
    loadDataset("kose", fallbackKoseDefinitions),
    loadKoseTelemetry(),
    loadDataset("lampy", fallbackLampy),
    loadDataset("kontejnery", fallbackKontejnery),
    loadDataset("zelene", fallbackZelene),
  ]);

  dataKose = mergeKose(koseDefinitions, koseTelemetry);
  dataLampy = lampy;
  dataKontejnery = kontejnery;
  dataZelene = zelene;
}

function showMapError(message) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;
  mapContainer.innerHTML = `<div class="map-error">${message}</div>`;
}

