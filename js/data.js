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
  { id: "K-01", fillLevel: 92, lastUpdated: "2030-01-02T08:15:00+01:00", batteryLevel: 82 },
  { id: "K-02", fillLevel: 40, lastUpdated: "2030-01-02T06:30:00+01:00", batteryLevel: 9 },
  { id: "K-03", fillLevel: 55, lastUpdated: "2024-10-01T07:00:00+02:00", batteryLevel: 74 },
  { id: "K-04", fillLevel: 28, lastUpdated: "2030-01-02T09:20:00+01:00", batteryLevel: 80 },
  { id: "K-05", fillLevel: 68, lastUpdated: "2030-01-01T21:05:00+01:00", batteryLevel: 35 },
  { id: "K-06", fillLevel: 47, lastUpdated: "2030-01-02T07:45:00+01:00", batteryLevel: 59 },
  { id: "K-07", fillLevel: 18, lastUpdated: "2030-01-02T08:55:00+01:00", batteryLevel: 92 },
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
  {
    name: "Zelený pás u potoka",
    description: "Travnatý úsek podél potoka",
    category: "zelen",
    lastMowed: "2024-05-18 10:00",
    frequency: "1× za 3 týdny",
    coords: [
      [50.132774, 14.22038],
      [50.132656, 14.220131],
      [50.132638, 14.220131],
      [50.132604, 14.220091],
      [50.132597, 14.22016],
      [50.13254, 14.220254],
      [50.132559, 14.220284],
      [50.132487, 14.22041],
      [50.132385, 14.220576],
      [50.132361, 14.220555],
      [50.132184, 14.220707],
      [50.132709, 14.220522],
      [50.132931, 14.220431],
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

const fallbackStreamCsv = `
2025-11-23 12:10:00;20
2025-11-23 12:20:00;21
2025-11-23 12:30:00;21
2025-11-23 12:40:00;21
2025-11-23 12:50:00;21
2025-11-23 13:00:00;20
2025-11-23 13:10:00;18
2025-11-23 13:20:00;18
2025-11-23 13:30:00;18
2025-11-23 13:40:00;18
2025-11-23 13:50:00;20
2025-11-23 14:00:00;20
2025-11-23 14:10:00;21
2025-11-23 14:20:00;21
2025-11-23 14:30:00;22
2025-11-23 14:40:00;23
2025-11-23 14:50:00;23
2025-11-23 15:00:00;23
2025-11-23 15:10:00;23
2025-11-23 15:20:00;22
2025-11-23 15:30:00;22
2025-11-23 15:40:00;22
2025-11-23 15:50:00;22
2025-11-23 16:00:00;22
2025-11-23 16:10:00;22
2025-11-23 16:20:00;22
2025-11-23 16:30:00;23
2025-11-23 16:40:00;23
2025-11-23 16:50:00;23
2025-11-23 17:00:00;23
2025-11-23 17:10:00;23
2025-11-23 17:20:00;23
2025-11-23 17:30:00;23
2025-11-23 17:40:00;23
2025-11-23 17:50:00;24
2025-11-23 18:00:00;23
2025-11-23 18:10:00;23
2025-11-23 18:20:00;23
2025-11-23 18:30:00;24
2025-11-23 18:40:00;24
2025-11-23 18:50:00;24
2025-11-23 19:00:00;24
2025-11-23 19:10:00;24
2025-11-23 19:20:00;24
2025-11-23 19:30:00;24
2025-11-23 19:40:00;25
2025-11-23 19:50:00;24
2025-11-23 20:00:00;24
2025-11-23 20:10:00;24
2025-11-23 20:20:00;24
2025-11-23 20:30:00;24
2025-11-23 20:40:00;25
2025-11-23 20:50:00;24
2025-11-23 21:00:00;24
2025-11-23 21:10:00;25
2025-11-23 21:20:00;25
2025-11-23 21:30:00;25
2025-11-23 21:40:00;25
2025-11-23 21:50:00;24
2025-11-23 22:00:00;24
2025-11-23 22:10:00;25
2025-11-23 22:20:00;25
2025-11-23 22:30:00;25
2025-11-23 22:40:00;25
2025-11-23 22:50:00;24
2025-11-23 23:00:00;25
2025-11-23 23:10:00;25
2025-11-23 23:20:00;25
2025-11-23 23:30:00;25
2025-11-23 23:40:00;25
2025-11-23 23:50:00;25
2025-11-24 00:00:00;24
2025-11-24 00:10:00;24
2025-11-24 00:20:00;24
2025-11-24 00:30:00;24
2025-11-24 00:40:00;24
2025-11-24 00:50:00;24
2025-11-24 01:00:00;24
2025-11-24 01:10:00;24
2025-11-24 01:20:00;25
2025-11-24 01:30:00;24
2025-11-24 01:40:00;24
2025-11-24 01:50:00;24
2025-11-24 02:00:00;24
2025-11-24 02:10:00;24
2025-11-24 02:20:00;24
2025-11-24 02:30:00;24
2025-11-24 02:40:00;24
2025-11-24 02:50:00;24
2025-11-24 03:00:00;24
2025-11-24 03:10:00;23
2025-11-24 03:20:00;24
2025-11-24 03:30:00;23
2025-11-24 03:40:00;24
2025-11-24 03:50:00;23
2025-11-24 04:00:00;23
2025-11-24 04:10:00;23
2025-11-24 04:20:00;23
2025-11-24 04:30:00;24
2025-11-24 04:40:00;23
2025-11-24 04:50:00;24
2025-11-24 05:00:00;23
2025-11-24 05:10:00;23
2025-11-24 05:20:00;23
2025-11-24 05:30:00;24
2025-11-24 05:40:00;23
2025-11-24 05:50:00;23
2025-11-24 06:00:00;23
2025-11-24 06:10:00;24
2025-11-24 06:20:00;23
2025-11-24 06:30:00;23
2025-11-24 06:40:00;23
2025-11-24 06:50:00;24
2025-11-24 07:00:00;23
2025-11-24 07:10:00;23
2025-11-24 07:20:00;24
2025-11-24 07:30:00;23
2025-11-24 07:40:00;23
2025-11-24 07:50:00;23
2025-11-24 08:00:00;23
2025-11-24 08:10:00;23
2025-11-24 08:20:00;23
2025-11-24 08:30:00;23
2025-11-24 08:40:00;23
2025-11-24 08:50:00;23
2025-11-24 09:00:00;23
2025-11-24 09:10:00;23
2025-11-24 09:20:00;23
2025-11-24 09:30:00;23
2025-11-24 09:40:00;23
2025-11-24 09:50:00;23
2025-11-24 10:00:00;22
2025-11-24 10:10:00;22
2025-11-24 10:20:00;23
2025-11-24 10:30:00;22
2025-11-24 10:40:00;22
2025-11-24 10:50:00;22
2025-11-24 11:00:00;22
2025-11-24 11:10:00;22
2025-11-24 11:20:00;22
2025-11-24 11:30:00;21
2025-11-24 11:40:00;22
2025-11-24 11:50:00;21
2025-11-24 12:00:00;21
`;
const floodThresholds = [
  { label: "SPA 1", value: 90, color: "#22c55e" },
  { label: "SPA 2", value: 100, color: "#facc15" },
  { label: "SPA 3", value: 120, color: "#f97316" },
];

const STREAM_MAX_WINDOW_HOURS = 24;
let streamHistory = [];
let streamHistoryTimes = [];
const streamState = {
  level: "Načítám…",
  updated: "Základní údaje",
  numeric: null,
  status: "Načítám…",
};

function parseStreamCsv(csvText = "") {
  return csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [ts, value] = line.split(";").map((p) => p.trim());
      const numeric = Number(value?.replace(",", "."));
      const parsedDate = Date.parse(ts.replace(" ", "T"));
      return {
        ts,
        date: Number.isFinite(parsedDate) ? new Date(parsedDate) : null,
        numeric: Number.isFinite(numeric) ? numeric : null,
      };
    })
    .filter((entry) => entry.numeric != null);
}

function trimStreamWindow() {
  const latestTime = [...streamHistoryTimes].reverse().find((d) => d instanceof Date && Number.isFinite(d.getTime()));
  if (latestTime instanceof Date) {
    const cutoff = latestTime.getTime() - STREAM_MAX_WINDOW_HOURS * 60 * 60 * 1000;
    while (
      streamHistoryTimes.length &&
      streamHistoryTimes[0] instanceof Date &&
      Number.isFinite(streamHistoryTimes[0].getTime()) &&
      streamHistoryTimes[0].getTime() < cutoff
    ) {
      streamHistoryTimes.shift();
      streamHistory.shift();
    }
  }

  // Safety net: keep a reasonable number of points even if timestamps chybí
  const maxPoints = 6 * STREAM_MAX_WINDOW_HOURS; // e.g. 10min interval ~144 bodů
  while (streamHistory.length > maxPoints) {
    streamHistory.shift();
    streamHistoryTimes.shift();
  }
}

function pushStreamReading(value, timestamp = new Date()) {
  if (value == null || Number.isNaN(value)) return;
  const safeTime =
    timestamp instanceof Date && Number.isFinite(timestamp.getTime()) ? timestamp : new Date();
  streamHistory.push(value);
  streamHistoryTimes.push(safeTime);
  trimStreamWindow();
}

function setStreamHistory(entries) {
  if (!entries || !entries.length) return;
  entries.sort((a, b) => {
    const aTime = a.date ? a.date.getTime() : 0;
    const bTime = b.date ? b.date.getTime() : 0;
    return aTime - bTime;
  });

  streamHistory = [];
  streamHistoryTimes = [];
  entries.forEach((entry) => {
    if (entry.numeric != null) {
      pushStreamReading(entry.numeric, entry.date);
    }
  });

  const latest = entries.at(-1);
  streamState.numeric = latest.numeric;
  streamState.level = `${latest.numeric} cm`;
  streamState.updated = latest.date
    ? latest.date.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" })
    : latest.ts;
  streamState.status = "CSV data (hladina.csv)";
}

async function loadStreamHistory() {
  const url = `${dataBaseUrl}/hladina.csv`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    const parsed = parseStreamCsv(csv);
    if (parsed.length) {
      setStreamHistory(parsed);
      return parsed;
    }
    throw new Error("Prázdný soubor hladiny");
  } catch (error) {
    console.warn(`Nepodařilo se načíst hladinovou historii (${url})`, error);
    const fallbackParsed = parseStreamCsv(fallbackStreamCsv);
    setStreamHistory(fallbackParsed);
    return fallbackParsed;
  }
}

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
  const [koseDefinitions, koseTelemetry, lampy, kontejnery, zelene, _streamHistory] = await Promise.all([
    loadDataset("kose", fallbackKoseDefinitions),
    loadKoseTelemetry(),
    loadDataset("lampy", fallbackLampy),
    loadDataset("kontejnery", fallbackKontejnery),
    loadDataset("zelene", fallbackZelene),
    loadStreamHistory(),
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

