window.addEventListener("DOMContentLoaded", async () => {
  if (typeof loadIncludes === "function") {
    await loadIncludes();
  }

  const themePreferenceKey = "appTheme";
  const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  let themeToggleButton;

  const updateThemeToggle = (theme) => {
    if (!themeToggleButton) return;
    const isDark = theme === "dark";
    themeToggleButton.setAttribute("aria-pressed", String(isDark));
    themeToggleButton.setAttribute("aria-checked", String(isDark));
    themeToggleButton.dataset.theme = theme;
    themeToggleButton.classList.toggle("theme-toggle-active", isDark);
  };

  const applyTheme = (theme, { persist = true } = {}) => {
    const normalized = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", normalized);
    document.documentElement.style.setProperty("--color-scheme", normalized);
    document.body.classList.toggle("theme-light", normalized === "light");
    document.body.classList.toggle("theme-dark", normalized === "dark");
    if (persist) {
      localStorage.setItem(themePreferenceKey, normalized);
    }
    updateThemeToggle(normalized);
  };

  const resolveTheme = () => {
    const stored = localStorage.getItem(themePreferenceKey);
    if (stored === "light" || stored === "dark") return stored;
    return themeMediaQuery.matches ? "dark" : "light";
  };

  const setupThemeToggle = () => {
    themeToggleButton = document.getElementById("themeToggle");
    if (!themeToggleButton) {
      applyTheme(resolveTheme(), { persist: false });
      return;
    }

    // No longer need label/icon references for new toggle design

    applyTheme(resolveTheme(), { persist: false });

    themeToggleButton.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
    });

    themeMediaQuery.addEventListener("change", (event) => {
      if (localStorage.getItem(themePreferenceKey)) return;
      applyTheme(event.matches ? "dark" : "light", { persist: false });
    });
  };

  setupThemeToggle();

  const ensureLeaflet = async () => {
    if (window.L) return true;
    try {
      await new Promise((resolve, reject) => {
        const fallback = document.createElement("script");
        fallback.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
        fallback.onload = resolve;
        fallback.onerror = reject;
        document.head.appendChild(fallback);
      });
      return !!window.L;
    } catch (error) {
      console.warn("Nepodařilo se načíst záložní Leaflet", error);
      return false;
    }
  };

  const leafletReady = await ensureLeaflet();
  if (!leafletReady) {
    showMapError("Mapový modul se nepodařilo načíst. Zkuste obnovit stránku.");
    return;
  }

  await loadAllData();

  let mapContainer = document.getElementById("map");
  if (!mapContainer) {
    // Fallback, pokud se fragmenty nenačetly – vytvoříme minimální kontejner pro mapu.
    const mapView = document.getElementById("mapView") || document.querySelector(".content");
    mapContainer = document.createElement("div");
    mapContainer.id = "map";
    mapContainer.setAttribute("aria-label", "Mapa údržby obce Běloky");
    if (mapView) {
      mapView.classList.add("view", "map-view");
      mapView.appendChild(mapContainer);
    } else {
      const fallbackWrap = document.createElement("div");
      fallbackWrap.id = "mapView";
      fallbackWrap.className = "view map-view";
      fallbackWrap.appendChild(mapContainer);
      document.body.appendChild(fallbackWrap);
    }
  }

  const map = L.map("map", {
    zoomControl: false,
    attributionControl: false,
  });

  let baseLayer;
  try {
    baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap přispěvatelé",
      errorTileUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='256' height='256' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENačítám...%3C/text%3E%3C/svg%3E",
    });
    baseLayer.addTo(map);
    
    // Handle tile loading errors silently - errorTileUrl already provides fallback
    // Don't spam console with tile errors as they're common and handled gracefully
    baseLayer.on('tileerror', () => {
      // Silently handle - errorTileUrl will show fallback image
    });
  } catch (error) {
    console.error("Chyba při vytváření mapových dlaždic:", error);
  }

  const defaultView = [50.1322, 14.222];
  map.setView(defaultView, 16);

  map.whenReady(() => {
    refreshMapSize(0);
    // Ensure map is properly initialized even if hidden
    if (map) {
      map.invalidateSize();
    }
  });

  function refreshMapSize(delay = 120) {
    if (!map) return;
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, delay);
  }

  const iconColors = {
    kose: "#1b8a63",
    lampy: "#f28c38",
    kontejnery: "#4ab7ff",
    kriminalita: "#ef4444",
    zelenTrava: "#0ea5e9",
    zelenZahony: "#ec4899",
    hladina: "#7c3aed",
    odpad: "#67e8f9",
  };

  const greenspaceStyles = {
    trava: {
      color: "#0284c7",
      weight: 3,
      fillColor: "#38bdf8",
      fillOpacity: 0.45,
      dashArray: "10 6",
      lineJoin: "round",
    },
    zahony: {
      color: "#db2777",
      weight: 3,
      fillColor: "#f472b6",
      fillOpacity: 0.5,
      dashArray: "8 5",
      lineJoin: "round",
    },
  };

  const iconSymbols = {
    kose: { emoji: "🗑️", label: "Koš" },
    lampy: { emoji: "💡", label: "Lampa" },
  };

  const iconSizes = {
    kose: { size: [42, 46], anchor: [21, 44], popup: [0, -34] },
    lampy: { size: [26, 30], anchor: [13, 28], popup: [0, -24] },
    kriminalita: { size: [28, 32], anchor: [14, 30], popup: [0, -26] },
  };

  const layers = {
    kose: L.layerGroup(),
    lampy: L.layerGroup(),
    kontejnery: L.layerGroup(),
    zelenTrava: L.layerGroup(),
    zelenZahony: L.layerGroup(),
    hladina: L.layerGroup(),
    odpad: L.layerGroup(),
    kriminalita: L.layerGroup(),
  };
  
  // Store marker references by category and ID/coordinates for deep linking
  const markerMap = {
    kose: new Map(),
    lampy: new Map(),
    kontejnery: new Map(),
    kriminalita: new Map(),
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
  const greenspaceLayersControl = document.getElementById("greenspaceLayers");
  const greenspaceLayerInputs = greenspaceLayersControl
    ? greenspaceLayersControl.querySelectorAll("[data-greenspace-layer]")
    : [];
  // Get DOM elements - must be after includes are loaded
  const mapView = document.getElementById("mapView");
  const streamView = document.getElementById("streamView");
  const wasteView = document.getElementById("wasteView");
  const hasiciView = document.getElementById("hasiciView");
  const hasiciList = document.getElementById("hasiciList");
  const kriminalitaView = document.getElementById("kriminalitaView");
  const kriminalitaList = document.getElementById("kriminalitaList");

  const mapCategories = ["kose", "lampy", "kontejnery", "zelen"];

  const greenspaceVisibility = { trava: true, zahony: true };
  let currentCategory = null;
  const DEFAULT_CATEGORY = "kose";

  const backButton = document.getElementById("backButton");
  const brandLogo = document.getElementById("brandLogo");

  const BIN_THRESHOLDS = {
    full: 85,
    batteryLow: 15,
    staleHours: 24,
  };

  function formatRelativeTime(value) {
    const ts = Date.parse(value || "");
    if (!Number.isFinite(ts)) return "neznámé";
    const diff = Date.now() - ts;
    if (diff < 0) return "před chvílí";

    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "před pár sekundami";
    if (minutes < 60) return `před ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 48) {
      const minsText = remainingMinutes ? ` ${remainingMinutes} min` : "";
      return `před ${hours} h${minsText}`;
    }

    const days = Math.floor(hours / 24);
    return `před ${days} dny`;
  }

  function formatAbsoluteDate(value) {
    const ts = Date.parse(value || "");
    if (!Number.isFinite(ts)) return "–";
    return new Date(ts).toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function evaluateBinStatus(item) {
    const now = Date.now();
    const updatedMs = Date.parse(item.lastUpdated || "");
    const hoursSinceUpdate = Number.isFinite(updatedMs) ? (now - updatedMs) / (1000 * 60 * 60) : Infinity;
    const isStale = hoursSinceUpdate > BIN_THRESHOLDS.staleHours;
    const isFull = typeof item.fillLevel === "number" && item.fillLevel >= BIN_THRESHOLDS.full;
    const lowBattery = typeof item.batteryLevel === "number" && item.batteryLevel < BIN_THRESHOLDS.batteryLow;

    const states = [];
    if (isStale) states.push({ text: "Bez spojení >24 h", tone: "critical" });
    if (isFull) states.push({ text: "Plný koš", tone: "warning" });
    if (lowBattery) states.push({ text: "Baterie < 15 %", tone: "warning" });
    if (!states.length) states.push({ text: "V pořádku", tone: "ok" });

    const severity = states.some((s) => s.tone === "critical")
      ? "critical"
      : states.some((s) => s.tone === "warning")
        ? "warning"
        : "ok";

    const color = severity === "critical" ? "#ef4444" : severity === "warning" ? "#f97316" : iconColors.kose;

    return {
      color,
      severity,
      labels: states.map((s) => s.text),
      states,
    };
  }

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

    // If today is a pickup day, return today
    if (next.getTime() === ref.getTime()) {
      return ref;
    }

    // Otherwise, find the next pickup date after today
    while (next < ref) {
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

  function renderStreamChart(latestValue = null, latestTime = null) {
    const chart = document.getElementById("levelChart");
    if (!chart) return;

    const values = [...streamHistory];
    const times = streamHistoryTimes.map((t) => (t instanceof Date && Number.isFinite(t.getTime()) ? t : null));
    const normalizedLatest = latestValue != null ? latestValue : streamState.numeric;
    if (normalizedLatest != null) {
      values.push(normalizedLatest);
      times.push(latestTime instanceof Date && Number.isFinite(latestTime.getTime()) ? latestTime : new Date());
    }

    let latestTimestamp = null;
    for (let i = times.length - 1; i >= 0; i -= 1) {
      const candidate = times[i];
      if (candidate instanceof Date && Number.isFinite(candidate.getTime())) {
        latestTimestamp = candidate;
        break;
      }
    }

    const cutoff = latestTimestamp ? latestTimestamp.getTime() - STREAM_MAX_WINDOW_HOURS * 60 * 60 * 1000 : null;
    const filteredValues = [];
    const filteredTimes = [];
    values.forEach((val, idx) => {
      const t = times[idx];
      if (cutoff && t instanceof Date && Number.isFinite(t.getTime()) && t.getTime() < cutoff) return;
      filteredValues.push(val);
      filteredTimes.push(t);
    });

    const series = filteredValues.length ? filteredValues : values;
    const seriesTimes = filteredTimes.length ? filteredTimes : times;

    if (!series.length) {
      chart.innerHTML = "";
      return;
    }

    const width = 720;
    const height = 320;
    const paddingLeft = 48;
    const paddingRight = 118;
    const paddingY = 36;

    const thresholdValues = floodThresholds.map((t) => t.value);
    const minVal = Math.min(...series, ...thresholdValues) - 4;
    const maxVal = Math.max(...series, ...thresholdValues) + 6;
    const range = Math.max(maxVal - minVal, 1);

    const startTime = seriesTimes.find((t) => t instanceof Date && Number.isFinite(t.getTime()));
    const endTime = latestTimestamp || startTime;
    const totalSpan = startTime && endTime ? Math.max(endTime.getTime() - startTime.getTime(), 1) : series.length;

    const points = series.map((val, idx) => {
      const t = seriesTimes[idx];
      const ratio = startTime && endTime && t instanceof Date && Number.isFinite(t.getTime())
        ? Math.max(0, Math.min(1, (t.getTime() - startTime.getTime()) / totalSpan))
        : (series.length === 1 ? 0 : idx / (series.length - 1));
      const x = paddingLeft + ratio * (width - paddingLeft - paddingRight);
      const y = height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
      return { x, y, idx };
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const areaD = `${pathD} L${points.at(-1).x},${height - paddingY} L${points[0].x},${height - paddingY} Z`;

    const gridLines = [0.25, 0.5, 0.75]
      .map((ratio) => {
        const y = paddingY + (height - paddingY * 2) * ratio;
        return `<line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="chart-grid" />`;
      })
      .join("");

    const tickCount = Math.min(6, points.length);
    const tickIndices = new Set();
    for (let i = 0; i < tickCount; i += 1) {
      tickIndices.add(Math.round((i / (tickCount - 1 || 1)) * (points.length - 1)));
    }
    const ticks = points
      .map((p, idx) => {
        if (!tickIndices.has(idx)) return "";
        const t = seriesTimes[idx];
        const label =
          t instanceof Date && Number.isFinite(t.getTime())
            ? t.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
            : idx === points.length - 1
              ? "Nyní"
              : `-${points.length - 1 - idx}h`;
        return `<text x="${p.x}" y="${height - paddingY + 16}" class="chart-label">${label}</text>`;
      })
      .join("");

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
      ${ticks}
      <text x="${points.at(-1).x}" y="${points.at(-1).y - 12}" class="chart-value">${series.at(-1)} cm</text>
    `;
  }

  function buildIcon(category, colorOverride, options = {}) {
    const symbol = iconSymbols[category];
    if (!symbol) return null;
    const { badge, text } = options;
    const sizing = iconSizes[category] || { size: [40, 44], anchor: [20, 42], popup: [0, -32] };
    const color = colorOverride || iconColors[category];
    return L.divIcon({
      className: `marker-wrapper marker-${category}`,
      html: `
        <div class="marker-icon marker-${category}" style="--marker-color:${color}">
          <span class="marker-emoji">${symbol.emoji}</span>
          <span class="marker-label">${text ?? symbol.label}</span>
          ${badge ? `<span class="marker-badge">${badge}</span>` : ""}
        </div>
      `,
      iconSize: sizing.size,
      iconAnchor: sizing.anchor,
      popupAnchor: sizing.popup,
    });
  }

  function createMarker(item, color) {
    const { lat, lng, name } = item;
    let popupTitle = name;
    if (item.category === "lampy" && item.id != null) {
      popupTitle = `Lampa #${item.id}`;
    } else if (item.category === "kriminalita") {
      try {
        const typeNames = item.types && item.types.length > 0 
          ? item.types.map(code => {
              const type = (typeof kriminalitaTypes !== 'undefined' && kriminalitaTypes && kriminalitaTypes[code]) ? kriminalitaTypes[code] : null;
              return type?.popis?.cs || type?.nazev?.cs || `Typ ${code}`;
            }).join(', ')
          : 'Trestný čin';
        popupTitle = typeNames;
      } catch (e) {
        popupTitle = 'Trestný čin';
      }
    }
    const useIcon = item.category === "kose" || item.category === "lampy" || item.category === "kriminalita";
    const binStatus = item.category === "kose" ? evaluateBinStatus(item) : null;
    const marker = useIcon
      ? L.marker([lat, lng], {
          icon: buildIcon(item.category, binStatus?.color || color, {
            badge: item.category === "lampy" ? item.id : undefined,
            text: item.category === "lampy" ? null : (item.category === "kriminalita" ? null : undefined),
          }),
        })
      : L.circleMarker([lat, lng], {
          radius: 8,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.85,
        });

    let popupContent = `<strong>${popupTitle}</strong>`;
    if (item.category === "kose") {
      const status = binStatus || evaluateBinStatus(item);
      const fill = item.fillLevel != null ? `${item.fillLevel}%` : "–";
      const battery = item.batteryLevel != null ? `${item.batteryLevel}%` : "–";
      const updatedRelative = formatRelativeTime(item.lastUpdated);
      const updatedAbsolute = formatAbsoluteDate(item.lastUpdated);
      const statusBadges = status.states
        .map((state) => `<span class="status-chip status-${state.tone}">${state.text}</span>`)
        .join("");
      popupContent += `
        <div class="popup-details">
          <div><span>Naplněnost:</span><strong>${fill}</strong></div>
          <div><span>Poslední aktualizace:</span><strong>${updatedRelative}</strong></div>
          <div class="popup-subtext">${updatedAbsolute}</div>
          <div><span>Stav baterie:</span><strong>${battery}</strong></div>
        </div>
        <div class="popup-status popup-${status.severity}">
          <div class="status-chip-row">${statusBadges}</div>
        </div>`;
    } else if (item.category === "lampy") {
      const subject = encodeURIComponent(`Porucha lampy – ${popupTitle}`);
      
      // GPS souřadnice
      const gpsCoords = `${item.lat}, ${item.lng}`;
      
      // Odkaz do aplikace s konkrétní lampou
      const appUrl = item.id != null 
        ? `${window.location.origin}${window.location.pathname}#lampy/${item.id}`
        : `${window.location.origin}${window.location.pathname}#lampy/${item.lat},${item.lng}`;
      
      // Tělo emailu s GPS souřadnicemi a odkazem do aplikace
      const bodyText = `Popište závadu a případně přidejte fotku. Děkujeme!

GPS souřadnice: ${gpsCoords}
Odkaz do aplikace: ${appUrl}`;
      const body = encodeURIComponent(bodyText);
      
      // Email s CC
      const emailTo = "oubelokykancelar@seznam.cz";
      const emailCc = "oubeloky@seznam.cz";
      
      popupContent += `
        <div class="popup-details">
          <div><span>Stav:</span><strong>Potřebuje ověření?</strong></div>
        </div>
        <div class="popup-actions">
          <a class="popup-button" href="mailto:${emailTo}?cc=${emailCc}&subject=${subject}&body=${body}">Nahlásit závadu</a>
        </div>`;
    } else if (item.category === "hladina") {
      const levelText = streamState.level ? `${streamState.level}` : "Načítám…";
      const updatedText = streamState.updated || "–";
      popupContent += `
        <div class="popup-details">
          <div><span>Úroveň vody:</span><strong>${levelText}</strong></div>
          <div><span>Poslední data:</span><strong>${updatedText}</strong></div>
        </div>`;
    } else if (item.category === "kriminalita") {
      const formatDate = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '–';
        return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      };
      
      const getTypeNames = (typeCodes) => {
        if (!typeCodes || !Array.isArray(typeCodes) || typeCodes.length === 0) return ['Neznámý typ'];
        try {
          return typeCodes.map(code => {
            const type = (typeof kriminalitaTypes !== 'undefined' && kriminalitaTypes && kriminalitaTypes[code]) ? kriminalitaTypes[code] : null;
            return type?.popis?.cs || type?.nazev?.cs || `Typ ${code}`;
          });
        } catch (e) {
          return typeCodes.map(code => `Typ ${code}`);
        }
      };
      
      const getStateName = (stateCode) => {
        try {
          const state = (typeof kriminalitaStates !== 'undefined' && kriminalitaStates && kriminalitaStates[stateCode]) ? kriminalitaStates[stateCode] : null;
          return state?.nazev?.cs || `Stav ${stateCode}`;
        } catch (e) {
          return `Stav ${stateCode}`;
        }
      };
      
      const getRelevanceName = (relevanceCode) => {
        try {
          const relevance = (typeof kriminalitaRelevance !== 'undefined' && kriminalitaRelevance && kriminalitaRelevance[relevanceCode]) ? kriminalitaRelevance[relevanceCode] : null;
          return relevance?.nazev?.cs || `Relevance ${relevanceCode}`;
        } catch (e) {
          return `Relevance ${relevanceCode}`;
        }
      };
      
      const dateStr = formatDate(item.date);
      const typeNames = getTypeNames(item.types);
      const stateName = getStateName(item.state);
      const relevanceName = getRelevanceName(item.relevance);
      
      popupContent += `
        <div class="popup-details">
          <div><span>Datum:</span><strong>${dateStr}</strong></div>
          <div><span>Stav:</span><strong>${stateName}</strong></div>
          <div><span>Relevance:</span><strong>${relevanceName}</strong></div>
          <div><span>Typ:</span><strong>${typeNames.join(', ')}</strong></div>
          ${item.mp ? '<div><span>Místní působnost:</span><strong>Ano</strong></div>' : ''}
        </div>
        <div class="popup-actions">
          <a class="popup-button" href="https://kriminalita.policie.gov.cz" target="_blank" rel="noopener">Zdroj dat →</a>
        </div>`;
    }

    marker.bindPopup(popupContent);
    return marker;
  }

  function createPolygon(area, color, style) {
    const baseStyle = style || greenspaceStyles.trava;
    const polygon = L.polygon(area.coords, { ...baseStyle, color: color || baseStyle.color });

    // Calculate center of polygon for GPS coordinates
    const centerLat = area.coords.reduce((sum, coord) => sum + coord[0], 0) / area.coords.length;
    const centerLng = area.coords.reduce((sum, coord) => sum + coord[1], 0) / area.coords.length;
    const gpsCoords = `${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`;
    
    // Create deep link to app with greenspace area (using center coordinates)
    const appUrl = `${window.location.origin}${window.location.pathname}#zelen/${centerLat.toFixed(6)},${centerLng.toFixed(6)}`;
    
    const subject = encodeURIComponent(`Údržba zeleně – ${area.name}`);
    const bodyText = `Prosím o prověření plochy: ${area.name}. Potřeba posekat / ošetřit. Děkujeme.

GPS souřadnice (střed plochy): ${gpsCoords}
Odkaz do aplikace: ${appUrl}`;
    const body = encodeURIComponent(bodyText);

    const popupContent = `
      <strong>${area.name}</strong>
      <div class="popup-details">
        <div><span>Poslední sečení:</span><strong>${area.lastMowed}</strong></div>
        <div><span>Frekvence:</span><strong>${area.frequency}</strong></div>
        <div><span>Popis:</span><strong>${area.description || "Zeleň"}</strong></div>
      </div>
      <div class="popup-actions">
        <a class="popup-button" href="mailto:info@beloky.cz?subject=${subject}&body=${body}">Požádat o údržbu</a>
      </div>
    `;

    polygon.bindPopup(popupContent);

    polygon.on("mouseover", () => {
      polygon.bringToFront();
      polygon.setStyle({
        color: baseStyle.color,
        weight: baseStyle.weight + 1,
        fillOpacity: Math.min(0.85, (baseStyle.fillOpacity || 0.5) + 0.15),
      });
    });

    polygon.on("mouseout", () => {
      polygon.setStyle(baseStyle);
    });
    return polygon;
  }

  function populateLayer(category) {
    if (!layers[category]) return;
    layers[category].clearLayers();
    if (markerMap && markerMap[category]) {
      markerMap[category].clear();
    }
    let source = [];
    if (category === "kose") source = dataKose;
    if (category === "lampy") source = dataLampy;
    if (category === "kontejnery") source = dataKontejnery;
    if (category === "hladina") source = dataHladina;

    source.forEach((item) => {
      const shape = createMarker(item, iconColors[category]);
      shape.addTo(layers[category]);
      
      // Store marker reference for deep linking
      if (markerMap && markerMap[category]) {
        const key = item.id != null ? `id:${item.id}` : `coords:${item.lat},${item.lng}`;
        markerMap[category].set(key, shape);
      }
    });
  }

  populateLayer("kose");
  populateLayer("lampy");
  populateLayer("kontejnery");
  populateLayer("hladina");

  function greenspaceByType(type) {
    const normalized = type === "zahony" ? "zahony" : "trava";
    return dataZelene.filter((area) => (area.type || "trava") === normalized);
  }

  function populateGreenspaceLayers() {
    const travaAreas = greenspaceByType("trava");
    const zahonyAreas = greenspaceByType("zahony");
    layers.zelenTrava.clearLayers();
    layers.zelenZahony.clearLayers();

    travaAreas.forEach((area) => {
      const polygon = createPolygon(area, iconColors.zelenTrava, greenspaceStyles.trava);
      polygon.addTo(layers.zelenTrava);
    });

    zahonyAreas.forEach((area) => {
      const polygon = createPolygon(area, iconColors.zelenZahony, greenspaceStyles.zahony);
      polygon.addTo(layers.zelenZahony);
    });
  }

  populateGreenspaceLayers();

  function visibleGreenspaceData() {
    const areas = [];
    if (greenspaceVisibility.trava) areas.push(...greenspaceByType("trava"));
    if (greenspaceVisibility.zahony) areas.push(...greenspaceByType("zahony"));
    return areas;
  }

  function syncGreenspaceLayerInputs() {
    if (!greenspaceLayerInputs.length) return;
    greenspaceLayerInputs.forEach((input) => {
      const key = input.dataset.greenspaceLayer === "zahony" ? "zahony" : "trava";
      input.checked = greenspaceVisibility[key];
    });
  }

  function updateCounters() {
    if (counters.kose) counters.kose.textContent = dataKose.length;
    if (counters.lampy) counters.lampy.textContent = dataLampy.length;
    if (counters.kontejnery) counters.kontejnery.textContent = dataKontejnery.length;
    if (counters.zelen) counters.zelen.textContent = dataZelene.length;
    if (counters.kriminalita) counters.kriminalita.textContent = (dataKriminalita && dataKriminalita.length) ? dataKriminalita.length : 0;
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
    renderStreamChart(streamState.numeric, streamHistoryTimes.at(-1));
  }

  function updateWasteDashboard() {
    if (!nextPickupDateEl || !nextPickupCountdownEl || !nextPickupLabelEl || !upcomingPickupsEl) return;

    const lastPickupDate = parsePickupDate(wasteSchedule.lastPickup);
    const nextPickupDate = getNextPickupDate(lastPickupDate, wasteSchedule.intervalDays, new Date());
    
    // Check if next pickup is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextPickupDay = new Date(nextPickupDate);
    nextPickupDay.setHours(0, 0, 0, 0);
    const isToday = nextPickupDay.getTime() === today.getTime();
    
    const countdown = formatCountdown(nextPickupDate);

    nextPickupDateEl.textContent = formatDate(nextPickupDate);
    nextPickupLabelEl.textContent = formatDate(nextPickupDate);
    nextPickupCountdownEl.textContent = countdown;
    if (lastPickupLabelEl) lastPickupLabelEl.textContent = formatDate(lastPickupDate);
    if (nextPickupSummaryEl) {
      if (isToday) {
        nextPickupSummaryEl.textContent = `Dnes: ${nextPickupDate.toLocaleDateString("cs-CZ")}`;
      } else {
        nextPickupSummaryEl.textContent = `Další svoz: ${nextPickupDate.toLocaleDateString("cs-CZ")}`;
      }
    }

    const upcoming = buildUpcomingPickups(nextPickupDate, 4, wasteSchedule.intervalDays);
    upcomingPickupsEl.innerHTML = upcoming
      .map(
        (date, idx) => {
          const dateDay = new Date(date);
          dateDay.setHours(0, 0, 0, 0);
          const isDateToday = dateDay.getTime() === today.getTime();
          const label = idx === 0 
            ? (isDateToday ? "Dnes" : "Příští svoz")
            : `${idx + 1}. termín`;
          return `
        <div class="waste-row">
          <div>
            <div class="date">${formatDate(date)}</div>
            <div class="label">${label}</div>
          </div>
          <span class="stat-chip subtle">14 dní</span>
        </div>`;
        }
      )
      .join("");
  }

  updateWasteDashboard();
  updateCounters();

  // Don't add all layers at once - they will be added when category is selected
  // Object.values(layers).forEach((layer) => layer.addTo(map));

  function setActiveCategory(category) {
    if (!category) {
      showDashboard();
      return;
    }
    currentCategory = category;

    const isStreamView = category === "hladina";
    const isWasteView = category === "odpad";
    const isHasiciView = category === "hasici";
    const isKriminalitaView = category === "kriminalita";
    const isMapCategory = mapCategories.includes(category) && category !== "kriminalita";
    const isGreenspace = category === "zelen";

    // Always keep the map layers in sync with the chosen category.
    // CRITICAL: Show map view FIRST before any map operations
    if (isMapCategory && mapView) {
      mapView.classList.remove("hidden");
      // Force immediate DOM update
      mapView.offsetHeight; // Trigger reflow
      
      // Immediately invalidate size - map must be visible for this to work
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 0);
    }
    
    // Add/remove layers based on category - only after map view is visible
    if (isMapCategory) {
      // Small delay to ensure map view is rendered
      requestAnimationFrame(() => {
        Object.entries(layers).forEach(([key, layer]) => {
          const isTravaLayer = key === "zelenTrava";
          const isZahonyLayer = key === "zelenZahony";
          const shouldShow = isGreenspace
            ? (isTravaLayer && greenspaceVisibility.trava) || (isZahonyLayer && greenspaceVisibility.zahony)
            : key === category;
          
          // Check if layer is already on map to avoid duplicate adds
          const isOnMap = map.hasLayer(layer);
          
          if (shouldShow) {
            if (!isOnMap) {
              map.addLayer(layer);
            }
          } else {
            if (isOnMap) {
              map.removeLayer(layer);
            }
          }
        });
        
        // Ensure map is properly sized after layer changes
        if (map) {
          map.invalidateSize();
        }
      });
    } else {
      // Remove all layers if not a map category
      Object.entries(layers).forEach(([key, layer]) => {
        if (map && map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    }

    const activeButton = document.querySelector('.nav-item.active');
    if (activeButton) activeButton.classList.remove('active');
    const targetButton = document.querySelector(`.nav-item[data-category="${category}"]`);
    if (targetButton) targetButton.classList.add('active');

    const activeStat = document.querySelector('.stat-card.active');
    if (activeStat) activeStat.classList.remove('active');
    const targetStat = document.querySelector(`.stat-card[data-category="${category}"]`);
    if (targetStat) targetStat.classList.add('active');

    if (isMapCategory) {
      const greenspaceData = visibleGreenspaceData();
      const activeData =
        category === "kose"
          ? dataKose
          : category === "lampy"
            ? dataLampy
            : category === "kontejnery"
              ? dataKontejnery
              : greenspaceData;

      const coords =
        category === "zelen" ? activeData.flatMap((area) => area.coords) : activeData.map((item) => [item.lat, item.lng]);

      if (coords.length) {
        const bounds = L.latLngBounds(coords);
        // Ensure map is visible and sized before flying to bounds
        requestAnimationFrame(() => {
          if (map) {
            map.invalidateSize();
            map.flyToBounds(bounds, { padding: [28, 28], duration: 0.6, easeLinearity: 0.25 });
          }
        });
      }
    }

    if (categoryLabel) {
      const labelText =
        category === "kose"
          ? "Koše"
          : category === "kriminalita"
            ? "Kriminalita"
          : category === "lampy"
            ? "Lampy"
            : category === "kontejnery"
              ? "Kontejnery"
              : category === "zelen"
                ? greenspaceVisibility.trava && greenspaceVisibility.zahony
                  ? "Údržba zeleně · všechny vrstvy"
                  : greenspaceVisibility.trava
                    ? "Údržba zeleně · tráva"
                    : "Údržba zeleně · záhony"
                : category === "hladina"
                  ? "Hladina potoka"
                  : "Odpad & sběrný dvůr";
      categoryLabel.textContent = `${labelText}`;
    }

    // Switch the visible view explicitly so returning from the stream panel always shows the map again.
    if (mapOverlay) {
      if (isMapCategory) {
        mapOverlay.classList.remove("hidden");
      } else {
        mapOverlay.classList.add("hidden");
      }
    }
    if (greenspaceLayersControl) {
      if (isGreenspace) {
        greenspaceLayersControl.classList.remove("hidden");
        syncGreenspaceLayerInputs();
      } else {
        greenspaceLayersControl.classList.add("hidden");
      }
    }
    if (mapView) {
      if (isMapCategory) {
        // Show map view first - critical for map to render
        mapView.classList.remove("hidden");
        // Force immediate map refresh - map must be visible for invalidateSize to work
        setTimeout(() => {
          map.invalidateSize();
        }, 0);
        requestAnimationFrame(() => {
          map.invalidateSize();
          refreshMapSize(50);
          refreshMapSize(150);
          refreshMapSize(300);
          refreshMapSize(500);
        });
      } else {
        mapView.classList.add("hidden");
      }
    }
    if (streamView) {
      if (isStreamView) {
        streamView.classList.remove("hidden");
      } else {
        streamView.classList.add("hidden");
      }
    }
    if (wasteView) {
      if (isWasteView) {
        wasteView.classList.remove("hidden");
      } else {
        wasteView.classList.add("hidden");
      }
    }
    if (hasiciView) {
      if (isHasiciView) {
        hasiciView.classList.remove("hidden");
        loadHasiciData();
      } else {
        hasiciView.classList.add("hidden");
      }
    }
    if (kriminalitaView) {
      if (isKriminalitaView) {
        kriminalitaView.classList.remove("hidden");
        // Always try to render - function handles loading/empty states
        renderKriminalita();
      } else {
        kriminalitaView.classList.add("hidden");
      }
    }

    if (isMapCategory && window.innerWidth <= 960 && mapView) {
      requestAnimationFrame(() => mapView.scrollIntoView({ behavior: "smooth", block: "start" }));
    }

    // Refresh the map size after toggling visibility to avoid a blank map when coming back from other views.
    if (isMapCategory) {
      // Multiple refreshes to ensure map renders correctly - critical for broken maps
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 0);
      requestAnimationFrame(() => {
        if (map) {
          map.invalidateSize();
          refreshMapSize(50);
          refreshMapSize(150);
          refreshMapSize(300);
          refreshMapSize(500);
        }
      });
      // Additional refresh after a longer delay to catch any layout changes
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 600);
    }

    // Show/hide back button on mobile when not on default category
    updateBackButtonVisibility();
  }

  function updateBackButtonVisibility() {
    if (!backButton) return;
    const isMobile = window.innerWidth <= 960;
    const hasActiveCategory = currentCategory !== null;
    const shouldShow = isMobile && hasActiveCategory;
    
    if (shouldShow) {
      backButton.classList.remove("hidden");
    } else {
      backButton.classList.add("hidden");
    }
  }

  async function loadHasiciData() {
    if (!hasiciList) return;
    
    hasiciList.innerHTML = '<div class="loading-state">Načítám zásahy…</div>';
    
    const feedUrl = 'https://pkr.kr-stredocesky.cz/pkr/zasahy-jpo/feed.xml';
    
    // Try multiple approaches: direct fetch, CORS proxies, and RSS-to-JSON services
    const proxyServices = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`
    ];
    
    // RSS to JSON services
    const rssToJsonServices = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
      `https://rss-to-json-serverless-api.vercel.app/api?feedURL=${encodeURIComponent(feedUrl)}`
    ];
    
    let xmlText = null;
    let jsonData = null;
    let error = null;
    
    // Try direct fetch first
    try {
      const response = await fetch(feedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      xmlText = await response.text();
    } catch (fetchError) {
      error = fetchError;
      
      // Try RSS to JSON services first (often more reliable)
      for (const jsonUrl of rssToJsonServices) {
        try {
          const jsonResponse = await fetch(jsonUrl, {
            method: 'GET'
          });
          
          if (!jsonResponse.ok) {
            continue;
          }
          
          const json = await jsonResponse.json();
          if (json && json.items && json.items.length > 0) {
            jsonData = json;
            error = null;
            break;
          }
        } catch (jsonError) {
          continue;
        }
      }
      
      // If JSON services failed, try CORS proxies
      if (!jsonData) {
        for (const proxyUrl of proxyServices) {
          try {
            const proxyResponse = await fetch(proxyUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml'
              }
            });
            
            if (!proxyResponse.ok) {
              continue;
            }
            
            xmlText = await proxyResponse.text();
            if (xmlText && xmlText.length > 100) {
              error = null;
              break;
            }
          } catch (proxyError) {
            continue;
          }
        }
      }
    }
    
    if (!xmlText && !jsonData) {
      const errorMsg = error?.message || 'Neznámá chyba';
      const isCorsError = errorMsg.includes('CORS') || errorMsg.includes('Access-Control') || errorMsg.includes('access control');
      
      hasiciList.innerHTML = `
        <div class="error-state">
          <p>Nepodařilo se načíst zásahy hasičů.</p>
          <p class="error-detail">${isCorsError ? 'Server neumožňuje přístup z tohoto webu (CORS).' : errorMsg}</p>
          <p class="error-detail" style="margin-top: 12px; font-size: 13px; opacity: 0.7;">
            Zkuste obnovit stránku nebo kontaktujte správce aplikace.
          </p>
        </div>
      `;
      return;
    }
    
    try {
      let zasahy = [];
      
      // Process JSON data if available
      if (jsonData && jsonData.items) {
        // Load more items to have enough after filtering
        zasahy = jsonData.items.slice(0, 200).map(item => {
          const title = item.title || 'Bez názvu';
          const link = item.link || '';
          const description = item.description || '';
          const pubDate = item.pubDate || '';
          
          // Parse description from JSON (may already be HTML)
          const descText = description.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
          const descParts = descText.split('<br>').map(p => p.trim()).filter(Boolean);
          const stav = descParts.find(p => p.startsWith('stav:'))?.replace('stav:', '').trim() || 'neupřesněno';
          const ukonceni = descParts.find(p => p.startsWith('ukončení:'))?.replace('ukončení:', '').trim() || null;
          const misto = descParts.filter(p => !p.startsWith('stav:') && !p.startsWith('ukončení:') && !p.startsWith('okres')).join(', ') || '';
          const okres = descParts.find(p => p.startsWith('okres'))?.replace('okres', '').trim() || '';
          
          let dateObj = null;
          if (pubDate) {
            dateObj = new Date(pubDate);
          }
          
          return {
            title,
            link,
            stav,
            ukonceni,
            misto,
            okres,
            date: dateObj,
            description
          };
        });
      } else if (xmlText) {
        // Process XML data
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error('Chyba při parsování XML');
        }
        
        const items = xmlDoc.querySelectorAll('item');
        // Load more items to have enough after filtering
        zasahy = Array.from(items).slice(0, 200).map(item => {
          const title = item.querySelector('title')?.textContent || 'Bez názvu';
          const link = item.querySelector('link')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Parse description - handle HTML entities
          const descText = description.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
          const descParts = descText.split('<br>').map(p => p.trim()).filter(Boolean);
          const stav = descParts.find(p => p.startsWith('stav:'))?.replace('stav:', '').trim() || 'neupřesněno';
          const ukonceni = descParts.find(p => p.startsWith('ukončení:'))?.replace('ukončení:', '').trim() || null;
          const misto = descParts.filter(p => !p.startsWith('stav:') && !p.startsWith('ukončení:') && !p.startsWith('okres')).join(', ') || '';
          const okres = descParts.find(p => p.startsWith('okres'))?.replace('okres', '').trim() || '';
          
          // Parse date
          let dateObj = null;
          if (pubDate) {
            dateObj = new Date(pubDate);
          }
          
          return {
            title,
            link,
            stav,
            ukonceni,
            misto,
            okres,
            date: dateObj,
            description
          };
        });
      }
      
      // Filter zasahy by location - only show interventions related to Běloky
      const belokyVariants = ['běloky', 'beloky', 'Běloky', 'Beloky'];
      const filteredZasahy = zasahy.filter(zasah => {
        const searchText = `${zasah.title} ${zasah.misto} ${zasah.okres} ${zasah.description}`.toLowerCase();
        return belokyVariants.some(variant => searchText.includes(variant.toLowerCase()));
      }).slice(0, 50); // Limit to 50 after filtering
      
      renderHasici(filteredZasahy);
    } catch (parseError) {
      console.error('Chyba při parsování RSS:', parseError);
      hasiciList.innerHTML = `
        <div class="error-state">
          <p>Chyba při zpracování dat zásahů.</p>
          <p class="error-detail">${parseError.message}</p>
        </div>
      `;
    }
  }

  function renderKriminalita() {
    if (!kriminalitaList) return;
    
    // Check if data is still loading (not yet initialized)
    if (typeof dataKriminalita === 'undefined' || dataKriminalita === null) {
      kriminalitaList.innerHTML = '<div class="loading-state">Načítám data kriminality…</div>';
      return;
    }
    
    // Check if data loaded but is empty
    if (!Array.isArray(dataKriminalita) || dataKriminalita.length === 0) {
      kriminalitaList.innerHTML = `
        <div class="error-state">
          <p>Žádná data kriminality k zobrazení.</p>
          <p class="error-detail">Data se nepodařilo načíst nebo jsou prázdná.</p>
          <p class="error-detail" style="margin-top: 12px; font-size: 13px; opacity: 0.7;">
            Zkuste obnovit stránku nebo kontaktujte správce aplikace.
          </p>
        </div>
      `;
      return;
    }
    
    const formatDate = (date) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '–';
      return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    
    const getTypeNames = (typeCodes) => {
      if (!typeCodes || !Array.isArray(typeCodes) || typeCodes.length === 0) return ['Neznámý typ'];
      try {
        return typeCodes.map(code => {
          const type = (typeof kriminalitaTypes !== 'undefined' && kriminalitaTypes && kriminalitaTypes[code]) ? kriminalitaTypes[code] : null;
          return type?.popis?.cs || type?.nazev?.cs || `Typ ${code}`;
        });
      } catch (e) {
        console.warn('Chyba při získávání názvů typů:', e);
        return typeCodes.map(code => `Typ ${code}`);
      }
    };
    
    const getStateName = (stateCode) => {
      try {
        const state = (typeof kriminalitaStates !== 'undefined' && kriminalitaStates && kriminalitaStates[stateCode]) ? kriminalitaStates[stateCode] : null;
        return state?.nazev?.cs || `Stav ${stateCode}`;
      } catch (e) {
        console.warn('Chyba při získávání názvu stavu:', e);
        return `Stav ${stateCode}`;
      }
    };
    
    const getRelevanceName = (relevanceCode) => {
      try {
        const relevance = (typeof kriminalitaRelevance !== 'undefined' && kriminalitaRelevance && kriminalitaRelevance[relevanceCode]) ? kriminalitaRelevance[relevanceCode] : null;
        return relevance?.nazev?.cs || `Relevance ${relevanceCode}`;
      } catch (e) {
        console.warn('Chyba při získávání názvu relevance:', e);
        return `Relevance ${relevanceCode}`;
      }
    };
    
    const getStateColor = (stateCode) => {
      if (stateCode === 1) return '#22c55e'; // zjištěn pachatel
      if (stateCode === 2) return '#f59e0b'; // neobjasněno
      if (stateCode === 3) return '#6b7280'; // skutek se nestal
      if (stateCode === 4) return '#9ca3af'; // skutek není trestným činem
      return '#6b7280';
    };
    
    // Sort by date - newest first
    const sortedKriminalita = [...dataKriminalita].sort((a, b) => {
      const dateA = a.date ? a.date.getTime() : 0;
      const dateB = b.date ? b.date.getTime() : 0;
      return dateB - dateA; // newest first
    });
    
    try {
      kriminalitaList.innerHTML = sortedKriminalita.map(item => {
        try {
          const dateStr = formatDate(item.date);
          const typeNames = getTypeNames(item.types || []);
          const stateName = getStateName(item.state);
          const relevanceName = getRelevanceName(item.relevance);
          const stateColor = getStateColor(item.state);
          
          return `
            <div class="kriminalita-item">
              <div class="kriminalita-item-header">
                <div class="kriminalita-date">${dateStr}</div>
                <div class="kriminalita-state" style="color: ${stateColor}">
                  ${stateName}
                </div>
              </div>
              <h3 class="kriminalita-title">${typeNames.join(', ')}</h3>
              <div class="kriminalita-details">
                <div class="kriminalita-relevance">📍 ${relevanceName}</div>
                <div class="kriminalita-location">Místo spáchání: Běloky</div>
                ${item.mp ? '<div class="kriminalita-mp">Místní působnost: Ano</div>' : ''}
              </div>
              <a href="https://kriminalita.policie.gov.cz" target="_blank" rel="noopener" class="kriminalita-link">Zdroj dat →</a>
            </div>
          `;
        } catch (itemError) {
          console.error('Chyba při renderování položky kriminality:', itemError, item);
          return `
            <div class="kriminalita-item">
              <div class="kriminalita-item-header">
                <div class="kriminalita-date">–</div>
                <div class="kriminalita-state">Chyba</div>
              </div>
              <h3 class="kriminalita-title">Chyba při zobrazení záznamu</h3>
            </div>
          `;
        }
      }).join('');
    } catch (renderError) {
      console.error('Kritická chyba při renderování kriminality:', renderError);
      kriminalitaList.innerHTML = `
        <div class="error-state">
          <p>Chyba při zobrazení dat kriminality.</p>
          <p class="error-detail">${renderError.message || 'Neznámá chyba'}</p>
        </div>
      `;
    }
  }

  function renderHasici(zasahy) {
    if (!hasiciList) return;
    
    if (zasahy.length === 0) {
      hasiciList.innerHTML = '<div class="empty-state">Žádné zásahy pro Běloky k zobrazení.</div>';
      return;
    }
    
    const formatDate = (date) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '–';
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'právě teď';
      if (diffMins < 60) return `před ${diffMins} min`;
      if (diffHours < 24) return `před ${diffHours} h`;
      if (diffDays < 7) return `před ${diffDays} dny`;
      
      return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    
    const getStatusColor = (stav) => {
      if (stav.includes('nová') || stav.includes('probíhá')) return '#ef4444';
      if (stav.includes('ukončená')) return '#22c55e';
      return '#f59e0b';
    };
    
    const getStatusIcon = (stav) => {
      if (stav.includes('nová') || stav.includes('probíhá')) return '🔴';
      if (stav.includes('ukončená')) return '✅';
      return '🟡';
    };
    
    hasiciList.innerHTML = zasahy.map(zasah => {
      const statusColor = getStatusColor(zasah.stav);
      const statusIcon = getStatusIcon(zasah.stav);
      const timeAgo = formatDate(zasah.date);
      
      return `
        <div class="hasici-item">
          <div class="hasici-item-header">
            <div class="hasici-status" style="color: ${statusColor}">
              <span class="hasici-status-icon">${statusIcon}</span>
              <span class="hasici-status-text">${zasah.stav}</span>
            </div>
            <div class="hasici-time">${timeAgo}</div>
          </div>
          <h3 class="hasici-title">${zasah.title}</h3>
          <div class="hasici-details">
            ${zasah.misto ? `<div class="hasici-location">📍 ${zasah.misto}${zasah.okres ? `, ${zasah.okres}` : ''}</div>` : ''}
            ${zasah.ukonceni ? `<div class="hasici-end">Ukončení: ${zasah.ukonceni}</div>` : ''}
          </div>
          ${zasah.link ? `<a href="${zasah.link}" target="_blank" rel="noopener" class="hasici-link">Více informací →</a>` : ''}
        </div>
      `;
    }).join('');
  }

  function goToDashboard() {
    showDashboard();
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

  function showDashboard() {
    // Hide all views and show dashboard
    if (mapView) {
      mapView.classList.add("hidden");
      // Remove all layers from map when hiding
      Object.values(layers).forEach((layer) => {
        if (map && map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    }
    if (streamView) streamView.classList.add("hidden");
    if (wasteView) wasteView.classList.add("hidden");
    if (hasiciView) hasiciView.classList.add("hidden");
    if (kriminalitaView) kriminalitaView.classList.add("hidden");
    if (mapOverlay) mapOverlay.classList.add("hidden");
    
    // Remove active state from all cards and nav items
    document.querySelectorAll('.stat-card.active, .nav-item.active').forEach(el => {
      el.classList.remove('active');
    });
    
    // Scroll to top on mobile
    if (window.innerWidth <= 960) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    
    // Update back button visibility
    currentCategory = null;
    updateBackButtonVisibility();
  }

  function initNav() {
    const buttonSelectors = [".nav-item", ".stat-card"];
    buttonSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((btn) =>
        btn.addEventListener("click", () => {
          const category = btn.dataset.category;
          
          // If clicking on already active category, return to dashboard
          if (currentCategory === category && btn.classList.contains('active')) {
            showDashboard();
            return;
          }
          
          // Set active category - this will handle view switching and map layers
          setActiveCategory(category);
          
          if (window.innerWidth <= 960) {
            document.body.classList.remove("overlay-visible");
            const sidebar = document.getElementById("sidebar");
            const menuToggle = document.getElementById("menuToggle");
            if (sidebar) sidebar.classList.add("sidebar-hidden");
            if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");

            // Ensure the map is visible and sized correctly when showing map category on mobile
            if (mapCategories.includes(category)) {
              // Map view should already be shown by setActiveCategory, but ensure it's visible
              if (mapView) {
                mapView.classList.remove("hidden");
                // Force immediate and delayed map refresh - critical for mobile
                setTimeout(() => map.invalidateSize(), 0);
                requestAnimationFrame(() => {
                  map.invalidateSize();
                  refreshMapSize(50);
                  refreshMapSize(150);
                  refreshMapSize(300);
                  refreshMapSize(500);
                });
              }
            }
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

  function parseTimestamp(value) {
    if (!value) return null;
    const normalized = value.replace(" ", "T");
    const ts = Date.parse(normalized);
    return Number.isFinite(ts) ? new Date(ts) : null;
  }

  async function fetchStreamLevel() {
    try {
      const parsed = await fetchStreamCsv();
      if (parsed && parsed.length > 0) {
        setStreamHistory(parsed);
      } else {
        throw new Error("Prázdná data z CSV");
      }
    } catch (err) {
      // Silently handle CORS errors - fallback should have been tried
      const errorMsg = err.message || String(err);
      if (!errorMsg.includes('CORS') && !errorMsg.includes('access control')) {
        console.warn("Chyba při načítání hladiny:", err);
      }
      
      // Only reset if we don't have any data
      if (!streamHistory.length) {
        streamHistory = [];
        streamHistoryTimes = [];
        streamState.numeric = null;
        streamState.level = streamState.level || "Data nedostupná";
        streamState.updated = streamState.updated || "–";
        streamState.status = streamState.status || "Nepodařilo se načíst data hladiny";
      }
    }

    populateLayer("hladina");
    updateCounters();
  }

  async function refreshStreamData(manual = false) {
    const btn = document.getElementById("refreshStreamBtn");
    if (manual && btn) {
      btn.disabled = true;
      btn.textContent = "Obnovuji…";
    }

    await loadStreamHistory();
    updateCounters();
    await fetchStreamLevel();

    if (manual && btn) {
      btn.disabled = false;
      btn.textContent = "↻ Obnovit";
    }
  }

  // Setup back button and brand logo click handlers
  if (backButton) {
    backButton.addEventListener("click", goToDashboard);
  }
  if (brandLogo) {
    brandLogo.addEventListener("click", () => {
      if (window.innerWidth <= 960) {
        goToDashboard();
      }
    });
  }

  // Update back button visibility on resize
  window.addEventListener("resize", () => {
    refreshMapSize(80);
    updateBackButtonVisibility();
  });

  // Initialize map first
  // Map needs to be initialized even if hidden
  if (map) {
    map.invalidateSize();
  }
  
  // Handle deep linking from URL hash (e.g., #lampy/1 or #lampy/50.133935,14.222031 or #zelen/50.133935,14.222031)
  function handleDeepLink() {
    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return;
    
    const match = hash.match(/^(\w+)\/(.+)$/);
    if (!match) return;
    
    const [, category, identifier] = match;
    
    // Handle greenspace (zelen) category differently - find polygon by coordinates
    if (category === "zelen" && identifier.includes(',')) {
      const [lat, lng] = identifier.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setTimeout(() => {
          setActiveCategory("zelen");
          
          // Find polygon closest to the coordinates
          setTimeout(() => {
            if (map) {
              const targetPoint = L.latLng(lat, lng);
              let closestPolygon = null;
              let minDistance = Infinity;
              
              // Check both greenspace layers
              [layers.zelenTrava, layers.zelenZahony].forEach((layer) => {
                layer.eachLayer((polygon) => {
                  if (polygon instanceof L.Polygon) {
                    const bounds = polygon.getBounds();
                    const center = bounds.getCenter();
                    const distance = targetPoint.distanceTo(center);
                    
                    if (distance < minDistance) {
                      minDistance = distance;
                      closestPolygon = polygon;
                    }
                  }
                });
              });
              
              if (closestPolygon) {
                const bounds = closestPolygon.getBounds();
                map.fitBounds(bounds, { padding: [50, 50] });
                setTimeout(() => {
                  closestPolygon.openPopup();
                }, 300);
              } else {
                // If no polygon found, just zoom to coordinates
                map.setView([lat, lng], 18);
              }
            }
          }, 300);
        }, 500);
      }
      return;
    }
    
    // Handle other categories (lampy, kose, kontejnery)
    if (!mapCategories.includes(category) || !markerMap[category]) return;
    
    // Wait for data to load and markers to be populated
    setTimeout(() => {
      let marker = null;
      
      // Try to find by ID first
      if (/^\d+$/.test(identifier)) {
        marker = markerMap[category].get(`id:${identifier}`);
      }
      
      // If not found by ID, try coordinates
      if (!marker && identifier.includes(',')) {
        marker = markerMap[category].get(`coords:${identifier}`);
      }
      
      if (marker) {
        // Set active category and show map
        setActiveCategory(category);
        
        // Wait for map to be ready, then zoom to marker and open popup
        setTimeout(() => {
          if (map && marker) {
            map.setView(marker.getLatLng(), 18);
            marker.openPopup();
          }
        }, 300);
      } else {
        // If marker not found, just open the category
        setActiveCategory(category);
      }
    }, 500);
  }
  
  // Start with "údržba zeleně" (zelen) as default category, unless deep link is present
  // Wait a bit to ensure data is loaded and markers are populated
  setTimeout(() => {
    if (!window.location.hash || !window.location.hash.match(/^#\w+\//)) {
      setActiveCategory("zelen");
    }
  }, 200);
  setupSidebarToggle();
  initNav();
  
  // Handle deep link after initialization
  handleDeepLink();
  
  // Ensure map is ready
  if (map) {
    refreshMapSize(0);
    refreshMapSize(200);
  }
  window.addEventListener("orientationchange", () => {
    refreshMapSize(120);
    updateBackButtonVisibility();
  });
  const refreshButton = document.getElementById("refreshStreamBtn");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => refreshStreamData(true));
  }
  if (greenspaceLayerInputs.length) {
    greenspaceLayerInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.greenspaceLayer === "zahony" ? "zahony" : "trava";
        const enabled = input.checked;
        const currentlyVisible = Object.values(greenspaceVisibility).filter(Boolean).length;
        if (!enabled && currentlyVisible === 1) {
          input.checked = true;
          return;
        }
        greenspaceVisibility[key] = enabled;
        if (currentCategory === "zelen") {
          setActiveCategory("zelen");
        }
      });
    });
    syncGreenspaceLayerInputs();
  }
  fetchStreamLevel();
  
  // Load kriminalita data asynchronously in background (non-blocking)
  // This allows the app to display immediately while kriminalita loads separately
  if (typeof loadKriminalitaDataAsync === 'function') {
    loadKriminalitaDataAsync().catch(error => {
      console.error('Nepodařilo se načíst data kriminality na pozadí:', error);
    });
  }
});
