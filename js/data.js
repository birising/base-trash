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
    name: "Záhon u lávky",
    description: "Křoviny a tráva okolo lávky u potoka",
    category: "zelen",
    type: "zahony",
    lastMowed: "2024-06-10 09:20",
    frequency: "1× za 2 týdny",
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
    frequency: "1× za 2 týdny",
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
    name: "Květinové záhony u návsi",
    description: "Pruh záhonů s trvalkami a keři",
    category: "zelen",
    type: "zahony",
    lastMowed: "2024-06-19 07:30",
    frequency: "1× týdně péče o záhony",
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
let dataZelene = [];

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
2025-11-26 00:00:00;24
2025-11-26 00:10:00;24
2025-11-26 00:20:00;24
2025-11-26 00:30:00;24
2025-11-26 00:40:00;25
2025-11-26 00:50:00;25
2025-11-26 01:00:00;26
2025-11-26 01:10:00;25
2025-11-26 01:20:00;25
2025-11-26 01:30:00;25
2025-11-26 01:40:00;25
2025-11-26 01:50:00;26
2025-11-26 02:00:00;25
2025-11-26 02:10:00;25
2025-11-26 02:20:00;26
2025-11-26 02:30:00;26
2025-11-26 02:40:00;26
2025-11-26 02:50:00;26
2025-11-26 03:00:00;26
2025-11-26 03:10:00;25
2025-11-26 03:20:00;26
2025-11-26 03:30:00;26
2025-11-26 03:40:00;26
2025-11-26 03:50:00;25
2025-11-26 04:00:00;26
2025-11-26 04:10:00;26
2025-11-26 04:20:00;25
2025-11-26 04:30:00;25
2025-11-26 04:40:00;26
2025-11-26 04:50:00;25
2025-11-26 05:00:00;26
2025-11-26 05:10:00;25
2025-11-26 05:20:00;25
2025-11-26 05:30:00;25
2025-11-26 05:40:00;24
2025-11-26 05:50:00;25
2025-11-26 06:00:00;25
2025-11-26 06:10:00;24
2025-11-26 06:20:00;24
2025-11-26 06:30:00;24
2025-11-26 06:40:00;24
2025-11-26 06:50:00;23
2025-11-26 07:00:00;23
2025-11-26 07:10:00;23
2025-11-26 07:20:00;22
2025-11-26 07:30:00;22
2025-11-26 07:40:00;22
2025-11-26 07:50:00;22
2025-11-26 08:00:00;23
2025-11-26 08:10:00;22
2025-11-26 08:20:00;22
2025-11-26 08:30:00;22
2025-11-26 08:40:00;22
2025-11-26 08:50:00;23
2025-11-26 09:00:00;22
2025-11-26 09:10:00;22
2025-11-26 09:20:00;22
2025-11-26 09:30:00;22
2025-11-26 09:40:00;22
2025-11-26 09:50:00;22
2025-11-26 10:00:00;23
2025-11-26 10:10:00;22
2025-11-26 10:20:00;22
2025-11-26 10:30:00;23
2025-11-26 10:40:00;23
2025-11-26 10:50:00;23
2025-11-26 11:00:00;22
2025-11-26 11:10:00;22
2025-11-26 11:20:00;23
2025-11-26 11:30:00;23
2025-11-26 11:40:00;23
2025-11-26 11:50:00;24
2025-11-26 12:00:00;24
2025-11-26 12:10:00;23
2025-11-26 12:20:00;24
2025-11-26 12:30:00;24
2025-11-26 12:40:00;25
2025-11-26 12:50:00;24
2025-11-26 13:00:00;24
2025-11-26 13:10:00;24
2025-11-26 13:20:00;25
2025-11-26 13:30:00;25
2025-11-26 13:40:00;25
2025-11-26 13:50:00;26
2025-11-26 14:00:00;25
2025-11-26 14:10:00;25
2025-11-26 14:20:00;26
2025-11-26 14:30:00;26
2025-11-26 14:40:00;25
2025-11-26 14:50:00;25
2025-11-26 15:00:00;25
2025-11-26 15:10:00;26
2025-11-26 15:20:00;26
2025-11-26 15:30:00;26
2025-11-26 15:40:00;25
2025-11-26 15:50:00;26
2025-11-26 16:00:00;27
2025-11-26 16:10:00;26
2025-11-26 16:20:00;27
2025-11-26 16:30:00;26
2025-11-26 16:40:00;25
2025-11-26 16:50:00;26
2025-11-26 17:00:00;26
2025-11-26 17:10:00;26
2025-11-26 17:20:00;25
2025-11-26 17:30:00;25
2025-11-26 17:40:00;25
2025-11-26 17:50:00;25
2025-11-26 18:00:00;25
2025-11-26 18:10:00;25
2025-11-26 18:20:00;25
2025-11-26 18:30:00;24
2025-11-26 18:40:00;24
2025-11-26 18:50:00;24
2025-11-26 19:00:00;24
2025-11-26 19:10:00;24
2025-11-26 19:20:00;23
2025-11-26 19:30:00;24
2025-11-26 19:40:00;23
2025-11-26 19:50:00;23
2025-11-26 20:00:00;23
2025-11-26 20:10:00;23
2025-11-26 20:20:00;23
2025-11-26 20:30:00;23
2025-11-26 20:40:00;22
2025-11-26 20:50:00;22
2025-11-26 21:00:00;22
2025-11-26 21:10:00;23
2025-11-26 21:20:00;23
2025-11-26 21:30:00;23
2025-11-26 21:40:00;22
2025-11-26 21:50:00;21
2025-11-26 22:00:00;23
2025-11-26 22:10:00;23
2025-11-26 22:20:00;21
2025-11-26 22:30:00;22
2025-11-26 22:40:00;22
2025-11-26 22:50:00;23
2025-11-26 23:00:00;23
2025-11-26 23:10:00;22
2025-11-26 23:20:00;22
2025-11-26 23:30:00;23
2025-11-26 23:40:00;22
2025-11-26 23:50:00;23
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
  dataLampy = ensureLampIds(lampy);
  dataKontejnery = kontejnery;
  dataZelene = zelene;
}

function showMapError(message) {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;
  mapContainer.innerHTML = `<div class="map-error">${message}</div>`;
}

