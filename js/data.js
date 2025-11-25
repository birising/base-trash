// Data loading and fallback utilities

const DATA_BASE_URL = window.DATA_BASE_URL || "";
const DATA_PATHS = {
  kose: `${DATA_BASE_URL}data/kose.json`,
  kontejnery: `${DATA_BASE_URL}data/kontejnery.json`,
  lampy: `${DATA_BASE_URL}data/lampy.json`,
  zelene: `${DATA_BASE_URL}data/zelene.json`,
  koseCsv: `${DATA_BASE_URL}data/kose_telemetry.csv`,
  hladinaCsv: `${DATA_BASE_URL}data/hladina.csv`,
};

const fallbackKose = [
  { lat: 50.130144, lng: 14.219936, name: "Koš plný", description: null, category: "kose", id: "K-001" },
  { lat: 50.128687, lng: 14.221423, name: "Koš", description: null, category: "kose", id: "K-002" },
  { lat: 50.129602, lng: 14.221984, name: "Koš", description: null, category: "kose", id: "K-003" },
  { lat: 50.132469, lng: 14.220607, name: "Koš", description: null, category: "kose", id: "K-004" },
  { lat: 50.132801, lng: 14.220461, name: "Koš", description: null, category: "kose", id: "K-005" },
  { lat: 50.133472, lng: 14.225753, name: "Koš", description: null, category: "kose", id: "K-006" },
  { lat: 50.132557, lng: 14.220691, name: "Koš", description: null, category: "kose", id: "K-007" },
];

const fallbackLampy = [
  { lat: 50.133935, lng: 14.222031, name: "Rozbitá lampa", description: null, category: "lampy", id: "L-001" },
  { lat: 50.132683, lng: 14.22153, name: "Rozbitá", description: null, category: "lampy", id: "L-002" },
  { lat: 50.130526, lng: 14.220269, name: "Lampa rozbitá", description: null, category: "lampy", id: "L-003" },
  { lat: 50.132075, lng: 14.225998, name: "Lampa rozbitá", description: null, category: "lampy", id: "L-004" },
  { lat: 50.130589, lng: 14.221878, name: "Lampa 15", description: null, category: "lampy", id: "L-005" },
  { lat: 50.130105, lng: 14.222052, name: "Lampa", description: null, category: "lampy", id: "L-006" },
  { lat: 50.131003, lng: 14.221204, name: "Lampa", description: null, category: "lampy", id: "L-007" },
  { lat: 50.13117, lng: 14.220722, name: "Lampa", description: null, category: "lampy", id: "L-008" },
  { lat: 50.130949, lng: 14.220521, name: "Lampa", description: null, category: "lampy", id: "L-009" },
  { lat: 50.130093, lng: 14.219836, name: "Lampa", description: null, category: "lampy", id: "L-010" },
  { lat: 50.129781, lng: 14.219071, name: "Lampa", description: null, category: "lampy", id: "L-011" },
  { lat: 50.131421, lng: 14.220844, name: "Lampa", description: null, category: "lampy", id: "L-012" },
  { lat: 50.132316, lng: 14.220784, name: "Lampa", description: null, category: "lampy", id: "L-013" },
  { lat: 50.132836, lng: 14.220645, name: "Lampa", description: null, category: "lampy", id: "L-014" },
  { lat: 50.133054, lng: 14.220365, name: "Lampa", description: null, category: "lampy", id: "L-015" },
  { lat: 50.133314, lng: 14.21992, name: "Lampa", description: null, category: "lampy", id: "L-016" },
  { lat: 50.133076, lng: 14.219179, name: "Lampa", description: null, category: "lampy", id: "L-017" },
  { lat: 50.133666, lng: 14.220194, name: "Lampa", description: null, category: "lampy", id: "L-018" },
  { lat: 50.133295, lng: 14.221099, name: "Lampa", description: null, category: "lampy", id: "L-019" },
  { lat: 50.133599, lng: 14.221485, name: "Lampa", description: null, category: "lampy", id: "L-020" },
  { lat: 50.133897, lng: 14.221747, name: "Lampa", description: null, category: "lampy", id: "L-021" },
  { lat: 50.132773, lng: 14.221132, name: "Lampa", description: null, category: "lampy", id: "L-022" },
  { lat: 50.132649, lng: 14.22213, name: "Lampa", description: null, category: "lampy", id: "L-023" },
  { lat: 50.132459, lng: 14.222365, name: "Lampa", description: null, category: "lampy", id: "L-024" },
  { lat: 50.132207, lng: 14.222406, name: "Lampa", description: null, category: "lampy", id: "L-025" },
  { lat: 50.132609, lng: 14.222559, name: "Lampa", description: null, category: "lampy", id: "L-026" },
  { lat: 50.132825, lng: 14.222919, name: "Lampa", description: null, category: "lampy", id: "L-027" },
  { lat: 50.133015, lng: 14.223248, name: "Lampa", description: null, category: "lampy", id: "L-028" },
  { lat: 50.13304, lng: 14.223699, name: "Lampa", description: null, category: "lampy", id: "L-029" },
  { lat: 50.132968, lng: 14.2241, name: "Lampa", description: null, category: "lampy", id: "L-030" },
  { lat: 50.133074, lng: 14.224404, name: "Lampa", description: null, category: "lampy", id: "L-031" },
  { lat: 50.133565, lng: 14.224416, name: "Lampa", description: null, category: "lampy", id: "L-032" },
  { lat: 50.133423, lng: 14.224041, name: "Lampa", description: null, category: "lampy", id: "L-033" },
  { lat: 50.133372, lng: 14.224993, name: "Lampa", description: null, category: "lampy", id: "L-034" },
  { lat: 50.132633, lng: 14.224092, name: "Lampa", description: null, category: "lampy", id: "L-035" },
  { lat: 50.132452, lng: 14.223862, name: "Lampa", description: null, category: "lampy", id: "L-036" },
  { lat: 50.132232, lng: 14.224346, name: "Lampa", description: null, category: "lampy", id: "L-037" },
  { lat: 50.132147, lng: 14.225015, name: "Lampa", description: null, category: "lampy", id: "L-038" },
  { lat: 50.132281, lng: 14.223662, name: "Lampa", description: null, category: "lampy", id: "L-039" },
  { lat: 50.132101, lng: 14.222946, name: "Lampa", description: null, category: "lampy", id: "L-040" },
  { lat: 50.132001, lng: 14.222607, name: "Lampa", description: null, category: "lampy", id: "L-041" },
  { lat: 50.131776, lng: 14.22183, name: "Lampa", description: null, category: "lampy", id: "L-042" },
  { lat: 50.131564, lng: 14.221154, name: "Lampa", description: null, category: "lampy", id: "L-043" },
  { lat: 50.131401, lng: 14.22157, name: "Lampa", description: null, category: "lampy", id: "L-044" },
  { lat: 50.131108, lng: 14.221686, name: "Lampa", description: null, category: "lampy", id: "L-045" },
  { lat: 50.130743, lng: 14.220386, name: "Lampa", description: null, category: "lampy", id: "L-046" },
];

const fallbackKontejnery = [
  { lat: 50.132911, lng: 14.224212, name: "Zimní údržba", description: null, category: "kontejnery" },
  { lat: 50.132602, lng: 14.224192, name: "Zimní údržba", description: null, category: "kontejnery" },
  { lat: 50.130817, lng: 14.221791, name: "Zimní údržba", description: null, category: "kontejnery" },
  { lat: 50.132204, lng: 14.222392, name: "Zimní údržba", description: null, category: "kontejnery" },
];

const fallbackZelene = [
  {
    name: "Zelený pás u potoka",
    description: "Travnatý úsek podél potoka",
    category: "zelen",
    type: "trava",
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
  {
    name: "Remízek u polní cesty",
    description: "Tráva s náletovými keři",
    category: "zelen",
    type: "trava",
    lastMowed: "2024-05-22 08:15",
    frequency: "1× za 3 týdny",
    coords: [
      [50.124089, 14.212089],
      [50.124213, 14.212331],
      [50.124072, 14.212226],
      [50.123965, 14.212245],
      [50.124115, 14.212387],
      [50.124142, 14.212484],
      [50.124024, 14.21283],
      [50.124015, 14.213473],
      [50.123837, 14.213495],
      [50.123793, 14.213592],
      [50.12345, 14.213127],
      [50.12345, 14.213026],
      [50.123609, 14.212631],
      [50.123829, 14.212344],
    ],
  },
  {
    name: "Louka u polní cesty",
    description: "Sekaná louka se smrkovým pásmem",
    category: "zelen",
    type: "trava",
    lastMowed: "2024-05-28 07:50",
    frequency: "1× za 3 týdny",
    coords: [
      [50.130826, 14.212647],
      [50.130719, 14.212642],
      [50.130693, 14.21284],
      [50.130676, 14.213095],
      [50.130724, 14.213305],
      [50.130719, 14.213364],
      [50.130798, 14.213913],
      [50.130889, 14.214388],
      [50.130929, 14.214471],
      [50.131054, 14.214568],
      [50.131137, 14.214713],
      [50.131146, 14.214573],
      [50.131106, 14.214334],
      [50.131024, 14.213806],
      [50.130946, 14.213313],
      [50.130893, 14.213028],
      [50.130867, 14.2128],
    ],
  },
  {
    name: "Plácek u dvora",
    description: "Travnatá plocha u ulice na návsi",
    category: "zelen",
    type: "trava",
    lastMowed: "2024-06-04 08:45",
    frequency: "1× za 2 týdny",
    coords: [
      [50.132976, 14.224095],
      [50.132941, 14.22418],
      [50.132906, 14.22423],
      [50.132903, 14.224256],
      [50.132921, 14.224283],
      [50.132976, 14.224324],
      [50.133027, 14.224371],
      [50.133082, 14.224418],
      [50.133137, 14.224471],
      [50.133166, 14.22453],
      [50.13322, 14.224615],
      [50.133296, 14.224741],
      [50.133224, 14.224581],
      [50.133182, 14.224499],
      [50.133151, 14.224434],
      [50.133123, 14.224377],
      [50.133102, 14.224328],
      [50.13309, 14.224298],
      [50.13308, 14.224277],
      [50.133019, 14.224311],
      [50.133005, 14.224206],
    ],
  },
  {
    name: "Okraj hřiště",
    description: "Tráva a nízké keře u sportoviště",
    category: "zelen",
    type: "trava",
    lastMowed: "2024-06-14 08:00",
    frequency: "1× za 2 týdny",
    coords: [
      [50.13326, 14.220331],
      [50.133303, 14.220355],
      [50.133356, 14.220388],
      [50.133393, 14.220419],
      [50.133464, 14.220485],
      [50.133507, 14.220505],
      [50.133529, 14.220466],
      [50.133519, 14.22038],
      [50.133504, 14.22034],
      [50.13349, 14.220285],
      [50.133471, 14.220167],
      [50.133458, 14.220111],
      [50.133441, 14.219966],
      [50.13341, 14.219799],
      [50.133386, 14.219734],
      [50.133337, 14.219621],
      [50.133302, 14.219604],
      [50.133287, 14.219594],
      [50.133297, 14.21964],
      [50.133344, 14.219775],
      [50.133367, 14.219946],
      [50.133364, 14.220031],
      [50.133343, 14.220128],
      [50.133319, 14.22017],
      [50.133303, 14.220207],
      [50.133279, 14.220273],
      [50.133267, 14.220296],
      [50.133257, 14.220318],
    ],
  },
  {
    name: "Plocha u křižovatky",
    description: "Travnatý trojúhelník u křižovatky",
    category: "zelen",
    type: "trava",
    lastMowed: "2024-06-18 09:15",
    frequency: "1× za 2 týdny",
    coords: [
      [50.129189, 14.221788],
      [50.128945, 14.221615],
      [50.12887, 14.221849],
      [50.129148, 14.22201],
    ],
  },
  {
    name: "Květinový záhon u návsi",
    description: "Malý květinový záhon u návsi",
    category: "zelen",
    type: "zahony",
    lastMowed: "2024-06-22 09:10",
    frequency: "1× týdně péče o záhony",
    coords: [
      [50.131769, 14.221016],
      [50.131767, 14.221035],
      [50.131761, 14.221041],
      [50.131755, 14.221053],
      [50.131742, 14.221057],
      [50.131732, 14.221059],
      [50.131728, 14.221045],
      [50.131724, 14.221027],
      [50.131728, 14.221006],
      [50.131743, 14.220985],
      [50.131759, 14.22099],
      [50.131775, 14.220998],
      [50.131778, 14.221013],
    ],
  },
];

let dataKose = [];
let dataLampy = [];
let dataKontejnery = [];
let dataZelene = [];
let dataHladina = [];
let koseTelemetry = [];
let streamHistory = [];
let streamHistoryTimes = [];

function csvToRows(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(";").map((cell) => cell.trim()));
}

function parseNumber(value) {
  if (value === undefined || value === null) return null;
  const n = Number(value.toString().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseCsvWithHeader(text) {
  const [header, ...rows] = csvToRows(text);
  return rows.map((row) => Object.fromEntries(row.map((cell, idx) => [header[idx], cell])));
}

function parseHladinaCsv(text) {
  const rows = csvToRows(text);
  const times = [];
  const values = [];
  rows.forEach(([dateStr, valueStr]) => {
    const value = parseNumber(valueStr);
    const date = new Date(dateStr.replace(" ", "T") + "+01:00");
    if (Number.isFinite(value) && !Number.isNaN(date.getTime())) {
      times.push(date);
      values.push(value);
    }
  });
  return { times, values };
}

function parsePickupDate(input) {
  if (!input) return new Date();
  const [day, month, year] = input.split(".").map((v) => Number(v));
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  return date.toLocaleDateString("cs-CZ", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatClock(date) {
  return date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.text();
}

async function loadDataset(name, fallback) {
  try {
    const url = DATA_PATHS[name];
    const response = await fetchJson(url);
    return response;
  } catch (err) {
    console.warn(`Using fallback for ${name}`, err);
    return fallback;
  }
}

async function loadCsvDataset(name, fallbackParser) {
  try {
    const url = DATA_PATHS[name];
    const text = await fetchText(url);
    return fallbackParser(text);
  } catch (err) {
    console.warn(`Using fallback for ${name}`, err);
    return fallbackParser(null);
  }
}

function parseBinTelemetryCsv(text) {
  if (!text) {
    return [
      { id: "K-001", battery: 12, fill: 94, lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      { id: "K-002", battery: 80, fill: 32, lastUpdate: new Date(Date.now() - 40 * 60 * 1000) },
      { id: "K-003", battery: 14, fill: 50, lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { id: "K-004", battery: 55, fill: 20, lastUpdate: new Date(Date.now() - 26 * 60 * 60 * 1000) },
      { id: "K-005", battery: 88, fill: 10, lastUpdate: new Date(Date.now() - 90 * 60 * 1000) },
      { id: "K-006", battery: 67, fill: 45, lastUpdate: new Date(Date.now() - 50 * 60 * 1000) },
      { id: "K-007", battery: 96, fill: 15, lastUpdate: new Date(Date.now() - 30 * 60 * 1000) },
    ];
  }

  const rows = parseCsvWithHeader(text);
  const byId = new Map();

  rows.forEach((row) => {
    const id = row.id || row.ID;
    if (!id) return;
    const fill = parseNumber(row.fill ?? row.fill_pct ?? row.naplnost);
    const battery = parseNumber(row.battery ?? row.bat ?? row.bat_pct);
    const ts = row.timestamp || row.ts || row.time || row.datetime || row.cas;
    const when = ts ? new Date(ts.replace(" ", "T") + "+01:00") : new Date();
    if (!Number.isFinite(when.getTime())) return;
    const existing = byId.get(id);
    if (!existing || when > existing.lastUpdate) {
      byId.set(id, {
        id,
        fill,
        battery,
        lastUpdate: when,
      });
    }
  });

  return Array.from(byId.values());
}

function parseStreamCsv(text) {
  if (!text) {
    const now = new Date();
    const past = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    return {
      times: [past, now],
      values: [18, 20],
    };
  }
  return parseHladinaCsv(text);
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

  koseTelemetry = await loadCsvDataset("koseCsv", parseBinTelemetryCsv);

  const streamCsv = await loadCsvDataset("hladinaCsv", parseStreamCsv);
  streamHistoryTimes = streamCsv.times;
  streamHistory = streamCsv.values;
}

