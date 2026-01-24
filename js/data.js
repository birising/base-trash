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
  { lat: 50.133935, lng: 14.222031, name: "Rozbita lampa", description: null, category: "lampy", id: 1 },
  { lat: 50.132683, lng: 14.22153, name: "Rozbita", description: null, category: "lampy", id: 2 },
  { lat: 50.130526, lng: 14.220269, name: "Lampa rozbita", description: null, category: "lampy", id: 3 },
  { lat: 50.132075, lng: 14.225998, name: "Lampa rozbita", description: null, category: "lampy", id: 4 },
  { lat: 50.130589, lng: 14.221878, name: "Lampa 15", description: null, category: "lampy", id: 5 },
  { lat: 50.130105, lng: 14.222052, name: "Lampa", description: null, category: "lampy", id: 6 },
  { lat: 50.131003, lng: 14.221204, name: "Lampa", description: null, category: "lampy", id: 7 },
  { lat: 50.13117, lng: 14.220722, name: "Lampa", description: null, category: "lampy", id: 8 },
  { lat: 50.130949, lng: 14.220521, name: "Lampa", description: null, category: "lampy", id: 9 },
  { lat: 50.130093, lng: 14.219836, name: "Lampa", description: null, category: "lampy", id: 10 },
  { lat: 50.129781, lng: 14.219071, name: "Lampa", description: null, category: "lampy", id: 11 },
  { lat: 50.131421, lng: 14.220844, name: "Lampa", description: null, category: "lampy", id: 12 },
  { lat: 50.132316, lng: 14.220784, name: "Lampa", description: null, category: "lampy", id: 13 },
  { lat: 50.132836, lng: 14.220645, name: "Lampa", description: null, category: "lampy", id: 14 },
  { lat: 50.133054, lng: 14.220365, name: "Lampa", description: null, category: "lampy", id: 15 },
  { lat: 50.133314, lng: 14.21992, name: "Lampa", description: null, category: "lampy", id: 16 },
  { lat: 50.133076, lng: 14.219179, name: "Lampa", description: null, category: "lampy", id: 17 },
  { lat: 50.133666, lng: 14.220194, name: "Lampa", description: null, category: "lampy", id: 18 },
  { lat: 50.133295, lng: 14.221099, name: "Lampa", description: null, category: "lampy", id: 19 },
  { lat: 50.133599, lng: 14.221485, name: "Lampa", description: null, category: "lampy", id: 20 },
  { lat: 50.133897, lng: 14.221747, name: "Lampa", description: null, category: "lampy", id: 21 },
  { lat: 50.132773, lng: 14.221132, name: "Lampa", description: null, category: "lampy", id: 22 },
  { lat: 50.132649, lng: 14.22213, name: "Lampa", description: null, category: "lampy", id: 23 },
  { lat: 50.132459, lng: 14.222365, name: "Lampa", description: null, category: "lampy", id: 24 },
  { lat: 50.132207, lng: 14.222406, name: "Lampa", description: null, category: "lampy", id: 25 },
  { lat: 50.132609, lng: 14.222559, name: "Lampa", description: null, category: "lampy", id: 26 },
  { lat: 50.132825, lng: 14.222919, name: "Lampa", description: null, category: "lampy", id: 27 },
  { lat: 50.133015, lng: 14.223248, name: "Lampa", description: null, category: "lampy", id: 28 },
  { lat: 50.13304, lng: 14.223699, name: "Lampa", description: null, category: "lampy", id: 29 },
  { lat: 50.132968, lng: 14.2241, name: "Lampa", description: null, category: "lampy", id: 30 },
  { lat: 50.133074, lng: 14.224404, name: "Lampa", description: null, category: "lampy", id: 31 },
  { lat: 50.133565, lng: 14.224416, name: "Lampa", description: null, category: "lampy", id: 32 },
  { lat: 50.133423, lng: 14.224041, name: "Lampa", description: null, category: "lampy", id: 33 },
  { lat: 50.133372, lng: 14.224993, name: "Lampa", description: null, category: "lampy", id: 34 },
  { lat: 50.132633, lng: 14.224092, name: "Lampa", description: null, category: "lampy", id: 35 },
  { lat: 50.132452, lng: 14.223862, name: "Lampa", description: null, category: "lampy", id: 36 },
  { lat: 50.132232, lng: 14.224346, name: "Lampa", description: null, category: "lampy", id: 37 },
  { lat: 50.132147, lng: 14.225015, name: "Lampa", description: null, category: "lampy", id: 38 },
  { lat: 50.132281, lng: 14.223662, name: "Lampa", description: null, category: "lampy", id: 39 },
  { lat: 50.132101, lng: 14.222946, name: "Lampa", description: null, category: "lampy", id: 40 },
  { lat: 50.132001, lng: 14.222607, name: "Lampa", description: null, category: "lampy", id: 41 },
  { lat: 50.131776, lng: 14.22183, name: "Lampa", description: null, category: "lampy", id: 42 },
  { lat: 50.131564, lng: 14.221154, name: "Lampa", description: null, category: "lampy", id: 43 },
  { lat: 50.131401, lng: 14.22157, name: "Lampa", description: null, category: "lampy", id: 44 },
  { lat: 50.131108, lng: 14.221686, name: "Lampa", description: null, category: "lampy", id: 45 },
  { lat: 50.130743, lng: 14.220386, name: "lampa", description: null, category: "lampy", id: 46 },
];

const fallbackZelene = [
  {
    name: "Zelený pás u potoka",
    description: "Travnatý úsek podél potoka",
    category: "zelen",
    type: "trava",
    lastMowed: "2024-05-18 10:00",
    frequency: "N/A",
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
    frequency: "N/A",
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
    frequency: "N/A",
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
    frequency: "N/A",
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
    name: "Záhon u lávky",
    description: "Křoviny a tráva okolo lávky u potoka",
    category: "zelen",
    type: "zahony",
    lastMowed: "2024-06-10 09:20",
    frequency: "N/A",
    coords: [
      [50.132615, 14.222558],
      [50.132711, 14.22247],
      [50.13272, 14.222498],
      [50.132718, 14.222527],
      [50.132711, 14.222541],
      [50.132711, 14.222561],
      [50.132705, 14.222572],
      [50.132697, 14.222578],
      [50.132685, 14.22259],
      [50.132672, 14.222592],
      [50.132657, 14.222586],
      [50.132648, 14.222584],
      [50.132638, 14.222581],
    ],
  },
  {
    name: "Pás u chodníku",
    description: "Úzký travnatý pás u pěší trasy",
    category: "zelen",
    type: "zahony",
    lastMowed: "2024-06-12 07:40",
    frequency: "N/A",
    coords: [
      [50.132461, 14.22237],
      [50.132433, 14.222372],
      [50.132422, 14.222378],
      [50.13241, 14.222391],
      [50.132383, 14.222409],
      [50.132377, 14.222433],
      [50.132439, 14.222466],
      [50.132483, 14.222458],
      [50.132495, 14.222432],
      [50.132487, 14.222409],
      [50.132477, 14.222392],
    ],
  },
  {
    name: "Okraj hřiště",
    description: "Tráva a nízké keře u sportoviště",
    category: "zelen",
    type: "trava",
    lastMowed: "2024-06-14 08:00",
    frequency: "N/A",
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
    frequency: "N/A",
    coords: [
      [50.129189, 14.221788],
      [50.128945, 14.221615],
      [50.12887, 14.221849],
      [50.129148, 14.22201],
    ],
  },
  {
    name: "Květinové záhony u návsi",
    description: "Pruh záhonů s trvalkami a keři",
    category: "zelen",
    type: "zahony",
    lastMowed: "2024-06-19 07:30",
    frequency: "N/A",
    coords: [
      [50.13232, 14.22274],
      [50.13229, 14.22263],
      [50.13224, 14.22262],
      [50.1322, 14.22271],
      [50.13224, 14.2228],
      [50.13229, 14.22282],
    ],
  },
];

let dataKose = [];
let dataKontejnery = [];
let dataLampy = [];
let dataKriminalita = [];
let kriminalitaTypes = {};
let kriminalitaRelevance = {};
let kriminalitaStates = {};
let dataZelene = [];
let dataZavady = [];

function ensureLampIds(lamps) {
  return lamps.map((lamp, index) => ({ ...lamp, id: lamp.id ?? index + 1 }));
}

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
  lastPickup: "12.01.2026",
  intervalDays: 14,
  contactEmail: "info@beloky.cz",
};


const floodThresholds = [
  { label: "SPA 1", value: 90, color: "#22c55e" },
  { label: "SPA 2", value: 100, color: "#facc15" },
  { label: "SPA 3", value: 120, color: "#f97316" },
];

// CSV snapshot (10 min interval) – hlavní zdroj pro graf i aktuální stav.
const streamCsvUrl = "https://trash-beloky.s3.eu-central-1.amazonaws.com/sensors/water_level.csv";
const streamCsvFallbackUrl = `${dataBaseUrl}/hladina.csv`;

const STREAM_MAX_WINDOW_HOURS = 12;
let streamHistory = [];
let streamHistoryTimes = [];
const streamState = {
  level: "Načítám…",
  updated: "Základní údaje",
  numeric: null,
  status: "Načítám…",
};

function unwrapCsvPayload(rawText = "") {
  const fenced = rawText.match(/```(?:csv)?\n([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }

  const jinastart = rawText.indexOf("# Title: ");
  if (jinastart === 0) {
    const firstFence = rawText.indexOf("```\n");
    if (firstFence !== -1) {
      return rawText.slice(firstFence + 4).trim();
    }
  }

  return rawText.trim();
}

function parseStreamCsv(csvText = "") {
  if (!csvText || typeof csvText !== 'string') {
    console.warn('parseStreamCsv: Neplatný vstup (očekává se string)');
    return [];
  }
  
  try {
    const unwrapped = unwrapCsvPayload(csvText);
    if (!unwrapped) {
      console.warn('parseStreamCsv: Prázdný obsah po unwrap');
      return [];
    }
    
    return unwrapped
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          const [ts, value] = line.split(";").map((p) => p.trim());
          const numeric = value ? Number(value.replace(",", ".")) : NaN;
          const parsedDate = ts ? Date.parse(ts.replace(" ", "T")) : NaN;
          
          return {
            ts: ts || '',
            date: Number.isFinite(parsedDate) ? new Date(parsedDate) : null,
            numeric: Number.isFinite(numeric) ? numeric : null,
          };
        } catch (err) {
          console.warn('Chyba při parsování řádku CSV hladiny:', err);
          return null;
        }
      })
      .filter((entry) => entry && entry.numeric != null);
  } catch (error) {
    console.error('Chyba při parsování CSV hladiny:', error);
    return [];
  }
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
  streamState.status = "Data přejímána z hladiny-vox.pwsplus.eu (#24470)";
}

async function fetchStreamCsv() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout pro externí zdroj
  
  try {
    const response = await fetch(streamCsvUrl, { 
      cache: "no-store", 
      mode: "cors",
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csv = await response.text();
    const parsed = parseStreamCsv(csv);
    
    if (!parsed.length) {
      throw new Error("Prázdný soubor water_level.csv nebo neplatný formát");
    }

    streamState.status = "Data přejímána z hladiny-vox.pwsplus.eu (#24470)";
    return parsed;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // If CORS error or network error, try fallback to local file
    const errorMessage = error.message || error.toString() || String(error);
    const errorName = error.name || '';
    
    // Detect CORS errors - they can appear as TypeError with fetch errors
    const isCorsError = errorMessage.includes('Access-Control-Allow-Origin') || 
                        errorMessage.includes('access control checks') ||
                        errorMessage.includes('CORS') ||
                        errorMessage.includes('Cross-Origin') ||
                        (error instanceof TypeError && (
                          errorMessage.includes('fetch') || 
                          errorMessage.includes('Failed to fetch') ||
                          errorMessage.includes('NetworkError')
                        ));
    
    if (isCorsError || error.name === 'AbortError') {
      // Silently try fallback to local file - don't log CORS errors if fallback works
      try {
        const fallbackController = new AbortController();
        const fallbackTimeout = setTimeout(() => fallbackController.abort(), 10000);
        
        const fallbackResponse = await fetch(streamCsvFallbackUrl, {
          cache: "no-store",
          signal: fallbackController.signal
        });
        clearTimeout(fallbackTimeout);
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback HTTP ${fallbackResponse.status}`);
        }
        
        const csv = await fallbackResponse.text();
        const parsed = parseStreamCsv(csv);
        
        if (parsed.length) {
          streamState.status = "Data z lokálního souboru (S3 CORS blokován)";
          // Successfully loaded from fallback - don't throw error
          return parsed;
        }
      } catch (fallbackError) {
        // Only log if fallback also fails
        console.warn("S3 CORS error a fallback také selhal:", errorMessage);
      }
    }
    
    // If all fails, throw original error
    if (error.name === 'AbortError') {
      throw new Error("Timeout při načítání dat hladiny (přes 15s)");
    } else if (error instanceof TypeError && (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch'))) {
      // This is likely a CORS or network error - try fallback silently
      throw new Error("Síťová chyba při načítání dat hladiny (zkontrolujte CORS nastavení S3)");
    } else {
      throw error;
    }
  }
}

async function loadStreamHistory() {
  try {
    const parsed = await fetchStreamCsv();
    setStreamHistory(parsed);
    return parsed;
  } catch (error) {
    console.warn("Chyba při načítání historie hladiny:", error);
    streamHistory = [];
    streamHistoryTimes = [];
    streamState.numeric = null;
    streamState.level = "Data nedostupná (CORS)";
    streamState.updated = "–";
    streamState.status = error.message && error.message.includes('CORS') 
      ? "CORS chyba - S3 bucket neumožňuje přístup z této domény"
      : "Nepodařilo se načíst data hladiny";
    return [];
  }
}

async function loadDataset(name, fallback = []) {
  const url = `${dataBaseUrl}/${name}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(url, { 
      cache: "no-store",
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const payload = await response.json();
    
    if (!Array.isArray(payload)) {
      console.warn(`Dataset ${name} není pole, používáme fallback data`);
      return fallback;
    }
    
    return payload;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.warn(`Timeout při načítání datasetu ${name} (${url})`);
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn(`Síťová chyba při načítání datasetu ${name} (${url}):`, error.message);
    } else {
      console.warn(`Nepodařilo se načíst dataset ${name} (${url}):`, error.message);
    }
    
    return fallback;
  }
}

function parseKoseTelemetry(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    console.warn('parseKoseTelemetry: Neplatný vstup (očekává se string)');
    return [];
  }
  
  try {
    const lines = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    
    if (!lines.length) {
      console.warn('parseKoseTelemetry: Prázdný CSV soubor');
      return [];
    }
    
    const header = lines.shift().split(",").map((h) => h.trim().toLowerCase());
    const idx = {
      id: header.indexOf("id"),
      fillLevel: header.indexOf("filllevel"),
      lastUpdated: header.indexOf("lastupdated"),
      batteryLevel: header.indexOf("batterylevel"),
    };

    const entries = lines
      .map((row) => {
        try {
          const cells = row.split(",").map((cell) => cell.trim());
          return {
            id: idx.id >= 0 ? cells[idx.id] : undefined,
            fillLevel: idx.fillLevel >= 0 ? Number(cells[idx.fillLevel]) : undefined,
            lastUpdated: idx.lastUpdated >= 0 ? cells[idx.lastUpdated] : undefined,
            batteryLevel: idx.batteryLevel >= 0 ? Number(cells[idx.batteryLevel]) : undefined,
          };
        } catch (err) {
          console.warn('Chyba při parsování řádku telemetrie:', err);
          return null;
        }
      })
      .filter((entry) => entry && entry.id);
    
    return entries;
  } catch (error) {
    console.error('Chyba při parsování telemetrie košů:', error);
    return [];
  }
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const response = await fetch(url, { 
      cache: "no-store",
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csv = await response.text();
    const parsed = parseKoseTelemetry(csv);
    
    if (!parsed.length) {
      console.warn('Telemetrie košů je prázdná, používáme fallback data');
      return fallbackKoseTelemetry;
    }
    
    return parsed;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.warn(`Timeout při načítání telemetrie košů (${url})`);
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn(`Síťová chyba při načítání telemetrie košů (${url}):`, error.message);
    } else {
      console.warn(`Nepodařilo se načíst telemetrii košů (${url}):`, error.message);
    }
    
    return fallbackKoseTelemetry;
  }
}

async function loadKriminalitaData() {
  try {
    const years = [2026, 2025];
    const aggregatedFeatures = [];
    let lastError = null;

    for (const year of years) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const feedUrl = `https://kriminalita.policie.gov.cz/api/v2/downloads/${year}_532070.geojson`;

      // Use CORS proxies directly - skip direct fetch to avoid CORS errors
      const proxyServices = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`
      ];

      let geojson = null;
      let error = null;

      // Try CORS proxies directly
      for (let i = 0; i < proxyServices.length; i++) {
          const proxyUrl = proxyServices[i];
          try {
            console.log(`Zkouším proxy ${i + 1}/${proxyServices.length}: ${proxyUrl.substring(0, 50)}...`);
            const proxyController = new AbortController();
            const proxyTimeoutId = setTimeout(() => proxyController.abort(), 20000);

            const proxyResponse = await fetch(proxyUrl, {
              signal: proxyController.signal,
              headers: {
                'Accept': 'application/geo+json, application/json, text/plain'
              }
            });

            clearTimeout(proxyTimeoutId);

            if (!proxyResponse.ok) {
              console.warn(`Proxy ${i + 1} vrátil HTTP ${proxyResponse.status}`);
              continue;
            }

            const text = await proxyResponse.text();
            if (text && text.length > 100) { // Basic validation
              try {
                // Try to parse as JSON
                const parsed = JSON.parse(text);
                // Validate it's actually GeoJSON
                if (parsed && (parsed.type === 'FeatureCollection' || parsed.features)) {
                  console.log(`Proxy ${i + 1} úspěšný! Načteno ${parsed.features?.length || 0} záznamů`);
                  geojson = parsed;
                  error = null;
                  break;
                } else {
                  console.warn(`Proxy ${i + 1} vrátil data, ale není to GeoJSON`);
                }
              } catch (parseError) {
                // If parsing fails, try to extract JSON from HTML response (some proxies wrap it)
                const jsonMatch = text.match(/\{[\s\S]*"type"\s*:\s*"FeatureCollection"[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    const extracted = JSON.parse(jsonMatch[0]);
                    if (extracted && (extracted.type === 'FeatureCollection' || extracted.features)) {
                      console.log(`Proxy ${i + 1} úspěšný (extrahováno z HTML)! Načteno ${extracted.features?.length || 0} záznamů`);
                      geojson = extracted;
                      error = null;
                      break;
                    }
                  } catch (e) {
                    console.warn(`Proxy ${i + 1} - chyba při parsování extrahovaného JSON:`, e);
                    continue;
                  }
                } else {
                  console.warn(`Proxy ${i + 1} - nelze extrahovat JSON z odpovědi`);
                }
                continue;
              }
            } else {
              console.warn(`Proxy ${i + 1} vrátil příliš krátkou odpověď (${text?.length || 0} znaků)`);
            }
          } catch (proxyError) {
            console.warn(`Proxy ${i + 1} selhal:`, proxyError.message);
            continue;
          }
      }

      clearTimeout(timeoutId);

      if (!geojson) {
        lastError = error;
        continue;
      }

      if (geojson && geojson.features) {
        aggregatedFeatures.push(...geojson.features);
      }
    }

    if (!aggregatedFeatures.length) {
      const errorMsg = lastError?.message || 'Neznámá chyba';

      // Log detailed error for debugging
      console.error('Kriminalita data loading failed:', {
        error: errorMsg,
        triedYears: years.length
      });

      throw new Error(`Nepodařilo se načíst data kriminality přes proxy: ${errorMsg}`);
    }

    dataKriminalita = aggregatedFeatures.map(feature => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [];
      return {
        id: props.id,
        lat: coords[1],
        lng: coords[0],
        date: props.date ? new Date(props.date) : null,
        state: props.state,
        relevance: props.relevance,
        types: props.types || [],
        mp: props.mp || false,
        category: 'kriminalita'
      };
    });

    return dataKriminalita;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout při načítání dat kriminality (15s)');
    }
    throw error;
  }
}

async function loadKriminalitaCodebooks() {
  // Initialize as empty objects if not already initialized
  if (typeof kriminalitaTypes === 'undefined' || !kriminalitaTypes) {
    kriminalitaTypes = {};
  }
  if (typeof kriminalitaRelevance === 'undefined' || !kriminalitaRelevance) {
    kriminalitaRelevance = {};
  }
  if (typeof kriminalitaStates === 'undefined' || !kriminalitaStates) {
    kriminalitaStates = {};
  }
  
  try {
    const [typesRes, relevanceRes, statesRes] = await Promise.allSettled([
      fetch(`${dataBaseUrl}/types.json`).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))),
      fetch(`${dataBaseUrl}/relevance.json`).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))),
      fetch(`${dataBaseUrl}/states.json`).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
    ]);
    
    if (typesRes.status === 'fulfilled' && typesRes.value?.polozky) {
      typesRes.value.polozky.forEach(item => {
        kriminalitaTypes[item.kod] = item;
      });
    }
    
    if (relevanceRes.status === 'fulfilled' && relevanceRes.value?.polozky) {
      relevanceRes.value.polozky.forEach(item => {
        kriminalitaRelevance[item.kod] = item;
      });
    }
    
    if (statesRes.status === 'fulfilled' && statesRes.value?.polozky) {
      statesRes.value.polozky.forEach(item => {
        kriminalitaStates[item.kod] = item;
      });
    }
  } catch (error) {
    console.warn('Chyba při načítání číselníků kriminality:', error);
  }
}

async function loadAllData() {
  try {
    // Initialize kriminalita as empty array to indicate it's being loaded
    dataKriminalita = [];
    
    // Load kriminalita asynchronously in background - don't block app initialization
    // It will be loaded separately after the main app is ready
    const [koseDefinitions, koseTelemetry, lampy, kontejnery, zelene, _streamHistory] = await Promise.allSettled([
      loadDataset("kose", fallbackKoseDefinitions),
      loadKoseTelemetry(),
      loadDataset("lampy", fallbackLampy),
      loadDataset("kontejnery", fallbackKontejnery),
      loadDataset("zelene", fallbackZelene),
      loadStreamHistory(),
    ]);

    // Extract values from settled promises, use fallback on rejection
    const getValue = (result, fallback) => result.status === 'fulfilled' ? result.value : fallback;
    
    dataKose = mergeKose(
      getValue(koseDefinitions, fallbackKoseDefinitions),
      getValue(koseTelemetry, fallbackKoseTelemetry)
    );
    dataLampy = ensureLampIds(getValue(lampy, fallbackLampy));
    dataKontejnery = getValue(kontejnery, fallbackKontejnery);
    dataZelene = getValue(zelene, fallbackZelene);
    // Note: dataKriminalita will be loaded asynchronously after app initialization
    
    // Log any failures
    [koseDefinitions, koseTelemetry, lampy, kontejnery, zelene, _streamHistory].forEach((result, index) => {
      if (result.status === 'rejected') {
        const names = ['kose', 'kose_telemetry', 'lampy', 'kontejnery', 'zelene', 'streamHistory'];
        console.warn(`Chyba při načítání ${names[index]}:`, result.reason);
      }
    });
    
  } catch (error) {
    console.error('Kritická chyba při načítání dat:', error);
    // Use all fallbacks as last resort
    dataKose = mergeKose(fallbackKoseDefinitions, fallbackKoseTelemetry);
    dataLampy = ensureLampIds(fallbackLampy);
    dataKontejnery = fallbackKontejnery;
    dataZelene = fallbackZelene;
    dataKriminalita = [];
  }
}

// Load kriminalita data asynchronously in background (non-blocking)
async function loadKriminalitaDataAsync() {
  try {
    console.log('Začínám asynchronní načítání dat kriminality...');
    const kriminalitaData = await loadKriminalitaData();
    
    // Load codebooks for kriminalita
    try {
      await loadKriminalitaCodebooks();
      console.log('Číselníky kriminality načteny:', {
        types: Object.keys(kriminalitaTypes).length,
        states: Object.keys(kriminalitaStates).length,
        relevance: Object.keys(kriminalitaRelevance).length
      });
    } catch (codebookError) {
      console.warn('Chyba při načítání číselníků kriminality:', codebookError);
    }
    
    // Log success for debugging
    if (kriminalitaData && kriminalitaData.length > 0) {
      console.log(`Kriminalita data načtena asynchronně: ${kriminalitaData.length} záznamů`);
    } else {
      console.warn('Kriminalita data nejsou k dispozici (prázdné nebo chyba)');
    }
    
    // Trigger re-render if kriminalita view is currently active
    if (typeof renderKriminalita === 'function') {
      renderKriminalita();
    }
    
    return kriminalitaData;
  } catch (error) {
    console.error('Chyba při asynchronním načítání dat kriminality:', error);
    dataKriminalita = [];
    
    // Still trigger render to show error state
    if (typeof renderKriminalita === 'function') {
      renderKriminalita();
    }
    
    return [];
  }
}

// Transform API issue format to application format
function transformIssueToZavada(issue) {
  // Use category name directly from API
  const category = issue.issueCategory?.name || 'Ostatní';
  
  // Convert date from "2025-12-22 11:46:27" to ISO format
  const convertDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    // Format: "2025-12-22 11:46:27" -> "2025-12-22T11:46:27Z"
    const isoStr = dateStr.replace(' ', 'T') + 'Z';
    return isoStr;
  };
  
  // Extract photos from files array
  const photos = (issue.files || []).map(file => file.url || file.thumbnail_url).filter(Boolean);
  
  // Determine resolved status
  const resolved = issue.status !== 'new' && issue.status !== 'open';
  const resolvedDate = resolved ? convertDate(issue.updated_at) : null;
  
  return {
    id: issue.id,
    lat: parseFloat(issue.gps_lat) || null,
    lng: parseFloat(issue.gps_lng) || null,
    reported_date: convertDate(issue.created_at),
    description: issue.description || 'Bez popisu',
    category: category,
    status: issue.status || 'new', // Store original status from API
    resolved: resolved,
    resolved_date: resolvedDate,
    email: null,
    photos: photos
  };
}

async function loadZavadyData() {
  try {
    // Load from new API endpoint
    const zavadyUrl = "https://trash-beloky.s3.eu-central-1.amazonaws.com/sensors/issues.json";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch(zavadyUrl, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      console.error('Zavady soubor je prázdný!');
      throw new Error('Soubor je prázdný');
    }
    
    const payload = JSON.parse(text);
    console.log('Načtená data závad z API:', payload);
    
    // Extract issues from GraphQL response structure
    let issues = [];
    if (payload?.data?.myIssues?.data && Array.isArray(payload.data.myIssues.data)) {
      issues = payload.data.myIssues.data;
    } else {
      console.warn('Zavady data nemají očekávanou strukturu');
      throw new Error('Neplatná struktura dat');
    }
    
    // Transform issues to application format
    const transformedZavady = issues.map(issue => transformIssueToZavada(issue))
      .filter(zavada => zavada.lat !== null && zavada.lng !== null); // Filter out items without coordinates
    
    // Get last updated time from meta.generated_at
    let lastUpdated = null;
    if (payload?.meta?.generated_at) {
      // Use meta.generated_at as the source of truth for when the file was generated
      lastUpdated = new Date(payload.meta.generated_at);
    }
    
    console.log('Transformované závady, počet:', transformedZavady.length);
    console.log('Poslední aktualizace:', lastUpdated);
    
    dataZavady = transformedZavady;
    return {
      zavady: transformedZavady,
      lastUpdated: lastUpdated
    };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Timeout při načítání dat závad z API');
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Síťová chyba při načítání dat závad z API');
    } else {
      console.error('Chyba při načítání dat závad z API:', error.message);
    }
    
    dataZavady = [];
    return {
      zavady: [],
      lastUpdated: null
    };
  }
}

function showMapError(message) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;
  mapContainer.innerHTML = `<div class="map-error">${message}</div>`;
}

