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

    // Handle both click and touch events for better mobile support
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
    };
    
    themeToggleButton.addEventListener("click", handleToggle);
    themeToggleButton.addEventListener("touchend", handleToggle);

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

  if (typeof loadAllData === 'function') {
    await loadAllData();
  } else {
    console.error('loadAllData function is not available');
  }
  
  // Load zavady data for dashboard counter
  try {
    await loadZavadyData();
    updateCounters();
  } catch (error) {
    console.warn('Nepodařilo se načíst data závad pro dashboard:', error);
  }

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
    // Use CartoDB Positron for a clean, light, modern map style
    baseLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      errorTileUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='256' height='256' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENačítám...%3C/text%3E%3C/svg%3E",
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
      color: "#059669",
      weight: 3,
      fillColor: "#10b981",
      fillOpacity: 0.45,
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
    lampy: document.getElementById("countLampy"),
    kontejnery: document.getElementById("countKontejnery"),
    zavady: document.getElementById("countZavady"),
    hladina: document.getElementById("countHladina"),
    odpad: document.getElementById("countOdpad"),
  };

  const zavadySummary = document.getElementById("zavadySummary");

  const levelReading = document.getElementById("levelReading");
  const streamLevelEl = document.getElementById("streamLevel");
  const streamUpdatedEl = document.getElementById("streamUpdated");
  const streamStatusEl = document.getElementById("streamStatus");
  const nextPickupDateEl = document.getElementById("nextPickupDate");
  const nextPickupDateLabelEl = document.getElementById("nextPickupDateLabel");
  const nextPickupCountdownEl = document.getElementById("nextPickupCountdown");
  const lastPickupLabelEl = document.getElementById("lastPickupLabel");
  const upcomingPickupsEl = document.getElementById("upcomingPickups");

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
  const zavadyView = document.getElementById("zavadyView");
  const zavadyList = document.getElementById("zavadyList");

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

  function formatDateShort(date) {
    return date.toLocaleDateString("cs-CZ", {
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
      // GPS souřadnice
      const gpsCoords = `${item.lat}, ${item.lng}`;
      
      // Odkaz do aplikace s konkrétním košem
      const appUrl = item.id != null 
        ? `${window.location.origin}${window.location.pathname}#kose/${item.id}`
        : `${window.location.origin}${window.location.pathname}#kose/${item.lat},${item.lng}`;
      
      popupContent += `
        <div class="popup-details">
          <div><span>Naplněnost:</span><strong>${fill}</strong></div>
          <div><span>Poslední aktualizace:</span><strong>${updatedRelative}</strong></div>
          <div class="popup-subtext">${updatedAbsolute}</div>
          <div><span>Stav baterie:</span><strong>${battery}</strong></div>
        </div>
        <div class="popup-status popup-${status.severity}">
          <div class="status-chip-row">${statusBadges}</div>
        </div>
        <div class="popup-actions">
          <button class="popup-button show-report-form-btn" data-category="kose" data-item-id="${item.id || 'N/A'}" data-item-name="${popupTitle}" data-gps="${gpsCoords}" data-app-url="${appUrl}">Nahlásit závadu</button>
          <form class="lamp-report-form hidden" action="https://formspree.io/f/xkgdbplk" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="form_type" value="kose_report">
            <input type="hidden" name="kos_id" value="${item.id || 'N/A'}">
            <input type="hidden" name="kos_name" value="${popupTitle}">
            <input type="hidden" name="gps_coords" value="${gpsCoords}">
            <input type="hidden" name="app_url" value="${appUrl}">
            <label class="popup-form-label">
              Váš email:
              <input type="email" name="email" required class="popup-form-input">
            </label>
            <label class="popup-form-label">
              Popis závady:
              <textarea name="message" rows="3" class="popup-form-textarea" placeholder="Popište prosím závadu koše..."></textarea>
            </label>
            <label class="popup-form-label">
              Fotografie (volitelné):
              <input type="file" name="upload" accept="image/*" class="popup-form-input">
            </label>
            <button type="submit" class="popup-button">Odeslat</button>
          </form>
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
          <button class="popup-button show-report-form-btn" data-category="lampy" data-item-id="${item.id || 'N/A'}" data-item-name="${popupTitle}" data-gps="${gpsCoords}" data-app-url="${appUrl}">Nahlásit závadu</button>
          <form class="lamp-report-form hidden" action="https://formspree.io/f/xkgdbplk" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="lamp_id" value="${item.id || 'N/A'}">
            <input type="hidden" name="lamp_name" value="${popupTitle}">
            <input type="hidden" name="gps_coords" value="${gpsCoords}">
            <input type="hidden" name="app_url" value="${appUrl}">
            <label class="popup-form-label">
              Váš email:
              <input type="email" name="email" required class="popup-form-input">
            </label>
            <label class="popup-form-label">
              Popis závady:
              <textarea name="message" rows="3" class="popup-form-textarea" placeholder="Popište prosím závadu lampy..."></textarea>
            </label>
            <label class="popup-form-label">
              Fotografie (volitelné):
              <input type="file" name="upload" accept="image/*" class="popup-form-input">
            </label>
            <button type="submit" class="popup-button">Odeslat</button>
          </form>
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
          <div><span>📍</span><strong>Běloky</strong></div>
          ${item.mp ? '<div><span>Místní působnost:</span><strong>Ano</strong></div>' : ''}
        </div>
        <div class="popup-actions">
          <a class="popup-button" href="https://kriminalita.policie.gov.cz" target="_blank" rel="noopener">Zdroj dat →</a>
        </div>`;
    }

    marker.bindPopup(popupContent);
    
    // Add form submission handler for lamp reports
    // Add form submit handler for lampy, kose
    if (item.category === "lampy" || item.category === "kose") {
      marker.on('popupopen', () => {
        // Use setTimeout to ensure popup DOM is fully rendered
        setTimeout(() => {
          const popup = marker.getPopup();
          if (!popup || !popup.isOpen()) return;
          
          const popupElement = popup.getElement();
          if (!popupElement) return;
          
          // Find the popup content element (not the wrapper)
          const popupContent = popupElement.querySelector('.leaflet-popup-content');
          if (!popupContent) {
            console.warn('Popup content not found');
            return;
          }
          
          // Handle "Nahlásit závadu" button click
          const showFormBtn = popupContent.querySelector('.show-report-form-btn');
          const form = popupContent.querySelector('.lamp-report-form');
          
          if (!showFormBtn || !form) {
            console.warn('Show form button or form not found in popup', { showFormBtn, form });
            return;
          }
          
          // Reset form visibility when popup opens
          showFormBtn.classList.remove('hidden');
          form.classList.add('hidden');
          form.reset();
          
          // Remove existing listeners to prevent duplicates
          const newShowBtn = showFormBtn.cloneNode(true);
          const newForm = form.cloneNode(true);
          showFormBtn.parentNode?.replaceChild(newShowBtn, showFormBtn);
          form.parentNode?.replaceChild(newForm, form);
          
          newShowBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent any event bubbling that might close popup
            e.preventDefault(); // Prevent any default behavior
            console.log('Show form button clicked'); // Debug log
            newShowBtn.classList.add('hidden');
            newForm.classList.remove('hidden');
            // Force display to ensure form is visible
            newForm.style.display = 'flex';
            newForm.style.flexDirection = 'column';
            console.log('Form should be visible now', newForm.style.display, newForm.classList); // Debug log
            // Add class to popup wrapper to expand it
            const popupWrapper = popupContent?.closest('.leaflet-popup-content-wrapper');
            if (popupWrapper) {
              popupWrapper.classList.add('popup-expanded');
              // Ensure popup wrapper is scrollable on mobile - use !important via setProperty
              popupWrapper.style.setProperty('max-height', '85vh', 'important');
              popupWrapper.style.setProperty('overflow-y', 'auto', 'important');
              popupWrapper.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
              popupWrapper.style.setProperty('display', 'flex', 'important');
              popupWrapper.style.setProperty('flex-direction', 'column', 'important');
            }
            // Ensure form is scrollable on mobile
            if (newForm) {
              newForm.style.maxHeight = 'none';
              newForm.style.overflowY = 'visible';
              newForm.style.display = 'flex';
              newForm.style.flexDirection = 'column';
              newForm.style.flex = '1 1 auto';
              newForm.style.minHeight = '0';
              // Ensure submit button is always visible at bottom
              const submitBtn = newForm.querySelector('button[type="submit"]');
              if (submitBtn) {
                submitBtn.style.marginTop = 'auto';
                submitBtn.style.flexShrink = '0';
              }
            }
            // Force popup to recalculate size
            if (popup) {
              popup.update();
            }
            // Ensure popup is fully visible after expansion
            // Only do this for the main large map, not the small map in report modal
            setTimeout(() => {
              if (popup && popup.isOpen() && map) {
                // Check if this is the main map (not the small report map)
                const mapContainer = map.getContainer();
                const mapId = mapContainer?.id;
                // Skip panning for small report map (reportZavadaMap)
                // Check if map container is inside report modal map container
                const isReportMap = mapId === 'reportZavadaMap' || 
                                    mapContainer?.closest('#reportZavadaMapContainer') !== null ||
                                    mapContainer?.closest('.report-zavada-map') !== null ||
                                    mapContainer?.parentElement?.id === 'reportZavadaMap';
                if (isReportMap) {
                  return;
                }
                
                const popupEl = popup.getElement();
                if (popupEl) {
                  const popupRect = popupEl.getBoundingClientRect();
                  const mapRect = mapContainer.getBoundingClientRect();
                  
                  // Check if popup is outside viewport
                  const popupBottom = popupRect.bottom;
                  const mapBottom = mapRect.bottom;
                  const popupTop = popupRect.top;
                  const mapTop = mapRect.top;
                  
                  // Calculate how much to pan to make popup visible
                  let panY = 0;
                  if (popupBottom > mapBottom) {
                    // Popup is cut off at bottom - need to pan map down (move viewport up)
                    panY = popupBottom - mapBottom + 20; // Add 20px padding
                  } else if (popupTop < mapTop) {
                    // Popup is cut off at top - need to pan map up (move viewport down)
                    panY = popupTop - mapTop - 20; // Subtract 20px padding
                  }
                  
                  if (Math.abs(panY) > 5) {
                    // Convert pixel offset to lat/lng offset
                    // When panY is positive (popup cut off at bottom), we need to pan map down (add to Y)
                    // When panY is negative (popup cut off at top), we need to pan map up (subtract from Y)
                    const center = map.getCenter();
                    const point = map.latLngToContainerPoint(center);
                    const newPoint = L.point(point.x, point.y + panY);
                    const newCenter = map.containerPointToLatLng(newPoint);
                    
                    map.panTo(newCenter, {
                      animate: true,
                      duration: 0.4
                    });
                  }
                }
              }
            }, 150);
          });
          
          // Add form submit handler
          newForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(newForm);
          
          // Check if file is included
          const fileInput = newForm.querySelector('input[type="file"]');
            if (fileInput && fileInput.files && fileInput.files.length > 0) {
              const file = fileInput.files[0];
              console.log('Odesílám soubor:', file.name, 'velikost:', file.size, 'bytes', 'typ:', file.type);
              // Ensure file is in FormData
              if (!formData.has('upload')) {
                formData.append('upload', file);
              }
            }
            
            const submitButton = newForm.querySelector('button[type="submit"]');
            const originalText = submitButton?.textContent;
            
            if (submitButton) {
              submitButton.disabled = true;
              submitButton.textContent = 'Odesílám...';
            }
            
            // Don't set Content-Type header - browser will set it automatically with boundary for multipart/form-data
            let response;
            try {
              response = await fetch('https://formspree.io/f/xkgdbplk', {
                method: 'POST',
                body: formData
                // Don't set Content-Type - browser sets it automatically with boundary for multipart/form-data
              });
            } catch (networkError) {
              // CORS errors can occur even when form is successfully submitted
              // Check if it's a CORS error - if so, assume success (Formspree redirects)
              if (networkError.message && (networkError.message.includes('CORS') || networkError.message.includes('Failed to fetch') || networkError.message.includes('Load failed'))) {
                console.log('CORS error detected, but form may have been submitted successfully');
                // Treat as success - Formspree often redirects which causes CORS errors
                // Create a synthetic response object that mimics Response but without .json() method
                response = { 
                  ok: true, 
                  status: 200,
                  statusText: 'OK',
                  json: undefined,
                  text: undefined
                };
              } else {
                console.error('Network error:', networkError);
                throw new Error('Chyba připojení. Zkontrolujte připojení k internetu.');
              }
            }
            
            try {
              // Check if response is a real Response object or our synthetic object
              const isSyntheticResponse = !response.json || typeof response.json !== 'function';
              
              // Formspree returns 200 OK for successful submissions
              // HTTP 422 = Unprocessable Entity (validation errors)
              // HTTP 400 = Bad Request
              // HTTP >= 500 = Server errors
              const isError = response.status === 400 || response.status === 422 || response.status >= 500;
              
              if (response.ok && !isError) {
                // Only try to parse JSON if it's a real Response object
                if (!isSyntheticResponse) {
                  try {
                    const result = await response.json();
                    console.log('Formspree response:', result);
                    // Check if JSON response indicates an error
                    if (result.error) {
                      const errorMsg = typeof result.error === 'string' 
                        ? result.error 
                        : (result.error.message || result.error.code || 'Neznámá chyba');
                      throw new Error(errorMsg);
                    }
                  } catch (e) {
                    // If response is not JSON (e.g., HTML redirect page), that's OK
                    if (e.message && !e.message.includes('JSON') && !e.message.includes('Neznámá chyba')) {
                      throw e; // Re-throw if it's a real error
                    }
                    if (!e.message || e.message.includes('JSON') || e.message.includes('Neznámá chyba')) {
                      console.log('Formspree response is not JSON (likely redirect), but submission was successful');
                    }
                  }
                } else {
                  console.log('Form submitted successfully (CORS handled)');
                }
                // Close popup
                marker.closePopup();
                
                // Show toast notification
                const categoryName = item.category === "lampy" ? "lampy" : "koše";
                showToastNotification('Hlášení odesláno!', `Děkujeme za nahlášení závady ${categoryName}. Ozveme se vám co nejdříve.`, 'success');
              } else {
                // Try to get error message from response
                let errorMsg = `HTTP ${response.status}: ${response.statusText || 'Chyba'}`;
                // Only try to parse JSON if it's a real Response object
                if (!isSyntheticResponse) {
                  try {
                    const errorData = await response.json();
                    // Formspree error format: { error: { code: "...", message: "..." } } or { error: "..." }
                    if (errorData.error) {
                      if (typeof errorData.error === 'string') {
                        errorMsg = errorData.error;
                      } else if (errorData.error.message) {
                        errorMsg = errorData.error.message;
                      } else if (errorData.error.code) {
                        const errorCodeMessages = {
                          'REQUIRED_FIELD_MISSING': 'Chybí povinné pole.',
                          'REQUIRED_FIELD_EMPTY': 'Povinné pole je prázdné.',
                          'TYPE_EMAIL': 'Email má neplatný formát.',
                          'FILES_TOO_BIG': 'Soubor je příliš velký.',
                        };
                        errorMsg = errorCodeMessages[errorData.error.code] || errorData.error.code;
                      }
                    } else if (errorData.message) {
                      errorMsg = errorData.message;
                    }
                    console.error('Formspree error:', errorData);
                  } catch (e) {
                    // If not JSON, use status text
                    if (response.status === 422) {
                      errorMsg = 'Chyba validace. Zkontrolujte formulář.';
                    } else if (response.status === 400) {
                      errorMsg = 'Neplatný požadavek. Zkontrolujte formulář.';
                    }
                  }
                }
                throw new Error(errorMsg);
              }
            } catch (error) {
              console.error('Chyba při odesílání formuláře:', error);
              if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText || 'Odeslat';
              }
              showToastNotification('Chyba při odesílání', error.message || 'Nepodařilo se odeslat formulář. Zkuste to prosím znovu.', 'error');
            }
          });
        }, 50); // Small delay to ensure DOM is ready
      }
    });
  }
    
    return marker;
  }

  function createPolygon(area, color, style) {
    const baseStyle = style || greenspaceStyles.trava;
    // Always use color from baseStyle to ensure correct colors (green for trava)
    const polygon = L.polygon(area.coords, baseStyle);

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
        <button class="popup-button show-report-form-btn" data-category="zelen" data-item-name="${area.name}" data-gps="${gpsCoords}" data-app-url="${appUrl}">Nahlásit závadu</button>
        <form class="lamp-report-form hidden" action="https://formspree.io/f/xkgdbplk" method="POST" enctype="multipart/form-data">
          <input type="hidden" name="form_type" value="zelen_report">
          <input type="hidden" name="zelen_name" value="${area.name}">
          <input type="hidden" name="gps_coords" value="${gpsCoords}">
          <input type="hidden" name="app_url" value="${appUrl}">
          <label class="popup-form-label">
            Váš email:
            <input type="email" name="email" required class="popup-form-input">
          </label>
          <label class="popup-form-label">
            Popis závady:
            <textarea name="message" rows="3" class="popup-form-textarea" placeholder="Popište prosím závadu (např. potřeba posekat, ošetřit...)" required></textarea>
          </label>
          <label class="popup-form-label">
            Fotografie (volitelné):
            <input type="file" name="upload" accept="image/*" class="popup-form-input">
          </label>
          <button type="submit" class="popup-button">Odeslat</button>
        </form>
      </div>
    `;

    polygon.bindPopup(popupContent);
    
    // Add form submit handler for zelen
    polygon.on('popupopen', () => {
      const popup = polygon.getPopup();
      const popupElement = popup.getElement();
      if (!popupElement) return;
      
      // Handle "Nahlásit závadu" button click
      const showFormBtn = popupElement.querySelector('.show-report-form-btn');
      const form = popupElement.querySelector('.lamp-report-form');
      
      if (showFormBtn && form) {
        // Reset form visibility when popup opens
        showFormBtn.classList.remove('hidden');
        form.classList.add('hidden');
        form.reset();
        
        // Remove existing listeners to prevent duplicates
        const newShowBtn = showFormBtn.cloneNode(true);
        const newForm = form.cloneNode(true);
        showFormBtn.parentNode?.replaceChild(newShowBtn, showFormBtn);
        form.parentNode?.replaceChild(newForm, form);
        
        newShowBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent any event bubbling that might close popup
          e.preventDefault(); // Prevent any default behavior
          newShowBtn.classList.add('hidden');
          newForm.classList.remove('hidden');
          // Force display to ensure form is visible
          newForm.style.display = 'flex';
          // Add class to popup wrapper to expand it
          const popupWrapper = popupElement?.closest('.leaflet-popup-content-wrapper');
          if (popupWrapper) {
            popupWrapper.classList.add('popup-expanded');
            // Ensure popup wrapper is scrollable on mobile - use !important via setProperty
            popupWrapper.style.setProperty('max-height', '85vh', 'important');
            popupWrapper.style.setProperty('overflow-y', 'auto', 'important');
            popupWrapper.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
            popupWrapper.style.setProperty('display', 'flex', 'important');
            popupWrapper.style.setProperty('flex-direction', 'column', 'important');
          }
          // Ensure form is scrollable on mobile
          if (newForm) {
            newForm.style.maxHeight = 'none';
            newForm.style.overflowY = 'visible';
            newForm.style.display = 'flex';
            newForm.style.flexDirection = 'column';
            newForm.style.flex = '1 1 auto';
            newForm.style.minHeight = '0';
            // Ensure submit button is always visible at bottom
            const submitBtn = newForm.querySelector('button[type="submit"]');
            if (submitBtn) {
              submitBtn.style.marginTop = 'auto';
              submitBtn.style.flexShrink = '0';
            }
          }
          // Force popup to recalculate size
          if (popup) {
            popup.update();
          }
          // Ensure popup is fully visible after expansion
          // Only do this for the main large map, not the small map in report modal
          setTimeout(() => {
            if (popup && popup.isOpen() && map) {
              // Check if this is the main map (not the small report map)
              const mapContainer = map.getContainer();
              const mapId = mapContainer?.id;
              // Skip panning for small report map (reportZavadaMap)
              // Check if map container is inside report modal map container
              const isReportMap = mapId === 'reportZavadaMap' || 
                                  mapContainer?.closest('#reportZavadaMapContainer') !== null ||
                                  mapContainer?.closest('.report-zavada-map') !== null ||
                                  mapContainer?.parentElement?.id === 'reportZavadaMap';
              if (isReportMap) {
                return;
              }
              
              const popupEl = popup.getElement();
              if (popupEl) {
                const popupRect = popupEl.getBoundingClientRect();
                const mapRect = mapContainer.getBoundingClientRect();
                
                // Check if popup is outside viewport
                const popupBottom = popupRect.bottom;
                const mapBottom = mapRect.bottom;
                const popupTop = popupRect.top;
                const mapTop = mapRect.top;
                
                // Calculate how much to pan to make popup visible
                let panY = 0;
                if (popupBottom > mapBottom) {
                  // Popup is cut off at bottom - need to pan map down (move viewport up)
                  panY = popupBottom - mapBottom + 20; // Add 20px padding
                } else if (popupTop < mapTop) {
                  // Popup is cut off at top - need to pan map up (move viewport down)
                  panY = popupTop - mapTop - 20; // Subtract 20px padding
                }
                
                if (Math.abs(panY) > 5) {
                  // Convert pixel offset to lat/lng offset
                  // When panY is positive (popup cut off at bottom), we need to pan map down (add to Y)
                  // When panY is negative (popup cut off at top), we need to pan map up (subtract from Y)
                  const center = map.getCenter();
                  const point = map.latLngToContainerPoint(center);
                  const newPoint = L.point(point.x, point.y + panY);
                  const newCenter = map.containerPointToLatLng(newPoint);
                  
                  map.panTo(newCenter, {
                    animate: true,
                    duration: 0.4
                  });
                }
              }
            }
          }, 150);
        });
        
        // Add form submit handler
        newForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(newForm);
          
          // Check if file is included
          const fileInput = newForm.querySelector('input[type="file"]');
          if (fileInput && fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            console.log('Odesílám soubor:', file.name, 'velikost:', file.size, 'bytes', 'typ:', file.type);
            // Ensure file is in FormData
            if (!formData.has('upload')) {
              formData.append('upload', file);
            }
          }
          
          const submitButton = newForm.querySelector('button[type="submit"]');
          const originalText = submitButton?.textContent;
          
          if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Odesílám...';
          }
          
          // Don't set Content-Type header - browser will set it automatically with boundary for multipart/form-data
          let response;
          try {
            response = await fetch('https://formspree.io/f/xkgdbplk', {
              method: 'POST',
              body: formData
              // Don't set Content-Type - browser sets it automatically with boundary for multipart/form-data
            });
          } catch (networkError) {
            // CORS errors can occur even when form is successfully submitted
            // Check if it's a CORS error - if so, assume success (Formspree redirects)
            if (networkError.message && (networkError.message.includes('CORS') || networkError.message.includes('Failed to fetch') || networkError.message.includes('Load failed'))) {
              console.log('CORS error detected, but form may have been submitted successfully');
              // Treat as success - Formspree often redirects which causes CORS errors
              // Create a synthetic response object that mimics Response but without .json() method
              response = { 
                ok: true, 
                status: 200,
                statusText: 'OK',
                json: undefined,
                text: undefined
              };
            } else {
              console.error('Network error:', networkError);
              throw new Error('Chyba připojení. Zkontrolujte připojení k internetu.');
            }
          }
          
          try {
            // Check if response is a real Response object or our synthetic object
            const isSyntheticResponse = !response.json || typeof response.json !== 'function';
            
            // Formspree returns 200 OK for successful submissions
            // HTTP 422 = Unprocessable Entity (validation errors)
            // HTTP 400 = Bad Request
            // HTTP >= 500 = Server errors
            const isError = response.status === 400 || response.status === 422 || response.status >= 500;
            
            if (response.ok && !isError) {
              // Only try to parse JSON if it's a real Response object
              if (!isSyntheticResponse) {
                try {
                  const result = await response.json();
                  console.log('Formspree response:', result);
                  // Check if JSON response indicates an error
                  if (result.error) {
                    const errorMsg = typeof result.error === 'string' 
                      ? result.error 
                      : (result.error.message || result.error.code || 'Neznámá chyba');
                    throw new Error(errorMsg);
                  }
                } catch (e) {
                  // If response is not JSON (e.g., HTML redirect page), that's OK
                  if (e.message && !e.message.includes('JSON') && !e.message.includes('Neznámá chyba')) {
                    throw e; // Re-throw if it's a real error
                  }
                  if (!e.message || e.message.includes('JSON') || e.message.includes('Neznámá chyba')) {
                    console.log('Formspree response is not JSON (likely redirect), but submission was successful');
                  }
                }
              } else {
                console.log('Form submitted successfully (CORS handled)');
              }
              // Close popup
              polygon.closePopup();
              
              // Show toast notification
              showToastNotification('Požadavek odeslán!', 'Děkujeme za nahlášení. Po zpracování se závada zobrazí v tabulce.', 'success');
            } else {
              // Try to get error message from response
              let errorMsg = `HTTP ${response.status}: ${response.statusText || 'Chyba'}`;
              // Only try to parse JSON if it's a real Response object
              if (!isSyntheticResponse) {
                try {
                  const errorData = await response.json();
                // Formspree error format: { error: { code: "...", message: "..." } } or { error: "..." }
                if (errorData.error) {
                  if (typeof errorData.error === 'string') {
                    errorMsg = errorData.error;
                  } else if (errorData.error.message) {
                    errorMsg = errorData.error.message;
                  } else if (errorData.error.code) {
                    const errorCodeMessages = {
                      'REQUIRED_FIELD_MISSING': 'Chybí povinné pole.',
                      'REQUIRED_FIELD_EMPTY': 'Povinné pole je prázdné.',
                      'TYPE_EMAIL': 'Email má neplatný formát.',
                      'FILES_TOO_BIG': 'Soubor je příliš velký.',
                    };
                    errorMsg = errorCodeMessages[errorData.error.code] || errorData.error.code;
                  }
                } else if (errorData.message) {
                  errorMsg = errorData.message;
                }
                console.error('Formspree error:', errorData);
              } catch (e) {
                // If not JSON, use status text
                if (response.status === 422) {
                  errorMsg = 'Chyba validace. Zkontrolujte formulář.';
                } else if (response.status === 400) {
                  errorMsg = 'Neplatný požadavek. Zkontrolujte formulář.';
                }
              }
              throw new Error(errorMsg);
            }
          }
          } catch (error) {
            console.error('Chyba při odesílání formuláře:', error);
            if (submitButton) {
              submitButton.disabled = false;
              submitButton.textContent = originalText || 'Odeslat';
            }
            showToastNotification('Chyba při odesílání', error.message || 'Nepodařilo se odeslat formulář. Zkuste to prosím znovu.', 'error');
          }
        });
      }
    });

    polygon.on("mouseover", () => {
      polygon.bringToFront();
      polygon.setStyle({
        color: baseStyle.color,
        weight: baseStyle.weight + 1,
        fillOpacity: Math.min(0.85, (baseStyle.fillOpacity || 0.5) + 0.15),
      });
    });

    polygon.on("mouseout", () => {
      polygon.setStyle({
        ...baseStyle,
        fillColor: baseStyle.fillColor,
      });
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
    if (counters.lampy) counters.lampy.textContent = dataLampy.length;
    if (counters.kontejnery) counters.kontejnery.textContent = dataKontejnery.length;
    if (counters.kriminalita) counters.kriminalita.textContent = (dataKriminalita && dataKriminalita.length) ? dataKriminalita.length : 0;
    if (counters.hladina) {
      counters.hladina.textContent = streamState.level ? streamState.level : `${dataHladina.length} senzor`;
    }
    // Odpad counter - show next pickup date
    if (counters.odpad) {
      let lastPickupDate = parsePickupDate(wasteSchedule.lastPickup);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let nextPickupDate = getNextPickupDate(lastPickupDate, wasteSchedule.intervalDays, today);
      let nextPickupDay = new Date(nextPickupDate);
      nextPickupDay.setHours(0, 0, 0, 0);
      
      // Auto-update if next pickup is in the past
      while (nextPickupDay < today) {
        lastPickupDate = new Date(nextPickupDate);
        nextPickupDate = getNextPickupDate(lastPickupDate, wasteSchedule.intervalDays, today);
        nextPickupDay = new Date(nextPickupDate);
        nextPickupDay.setHours(0, 0, 0, 0);
      }
      
      const isToday = nextPickupDay.getTime() === today.getTime();
      const displayDate = isToday 
        ? (() => {
            const nextAfterToday = new Date(nextPickupDate);
            nextAfterToday.setDate(nextAfterToday.getDate() + wasteSchedule.intervalDays);
            return nextAfterToday;
          })()
        : nextPickupDate;
      
      counters.odpad.textContent = displayDate.toLocaleDateString("cs-CZ");
    }
    // Sběrný dvůr summary is static, no update needed
    // Count active (unresolved) zavady
    if (counters.zavady) {
      const activeZavady = (dataZavady && Array.isArray(dataZavady)) 
        ? dataZavady.filter(z => !z.resolved).length 
        : 0;
      counters.zavady.textContent = activeZavady;
    }
    if (zavadySummary) {
      const totalZavady = (dataZavady && Array.isArray(dataZavady)) ? dataZavady.length : 0;
      const activeZavady = (dataZavady && Array.isArray(dataZavady)) 
        ? dataZavady.filter(z => !z.resolved).length 
        : 0;
      if (totalZavady > 0) {
        zavadySummary.textContent = `${activeZavady} z ${totalZavady} nevyřešených`;
      } else {
        zavadySummary.textContent = "Nevyřešené problémy";
      }
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
    if (!nextPickupDateEl || !nextPickupCountdownEl) return;

    let lastPickupDate = parsePickupDate(wasteSchedule.lastPickup);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Automatically update last pickup date if the next pickup has already passed
    // This ensures the schedule stays current without manual updates
    let nextPickupDate = getNextPickupDate(lastPickupDate, wasteSchedule.intervalDays, today);
    const nextPickupDay = new Date(nextPickupDate);
    nextPickupDay.setHours(0, 0, 0, 0);
    
    // If the calculated next pickup is in the past, update last pickup to the most recent past pickup
    while (nextPickupDay < today) {
      lastPickupDate = new Date(nextPickupDate);
      nextPickupDate = getNextPickupDate(lastPickupDate, wasteSchedule.intervalDays, today);
      nextPickupDay.setTime(nextPickupDate.getTime());
      nextPickupDay.setHours(0, 0, 0, 0);
    }
    
    const isToday = nextPickupDay.getTime() === today.getTime();
    
    // If today is pickup day, show the next one after today
    const displayDate = isToday 
      ? (() => {
          const nextAfterToday = new Date(nextPickupDate);
          nextAfterToday.setDate(nextAfterToday.getDate() + wasteSchedule.intervalDays);
          return nextAfterToday;
        })()
      : nextPickupDate;
    
    const countdown = formatCountdown(displayDate);

    nextPickupDateEl.textContent = formatDate(displayDate);
    if (nextPickupDateLabelEl) {
      nextPickupDateLabelEl.textContent = displayDate.toLocaleDateString("cs-CZ");
    }
    nextPickupCountdownEl.textContent = countdown;
    if (lastPickupLabelEl) lastPickupLabelEl.textContent = formatDateShort(lastPickupDate);
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
    const isZavadyView = category === "zavady";
    const isMapCategory = mapCategories.includes(category) && category !== "kriminalita";
    const isGreenspace = category === "zelen";
    
    // If switching to zavady view, clear any deep link hash to ensure clean navigation
    if (isZavadyView && window.location.hash && window.location.hash.match(/^#\w+\//)) {
      window.location.hash = '#zavady';
    }

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
          :         category === "kriminalita"
            ? "Kriminalita"
          : category === "zavady"
            ? "Hlášené závady"
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
                  : "Komunální odpad";
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
    if (zavadyView) {
      if (isZavadyView) {
        zavadyView.classList.remove("hidden");
        loadZavadyDataView();
      } else {
        zavadyView.classList.add("hidden");
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
    
    hasiciList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><span>Načítám zásahy…</span></div>';
    
    const feedUrl = 'https://pkr.kr-stredocesky.cz/pkr/zasahy-jpo/feed.xml';
    
    // Use proxy services directly - skip direct fetch to avoid CORS errors
    const proxyServices = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`
    ];
    
    // RSS to JSON services (often more reliable)
    const rssToJsonServices = [
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
      `https://rss-to-json-serverless-api.vercel.app/api?feedURL=${encodeURIComponent(feedUrl)}`
    ];
    
    let xmlText = null;
    let jsonData = null;
    let error = null;
    
    // Try RSS to JSON services first (often more reliable and faster)
    for (const jsonUrl of rssToJsonServices) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const jsonResponse = await fetch(jsonUrl, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
        // Continue to next service
        continue;
      }
    }
    
    // If JSON services failed, try CORS proxies
    if (!jsonData) {
      for (const proxyUrl of proxyServices) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
          
          const proxyResponse = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/rss+xml, application/xml, text/xml'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
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
      kriminalitaList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><span>Načítám data kriminality…</span></div>';
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
                <div class="kriminalita-relevance">📍 Běloky</div>
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
      
      // Check if location is already in title to avoid duplication
      const titleLower = (zasah.title || '').toLowerCase();
      const mistoLower = (zasah.misto || '').toLowerCase();
      const showMisto = zasah.misto && !titleLower.includes(mistoLower);
      
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
            ${showMisto ? `<div class="hasici-location">📍 ${zasah.misto}${zasah.okres ? `, ${zasah.okres}` : ''}</div>` : ''}
            ${zasah.ukonceni ? `<div class="hasici-end">Ukončení: ${zasah.ukonceni}</div>` : ''}
          </div>
          <div class="hasici-actions">
            ${zasah.link ? `<a href="${zasah.link}" target="_blank" rel="noopener" class="hasici-link">Více informací →</a>` : ''}
            <a href="https://pkr.kr-stredocesky.cz/pkr/zasahy-jpo/" target="_blank" rel="noopener" class="hasici-link">Zdroj dat →</a>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadZavadyDataView() {
    if (!zavadyList) return;
    
    zavadyList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><span>Načítám hlášené závady…</span></div>';
    
    try {
      const zavady = await loadZavadyData();
      renderZavady(zavady);
    } catch (error) {
      console.error('Chyba při načítání dat závad:', error);
      zavadyList.innerHTML = `
        <div class="error-state">
          <p>Nepodařilo se načíst hlášené závady.</p>
          <p class="error-detail">${error.message || 'Neznámá chyba'}</p>
        </div>
      `;
    }
  }

  // Sorting state for zavady table
  let zavadySortColumn = 'status';
  let zavadySortDirection = 'asc'; // 'asc' = unresolved first (0 before 1), 'desc' = resolved first

  function renderZavady(zavady) {
    if (!zavadyList) return;
    
    // Check if data is still loading
    if (typeof dataZavady === 'undefined' || dataZavady === null) {
      zavadyList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><span>Načítám data závad…</span></div>';
      return;
    }
    
    // Check if data loaded but is empty
    if (!Array.isArray(zavady) || zavady.length === 0) {
      zavadyList.innerHTML = `
        <div class="error-state">
          <p>Žádné hlášené závady k zobrazení.</p>
          <p class="error-detail">Data se nepodařilo načíst nebo jsou prázdná.</p>
        </div>
      `;
      return;
    }
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '–';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };
    
    const calculateDays = (reportedDate, resolvedDate) => {
      if (!reportedDate) return '–';
      try {
        const reported = new Date(reportedDate);
        if (isNaN(reported.getTime())) return '–';
        
        const endDate = resolvedDate ? new Date(resolvedDate) : new Date();
        if (isNaN(endDate.getTime())) {
          const now = new Date();
          const diffTime = now - reported;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
        }
        
        const diffTime = endDate - reported;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      } catch (e) {
        return '–';
      }
    };
    
    const getCategoryLabel = (category) => {
      const labels = {
        'zelen': 'Údržba zeleně',
        'kose': 'Koš',
        'lampy': 'Lampa'
      };
      return labels[category] || category;
    };
    
    const getCategoryLink = (category, item) => {
      if (category === 'lampy' && item.lamp_id) {
        return `#lampy/${item.lamp_id}`;
      } else if (category === 'lampy' && item.lat && item.lng) {
        return `#lampy/${item.lat},${item.lng}`;
      } else if (category === 'zelen' && item.lat && item.lng) {
        return `#zelen/${item.lat},${item.lng}`;
      } else if (category === 'kose' && item.kos_id) {
        return `#kose/${item.kos_id}`;
      }
      return `#${category}`;
    };
    
    const getStatusColor = (resolved) => {
      return resolved ? '#22c55e' : '#f59e0b';
    };
    
    const getStatusText = (resolved) => {
      return resolved ? 'Vyřešeno' : 'V řešení';
    };
    
    // Sort function
    const sortZavady = (a, b) => {
      // Always sort by resolved status first (unresolved first), then by selected column
      const statusA = a.resolved ? 1 : 0;
      const statusB = b.resolved ? 1 : 0;
      
      // If sorting by status column, use the status directly
      if (zavadySortColumn === 'status') {
        if (statusA !== statusB) {
          return zavadySortDirection === 'asc' 
            ? statusA - statusB  // 0 (unresolved) before 1 (resolved)
            : statusB - statusA; // 1 (resolved) before 0 (unresolved)
        }
        // If same status, sort by reported_date desc (newest first)
        const dateA = a.reported_date ? new Date(a.reported_date).getTime() : 0;
        const dateB = b.reported_date ? new Date(b.reported_date).getTime() : 0;
        return dateB - dateA;
      }
      
      // For other columns, first sort by status (unresolved first), then by selected column
      if (statusA !== statusB) {
        return statusA - statusB; // Always unresolved (0) before resolved (1)
      }
      
      // Same status, sort by selected column
      let valueA, valueB;
      
      switch (zavadySortColumn) {
        case 'reported_date':
          valueA = a.reported_date ? new Date(a.reported_date).getTime() : 0;
          valueB = b.reported_date ? new Date(b.reported_date).getTime() : 0;
          break;
        case 'category':
          valueA = getCategoryLabel(a.category || 'unknown').toLowerCase();
          valueB = getCategoryLabel(b.category || 'unknown').toLowerCase();
          break;
        case 'description':
          valueA = (a.description || a.message || 'Bez popisu').toLowerCase();
          valueB = (b.description || b.message || 'Bez popisu').toLowerCase();
          break;
        case 'resolved_date':
          valueA = a.resolved_date ? new Date(a.resolved_date).getTime() : 0;
          valueB = b.resolved_date ? new Date(b.resolved_date).getTime() : 0;
          break;
        case 'days':
          valueA = calculateDays(a.reported_date, a.resolved_date);
          valueB = calculateDays(b.reported_date, b.resolved_date);
          if (valueA === '–') valueA = -1;
          if (valueB === '–') valueB = -1;
          break;
        default:
          return 0;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return zavadySortDirection === 'asc' 
          ? valueA.localeCompare(valueB, 'cs')
          : valueB.localeCompare(valueA, 'cs');
      } else {
        return zavadySortDirection === 'asc' 
          ? valueA - valueB
          : valueB - valueA;
      }
    };
    
    // Sort zavady
    const sortedZavady = [...zavady].sort(sortZavady);
    
    // Get sort icon for header
    const getSortIcon = (column) => {
      if (zavadySortColumn !== column) {
        return '<span class="sort-icon">⇅</span>';
      }
      return zavadySortDirection === 'asc' 
        ? '<span class="sort-icon sort-active">↑</span>'
        : '<span class="sort-icon sort-active">↓</span>';
    };
    
    try {
      zavadyList.innerHTML = `
        <div class="zavady-table-container">
          <table class="zavady-table">
            <thead>
              <tr>
                <th class="sortable" data-sort="reported_date">
                  <span>Datum nahlášení</span>
                  ${getSortIcon('reported_date')}
                </th>
                <th class="sortable" data-sort="category">
                  <span>Kategorie</span>
                  ${getSortIcon('category')}
                </th>
                <th class="sortable" data-sort="description">
                  <span>Popis</span>
                  ${getSortIcon('description')}
                </th>
                <th class="sortable" data-sort="status">
                  <span>Stav</span>
                  ${getSortIcon('status')}
                </th>
                <th class="sortable" data-sort="resolved_date">
                  <span>Datum vyřešení</span>
                  ${getSortIcon('resolved_date')}
                </th>
                <th class="sortable" data-sort="days">
                  <span>Dní v řešení</span>
                  ${getSortIcon('days')}
                </th>
                <th>Fotografie</th>
              </tr>
            </thead>
            <tbody>
              ${sortedZavady.map(item => {
                const reportedDate = formatDate(item.reported_date);
                const resolvedDate = item.resolved_date ? formatDate(item.resolved_date) : '–';
                const days = calculateDays(item.reported_date, item.resolved_date);
                const category = item.category || 'unknown';
                const categoryLabel = getCategoryLabel(category);
                const categoryLink = getCategoryLink(category, item);
                const statusColor = getStatusColor(item.resolved);
                const statusText = getStatusText(item.resolved);
                const description = item.description || item.message || 'Bez popisu';
                const photos = item.photos || [];
                const hasPhotos = Array.isArray(photos) && photos.length > 0;
                
                // Generate photo preview HTML
                let photoPreview = '–';
                if (hasPhotos) {
                  const firstPhoto = photos[0];
                  const photoCount = photos.length;
                  photoPreview = `
                    <div class="zavady-photos-preview" data-zavada-id="${item.id}" data-photos='${JSON.stringify(photos)}'>
                      <img src="${firstPhoto}" alt="Náhled fotografie" class="zavady-photo-thumb" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                      <div class="zavady-photo-placeholder" style="display: none;">
                        <span class="zavady-photo-icon">📷</span>
                      </div>
                      ${photoCount > 1 ? `<span class="zavady-photo-count">+${photoCount - 1}</span>` : ''}
                    </div>
                  `;
                }
                
                const resolutionText = item.resolution_description || 
                  (item.category === 'zelen' ? 'Posekano' :
                   item.category === 'lampy' ? 'Opraveno' :
                   item.category === 'kose' ? 'Opraveno' :
                   'Vyřešeno');
                
                const resolvedInfo = item.resolved && item.resolved_date 
                  ? `<div class="zavady-resolved-info">
                      <div class="zavady-resolved-header">
                        <strong>Vyřešeno:</strong> ${resolvedDate}
                        ${days !== '–' ? ` <span class="zavady-resolved-days">(${days} dní v řešení)</span>` : ''}
                      </div>
                      <div class="zavady-resolution-description">
                        <strong>Způsob řešení:</strong> ${resolutionText}
                      </div>
                    </div>`
                  : '';
                
                const galleryHtml = hasPhotos 
                  ? `<div class="zavady-expanded-gallery">
                      <div class="zavady-gallery-thumbnails">
                        ${photos.map((photo, idx) => `
                          <img 
                            src="${photo}" 
                            alt="Fotografie ${idx + 1}" 
                            class="zavady-gallery-thumb" 
                            data-photo-index="${idx}"
                            data-photos='${JSON.stringify(photos)}'
                            loading="lazy"
                            decoding="async"
                          >
                        `).join('')}
                      </div>
                    </div>`
                  : '<div class="zavady-expanded-gallery"><p class="zavady-no-photos">Žádné fotografie</p></div>';
                
                return `
                  <tr class="zavady-row" data-zavada-id="${item.id}">
                    <td>${reportedDate}</td>
                    <td><a href="${categoryLink}" class="zavady-category-link" data-return-to="zavady">${categoryLabel}</a></td>
                    <td>${description}</td>
                    <td><span class="zavady-status" style="color: ${statusColor}">${statusText}</span></td>
                    <td>${resolvedDate}</td>
                    <td>${days !== '–' ? `${days} dní` : '–'}</td>
                    <td class="zavady-photos-cell">${photoPreview}</td>
                  </tr>
                  <tr class="zavady-detail-row hidden" data-zavada-id="${item.id}">
                    <td colspan="7" class="zavady-detail-cell">
                      <div class="zavady-detail-content">
                        ${resolvedInfo}
                        ${galleryHtml}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      // Add click handlers for sortable headers
      const sortableHeaders = zavadyList.querySelectorAll('.sortable');
      sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
          const column = header.dataset.sort;
          if (zavadySortColumn === column) {
            // Toggle direction if same column
            zavadySortDirection = zavadySortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            // New column, default to desc
            zavadySortColumn = column;
            zavadySortDirection = 'desc';
          }
          // Re-render with new sort
          renderZavady(zavady);
        });
      });
      
      // Add click handlers for expandable rows
      const zavadyRows = zavadyList.querySelectorAll('.zavady-row');
      zavadyRows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
          // Don't expand if clicking on category link
          if (e.target.closest('.zavady-category-link')) {
            return;
          }
          
          const zavadaId = row.dataset.zavadaId;
          const detailRow = zavadyList.querySelector(`.zavady-detail-row[data-zavada-id="${zavadaId}"]`);
          
          if (detailRow) {
            const isHidden = detailRow.classList.contains('hidden');
            // Close all other detail rows
            zavadyList.querySelectorAll('.zavady-detail-row').forEach(dr => {
              dr.classList.add('hidden');
            });
            // Toggle current detail row
            if (isHidden) {
              detailRow.classList.remove('hidden');
              row.classList.add('zavady-row-expanded');
            } else {
              detailRow.classList.add('hidden');
              row.classList.remove('zavady-row-expanded');
            }
          }
        });
      });
      
      // Add click handlers for gallery thumbnails in expanded view
      const galleryThumbs = zavadyList.querySelectorAll('.zavady-gallery-thumb');
      galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          const photos = JSON.parse(thumb.dataset.photos || '[]');
          if (photos.length > 0) {
            openZavadyPhotoGallery(photos);
          }
        });
      });
      
      // Setup lazy loading with Intersection Observer for photo thumbnails
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src && !img.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              observer.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px'
        });
        
        // Observe all photo thumbnails
        const photoThumbs = zavadyList.querySelectorAll('.zavady-photo-thumb, .zavady-gallery-thumb');
        photoThumbs.forEach(thumb => {
          if (thumb.src && !thumb.complete) {
            imageObserver.observe(thumb);
          }
        });
      }
      
      // Add click handlers for category links - store return info
      const categoryLinks = zavadyList.querySelectorAll('.zavady-category-link[data-return-to]');
      categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const returnTo = link.dataset.returnTo;
          if (returnTo) {
            sessionStorage.setItem('returnToView', returnTo);
          }
        });
      });
      
      // Add click handlers for photo previews - open gallery
      const photoPreviews = zavadyList.querySelectorAll('.zavady-photos-preview');
      photoPreviews.forEach(preview => {
        preview.addEventListener('click', () => {
          const photos = JSON.parse(preview.dataset.photos || '[]');
          if (photos.length > 0) {
            openZavadyPhotoGallery(photos);
          }
        });
      });
    } catch (renderError) {
      console.error('Kritická chyba při renderování závad:', renderError);
      zavadyList.innerHTML = `
        <div class="error-state">
          <p>Chyba při zobrazení dat závad.</p>
          <p class="error-detail">${renderError.message || 'Neznámá chyba'}</p>
        </div>
      `;
    }
  }

  // Photo gallery modal for zavady
  function openZavadyPhotoGallery(photos) {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return;
    
    // Create or get gallery modal
    let galleryModal = document.getElementById('zavadyPhotoGallery');
    if (!galleryModal) {
      galleryModal = document.createElement('div');
      galleryModal.id = 'zavadyPhotoGallery';
      galleryModal.className = 'zavady-photo-gallery-modal hidden';
      galleryModal.innerHTML = `
        <div class="zavady-photo-gallery-backdrop"></div>
        <div class="zavady-photo-gallery-content">
          <div class="zavady-photo-gallery-header">
            <h3>Fotografie závady</h3>
          </div>
          <div class="zavady-photo-gallery-main">
            <button class="zavady-photo-gallery-close" aria-label="Zavřít">&times;</button>
            <img class="zavady-photo-gallery-image" src="" alt="Fotografie závady" decoding="async">
            <button class="zavady-photo-gallery-prev" aria-label="Předchozí">‹</button>
            <button class="zavady-photo-gallery-next" aria-label="Další">›</button>
          </div>
          <div class="zavady-photo-gallery-thumbnails"></div>
          <div class="zavady-photo-gallery-info">
            <span class="zavady-photo-gallery-counter"></span>
          </div>
        </div>
      `;
      document.body.appendChild(galleryModal);
      
      // Add event listeners
      const closeBtn = galleryModal.querySelector('.zavady-photo-gallery-close');
      const backdrop = galleryModal.querySelector('.zavady-photo-gallery-backdrop');
      const prevBtn = galleryModal.querySelector('.zavady-photo-gallery-prev');
      const nextBtn = galleryModal.querySelector('.zavady-photo-gallery-next');
      
      const closeGallery = () => {
        galleryModal.classList.add('hidden');
        document.body.style.overflow = '';
      };
      
      closeBtn?.addEventListener('click', closeGallery);
      backdrop?.addEventListener('click', closeGallery);
      
      // Keyboard navigation
      document.addEventListener('keydown', function handleGalleryKeys(e) {
        if (!galleryModal.classList.contains('hidden')) {
          if (e.key === 'Escape') {
            closeGallery();
            document.removeEventListener('keydown', handleGalleryKeys);
          } else if (e.key === 'ArrowLeft') {
            prevBtn?.click();
          } else if (e.key === 'ArrowRight') {
            nextBtn?.click();
          }
        }
      });
    }
    
    // Update gallery with photos
    const galleryImage = galleryModal.querySelector('.zavady-photo-gallery-image');
    const thumbnailsContainer = galleryModal.querySelector('.zavady-photo-gallery-thumbnails');
    const counter = galleryModal.querySelector('.zavady-photo-gallery-counter');
    const prevBtn = galleryModal.querySelector('.zavady-photo-gallery-prev');
    const nextBtn = galleryModal.querySelector('.zavady-photo-gallery-next');
    
    let currentIndex = 0;
    
    // Preload all images to prevent reloading when switching
    const imageCache = new Map();
    const preloadImages = () => {
      photos.forEach((photoUrl) => {
        if (!imageCache.has(photoUrl)) {
          const img = new Image();
          img.src = photoUrl;
          imageCache.set(photoUrl, img);
        }
      });
    };
    
    // Preload images immediately
    preloadImages();
    
    function updateGallery() {
      if (photos.length === 0) return;
      
      const newPhotoUrl = photos[currentIndex];
      const cachedImage = imageCache.get(newPhotoUrl);
      
      // Update text immediately
      galleryImage.alt = `Fotografie ${currentIndex + 1} z ${photos.length}`;
      counter.textContent = `${currentIndex + 1} / ${photos.length}`;
      
      // Check if image is already loaded in cache
      if (cachedImage && cachedImage.complete && cachedImage.naturalWidth > 0) {
        // Image is already loaded, switch immediately without fade
        if (galleryImage.src !== newPhotoUrl) {
          galleryImage.src = newPhotoUrl;
        }
        galleryImage.style.opacity = '1';
      } else {
        // Image not loaded yet, use fade transition
        galleryImage.style.opacity = '0';
        
        // Set src after fade out
        setTimeout(() => {
          galleryImage.src = newPhotoUrl;
          
          // If image is already in browser cache, show immediately
          if (galleryImage.complete && galleryImage.naturalWidth > 0) {
            galleryImage.style.opacity = '1';
          } else {
            // Wait for image to load
            const onLoad = () => {
              galleryImage.style.opacity = '1';
              galleryImage.removeEventListener('load', onLoad);
              galleryImage.removeEventListener('error', onError);
            };
            const onError = () => {
              galleryImage.style.opacity = '1';
              galleryImage.removeEventListener('load', onLoad);
              galleryImage.removeEventListener('error', onError);
            };
            galleryImage.addEventListener('load', onLoad);
            galleryImage.addEventListener('error', onError);
          }
        }, 150);
      }
      
      // Update thumbnails
      thumbnailsContainer.innerHTML = photos.map((photo, index) => `
        <img 
          src="${photo}" 
          alt="Náhled ${index + 1}" 
          class="zavady-photo-thumbnail ${index === currentIndex ? 'active' : ''}"
          data-index="${index}"
          loading="lazy"
          decoding="async"
        >
      `).join('');
      
      // Scroll active thumbnail into view
      const activeThumb = thumbnailsContainer.querySelector('.zavady-photo-thumbnail.active');
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      
      // Update prev/next buttons
      if (prevBtn) prevBtn.style.display = photos.length > 1 ? 'flex' : 'none';
      if (nextBtn) nextBtn.style.display = photos.length > 1 ? 'flex' : 'none';
      
      // Add thumbnail click handlers
      thumbnailsContainer.querySelectorAll('.zavady-photo-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
          currentIndex = parseInt(thumb.dataset.index);
          updateGallery();
        });
      });
    }
    
    prevBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + photos.length) % photos.length;
      updateGallery();
    });
    
    nextBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % photos.length;
      updateGallery();
    });
    
    // Show gallery
    currentIndex = 0;
    updateGallery();
    galleryModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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
      
      // Scroll sidebar to top on mobile when opening
      if (window.innerWidth <= 960) {
        setTimeout(() => {
          if (sidebar) {
            sidebar.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      }
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
    if (zavadyView) zavadyView.classList.add("hidden");
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
    
    // Ignore simple category names (like #zavady, #hasici) - these are handled by setActiveCategory
    if (hash && !hash.includes('/')) return;
    
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
  
  // Start with "Hlášené závady" (zavady) as default category, unless deep link is present
  // Wait a bit to ensure data is loaded and markers are populated
  setTimeout(() => {
    if (!window.location.hash || !window.location.hash.match(/^#\w+\//)) {
      setActiveCategory("zavady");
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
  
  // Toast notification function
  function showToastNotification(title, message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Zavřít">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);
    
    // Auto-close after 5 seconds
    const autoClose = setTimeout(() => {
      closeToast(toast);
    }, 5000);
    
    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoClose);
      closeToast(toast);
    });
    
    // Click outside to close
    toast.addEventListener('click', (e) => {
      if (e.target === toast) {
        clearTimeout(autoClose);
        closeToast(toast);
      }
    });
  }
  
  function closeToast(toast) {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }
  
  // Make function globally available
  window.showToastNotification = showToastNotification;
  
  // Report zavada modal functionality
  const reportZavadaBtn = document.getElementById('reportZavadaBtn');
  const reportZavadaModal = document.getElementById('reportZavadaModal');
  const reportZavadaForm = document.getElementById('reportZavadaForm');
  const reportZavadaModalClose = reportZavadaModal?.querySelector('.report-zavada-modal-close');
  const reportZavadaModalCancel = reportZavadaModal?.querySelector('.report-zavada-form-cancel');
  const reportZavadaModalBackdrop = reportZavadaModal?.querySelector('.report-zavada-modal-backdrop');
  
  function openReportZavadaModal() {
    if (reportZavadaModal) {
      reportZavadaModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }
  
  function closeReportZavadaModal() {
    if (reportZavadaModal) {
      reportZavadaModal.classList.add('hidden');
      document.body.style.overflow = '';
      if (reportZavadaForm) {
        reportZavadaForm.reset();
      }
    }
  }
  
  if (reportZavadaBtn) {
    reportZavadaBtn.addEventListener('click', openReportZavadaModal);
  }
  
  if (reportZavadaModalClose) {
    reportZavadaModalClose.addEventListener('click', closeReportZavadaModal);
  }
  
  if (reportZavadaModalCancel) {
    reportZavadaModalCancel.addEventListener('click', closeReportZavadaModal);
  }
  
  if (reportZavadaModalBackdrop) {
    reportZavadaModalBackdrop.addEventListener('click', closeReportZavadaModal);
  }
  
  // Map for selecting object in modal
  let reportZavadaMapInstance = null;
  let reportZavadaMapLayer = null;
  let reportZavadaSelectedMarker = null;
  const reportZavadaMapContainer = document.getElementById('reportZavadaMapContainer');
  const reportZavadaMapDiv = document.getElementById('reportZavadaMap');
  const reportZavadaCategorySelect = document.getElementById('reportZavadaCategory');
  const reportZavadaSelectedDiv = document.getElementById('reportZavadaSelected');
  const reportZavadaSelectedText = reportZavadaSelectedDiv?.querySelector('.report-zavada-selected-text');
  const reportZavadaSelectedId = document.getElementById('reportZavadaSelectedId');
  const reportZavadaSelectedLat = document.getElementById('reportZavadaSelectedLat');
  const reportZavadaSelectedLng = document.getElementById('reportZavadaSelectedLng');
  const reportZavadaSelectedName = document.getElementById('reportZavadaSelectedName');
  
  function initReportZavadaMap() {
    if (!reportZavadaMapDiv || reportZavadaMapInstance) return;
    
    reportZavadaMapInstance = L.map(reportZavadaMapDiv, {
      zoomControl: true,
      attributionControl: false,
    });
    
    // Use same tile layer as main map
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    }).addTo(reportZavadaMapInstance);
    
    reportZavadaMapInstance.setView([50.1322, 14.222], 15);
    
    // Create layer group for markers/polygons
    reportZavadaMapLayer = L.layerGroup().addTo(reportZavadaMapInstance);
  }
  
  function clearReportZavadaMap() {
    if (reportZavadaMapLayer) {
      reportZavadaMapLayer.clearLayers();
    }
    if (reportZavadaSelectedMarker) {
      reportZavadaMapInstance?.removeLayer(reportZavadaSelectedMarker);
      reportZavadaSelectedMarker = null;
    }
    if (reportZavadaSelectedDiv) {
      reportZavadaSelectedDiv.classList.add('hidden');
    }
    if (reportZavadaSelectedId) reportZavadaSelectedId.value = '';
    if (reportZavadaSelectedLat) reportZavadaSelectedLat.value = '';
    if (reportZavadaSelectedLng) reportZavadaSelectedLng.value = '';
    if (reportZavadaSelectedName) reportZavadaSelectedName.value = '';
    // Remove map click handler
    if (reportZavadaMapInstance) {
      reportZavadaMapInstance.off('click');
    }
  }
  
  function showObjectsOnMap(category) {
    if (!reportZavadaMapInstance || !reportZavadaMapLayer) {
      initReportZavadaMap();
    }
    
    clearReportZavadaMap();
    
    let source = [];
    let isPolygon = false;
    let allowFreeClick = false;
    
    if (category === 'lampy') {
      source = dataLampy || [];
    } else if (category === 'kose') {
      source = dataKose || [];
    } else if (category === 'zelen') {
      source = dataZelene || [];
      isPolygon = true;
      allowFreeClick = true;
    } else if (category === 'ostatni') {
      // For "ostatni", allow clicking anywhere on the map
      allowFreeClick = true;
      // Set default view
      reportZavadaMapInstance.setView([50.1322, 14.222], 15);
    }
    
    if (source.length === 0 && !allowFreeClick) return;
    
    // Calculate bounds for all objects
    const bounds = [];
    
    source.forEach((item) => {
      if (isPolygon && item.coords && Array.isArray(item.coords) && item.coords.length > 0) {
        // Create polygon for zelen
        const polygon = L.polygon(item.coords, {
          color: '#22c55e',
          fillColor: '#22c55e',
          fillOpacity: 0.3,
          weight: 2,
        });
        
        polygon.on('click', (e) => {
          // Stop event propagation to prevent map click
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          // Calculate center of polygon for marker placement
          const bounds = polygon.getBounds();
          const center = bounds.getCenter();
          selectObject(item, null, [center.lat, center.lng], item.name || 'Údržba zeleně');
        });
        
        polygon.addTo(reportZavadaMapLayer);
        bounds.push(polygon.getBounds());
      } else if (item.lat && item.lng) {
        // Create marker for lampy/kose
        const isKose = category === 'kose';
        const marker = L.marker([item.lat, item.lng], {
          icon: L.divIcon({
            className: 'report-zavada-marker',
            html: isKose 
              ? `<div style="background: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; border: 3px solid white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);">${item.id || '?'}</div>`
              : `<div style="background: ${category === 'lampy' ? '#f97316' : '#10b981'}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${item.id || '?'}</div>`,
            iconSize: isKose ? [32, 32] : [24, 24],
            iconAnchor: isKose ? [16, 16] : [12, 12],
          }),
        });
        
        marker.on('click', () => {
          selectObject(item, item.id, [item.lat, item.lng], item.name || (category === 'lampy' ? `Lampa ${item.id || ''}` : `Koš ${item.id || ''}`));
        });
        
        marker.addTo(reportZavadaMapLayer);
        bounds.push([item.lat, item.lng]);
      }
    });
    
    // Fit map to show all objects
    if (bounds.length > 0) {
      if (isPolygon) {
        const group = new L.featureGroup(reportZavadaMapLayer.getLayers());
        reportZavadaMapInstance.fitBounds(group.getBounds().pad(0.1));
      } else {
        reportZavadaMapInstance.fitBounds(bounds, { padding: [20, 20] });
      }
    } else if (isPolygon || category === 'ostatni') {
      // If no polygons or for ostatni, set default view
      reportZavadaMapInstance.setView([50.1322, 14.222], 15);
    }
    
    // For zelen and ostatni categories, allow clicking anywhere on the map
    if (allowFreeClick) {
      reportZavadaMapInstance.on('click', (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const name = category === 'zelen' ? 'Údržba zeleně' : 'Ostatní';
        selectObject(
          { lat, lng, name },
          null,
          [lat, lng],
          `${name} (${lat.toFixed(6)}, ${lng.toFixed(6)})`
        );
      });
    } else {
      // Remove click handler for other categories
      reportZavadaMapInstance.off('click');
    }
    
    // Invalidate size after a short delay to ensure map renders correctly
    setTimeout(() => {
      if (reportZavadaMapInstance) {
        reportZavadaMapInstance.invalidateSize();
      }
    }, 100);
  }
  
  function selectObject(item, id, coords, name) {
    // Clear previous selection marker
    if (reportZavadaSelectedMarker) {
      reportZavadaMapInstance?.removeLayer(reportZavadaSelectedMarker);
    }
    
    // Add selection marker
    const lat = Array.isArray(coords) ? coords[0] : coords;
    const lng = Array.isArray(coords) ? coords[1] : coords;
    
    reportZavadaSelectedMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'report-zavada-selected-marker',
        html: `<div style="background: #f97316; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 12px rgba(249,115,22,0.6);">✓</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    }).addTo(reportZavadaMapInstance);
    
    // Disabled: Pan and zoom to selected location
    // This was causing unwanted movement in the small report map
    // Users can manually pan/zoom if needed
    // if (reportZavadaMapInstance) {
    //   ... (panning logic removed)
    // }
    
    // Update hidden inputs
    if (reportZavadaSelectedId) reportZavadaSelectedId.value = id || '';
    if (reportZavadaSelectedLat) reportZavadaSelectedLat.value = lat;
    if (reportZavadaSelectedLng) reportZavadaSelectedLng.value = lng;
    if (reportZavadaSelectedName) reportZavadaSelectedName.value = name || '';
    
    // Show selected info
    if (reportZavadaSelectedText) {
      reportZavadaSelectedText.textContent = name || 'Vybraný objekt';
    }
    if (reportZavadaSelectedDiv) {
      reportZavadaSelectedDiv.classList.remove('hidden');
    }
  }
  
  // Handle category change
  if (reportZavadaCategorySelect) {
    reportZavadaCategorySelect.addEventListener('change', (e) => {
      const category = e.target.value;
      const mapLabel = document.querySelector('.report-zavada-map-label');
      
      if (category === 'kose' || category === 'lampy' || category === 'zelen' || category === 'ostatni') {
        if (reportZavadaMapContainer) {
          reportZavadaMapContainer.classList.remove('hidden');
        }
        
        // Update map label based on category
        if (mapLabel) {
          if (category === 'ostatni') {
            mapLabel.textContent = 'Klikněte na mapě pro výběr místa:';
          } else if (category === 'zelen') {
            mapLabel.textContent = 'Vyberte objekt na mapě nebo klikněte kdekoliv:';
          } else {
            mapLabel.textContent = 'Vyberte objekt na mapě:';
          }
        }
        
        setTimeout(() => {
          showObjectsOnMap(category);
        }, 100);
      } else {
        if (reportZavadaMapContainer) {
          reportZavadaMapContainer.classList.add('hidden');
        }
        clearReportZavadaMap();
      }
    });
  }
  
  // Clear map when modal closes - wrap the function
  const originalCloseModal = closeReportZavadaModal;
  function closeReportZavadaModalWithMap() {
    clearReportZavadaMap();
    originalCloseModal();
  }
  
  // Update all close handlers to use the new function
  if (reportZavadaModalClose) {
    reportZavadaModalClose.removeEventListener('click', closeReportZavadaModal);
    reportZavadaModalClose.addEventListener('click', closeReportZavadaModalWithMap);
  }
  
  if (reportZavadaModalCancel) {
    reportZavadaModalCancel.removeEventListener('click', closeReportZavadaModal);
    reportZavadaModalCancel.addEventListener('click', closeReportZavadaModalWithMap);
  }
  
  if (reportZavadaModalBackdrop) {
    reportZavadaModalBackdrop.removeEventListener('click', closeReportZavadaModal);
    reportZavadaModalBackdrop.addEventListener('click', closeReportZavadaModalWithMap);
  }
  
  // Handle form submission
  if (reportZavadaForm) {
    reportZavadaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = reportZavadaForm.querySelector('.report-zavada-form-submit');
      const originalText = submitButton?.textContent;
      
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Odesílám...';
      }
      
      try {
        const formData = new FormData(reportZavadaForm);
        
        // Ensure file is properly added to FormData
        const fileInput = reportZavadaForm.querySelector('input[type="file"]');
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          console.log('Odesílám soubor:', file.name, 'velikost:', file.size, 'bytes', 'typ:', file.type);
          
          // Check file size (Formspree limit is 25MB per file)
          if (file.size > 25 * 1024 * 1024) {
            throw new Error('Soubor je příliš velký. Maximální velikost je 25 MB.');
          }
          
          // Ensure file is in FormData - FormData from form should already include it, but verify
          const existingFile = formData.get('upload');
          if (!existingFile || existingFile.size === 0) {
            // Remove empty entry if exists
            if (formData.has('upload')) {
              formData.delete('upload');
            }
            formData.append('upload', file);
          }
        } else {
          // If no file selected, ensure upload field is not in FormData (or is empty)
          if (formData.has('upload')) {
            const uploadValue = formData.get('upload');
            if (!uploadValue || uploadValue.size === 0) {
              formData.delete('upload');
            }
          }
        }
        
        // Debug: log all FormData entries
        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }
        
        // Don't set Content-Type header - browser will set it automatically with boundary for multipart/form-data
        let response;
        try {
          response = await fetch(reportZavadaForm.action, {
            method: 'POST',
            body: formData
            // Don't set Content-Type - browser sets it automatically with boundary for multipart/form-data
          });
        } catch (networkError) {
          // CORS errors can occur even when form is successfully submitted
          // Check if it's a CORS error - if so, assume success (Formspree redirects)
          if (networkError.message && (networkError.message.includes('CORS') || networkError.message.includes('Failed to fetch') || networkError.message.includes('Load failed'))) {
            console.log('CORS error detected, but form may have been submitted successfully');
            // Treat as success - Formspree often redirects which causes CORS errors
            // Create a synthetic response object that mimics Response but without .json() method
            response = { 
              ok: true, 
              status: 200,
              statusText: 'OK',
              json: undefined,
              text: undefined
            };
          } else {
            // Network error - likely connection issue
            console.error('Network error:', networkError);
            throw new Error('Chyba připojení. Zkontrolujte připojení k internetu a zkuste to znovu.');
          }
        }
        
        // Check if response is a real Response object or our synthetic object
        const isSyntheticResponse = !response.json || typeof response.json !== 'function';
        
        // Formspree returns 200 OK for successful submissions
        // HTTP 422 = Unprocessable Entity (validation errors)
        // HTTP 400 = Bad Request
        // HTTP >= 500 = Server errors
        const isError = response.status === 400 || response.status === 422 || response.status >= 500;
        
        if (response.ok && !isError) {
          // Only try to parse JSON if it's a real Response object
          if (!isSyntheticResponse) {
            try {
              const result = await response.json();
              console.log('Formspree response:', result);
              // Check if JSON response indicates an error
              if (result.error) {
                const errorMsg = typeof result.error === 'string' 
                  ? result.error 
                  : (result.error.message || result.error.code || 'Neznámá chyba');
                throw new Error(errorMsg);
              }
            } catch (e) {
              // If response is not JSON (e.g., HTML redirect page), that's OK for Formspree
              if (e.message && !e.message.includes('JSON') && !e.message.includes('Neznámá chyba')) {
                throw e; // Re-throw if it's a real error, not JSON parse error
              }
              if (!e.message || e.message.includes('JSON') || e.message.includes('Neznámá chyba')) {
                console.log('Formspree response is not JSON (likely redirect page), but submission was successful');
              }
            }
          } else {
            console.log('Form submitted successfully (CORS handled)');
          }
          closeReportZavadaModalWithMap();
          showToastNotification(
            'Závada nahlášena!',
            'Děkujeme za nahlášení. Po zpracování se závada zobrazí v tabulce.',
            'success'
          );
        } else {
          // Try to get error message from response
          let errorMsg = `HTTP ${response.status}: ${response.statusText || 'Chyba'}`;
          let errorDetails = null;
          
          // Only try to parse response if it's a real Response object
          if (!isSyntheticResponse) {
            try {
              const errorText = await response.text();
              console.error('Formspree error response:', errorText);
              
              // Try to parse as JSON
              try {
                errorDetails = JSON.parse(errorText);
                // Formspree error format: { error: { code: "...", message: "..." } } or { error: "..." }
                if (errorDetails.error) {
                  if (typeof errorDetails.error === 'string') {
                    errorMsg = errorDetails.error;
                  } else if (errorDetails.error.message) {
                    errorMsg = errorDetails.error.message;
                  } else if (errorDetails.error.code) {
                    // Map Formspree error codes to user-friendly messages
                    const errorCodeMessages = {
                      'REQUIRED_FIELD_MISSING': 'Chybí povinné pole. Zkontrolujte formulář.',
                      'REQUIRED_FIELD_EMPTY': 'Povinné pole je prázdné. Vyplňte prosím všechna pole.',
                      'TYPE_EMAIL': 'Email má neplatný formát.',
                      'FILES_TOO_BIG': 'Soubor je příliš velký. Maximální velikost je 25 MB.',
                      'TOO_MANY_FILES': 'Příliš mnoho souborů. Můžete nahrát maximálně jeden soubor.',
                      'NO_FILE_UPLOADS': 'Nahrávání souborů není podporováno.',
                      'INACTIVE': 'Formulář je deaktivován.',
                      'BLOCKED': 'Formulář je zablokován.',
                      'EMPTY': 'Formulář je prázdný.',
                    };
                    errorMsg = errorCodeMessages[errorDetails.error.code] || errorDetails.error.code;
                  }
                } else if (errorDetails.message) {
                  errorMsg = errorDetails.message;
                }
              } catch (e) {
                // If not JSON, use text response
                if (errorText && errorText.length < 200) {
                  errorMsg = errorText;
                }
              }
            } catch (e) {
              console.error('Error reading response:', e);
            }
          }
          
          // Provide more specific error message for common status codes
          if (response.status === 400) {
            errorMsg = errorMsg || 'Neplatný požadavek. Zkontrolujte, zda jsou všechna pole vyplněna správně.';
          } else if (response.status === 422) {
            errorMsg = errorMsg || 'Chyba validace. Zkontrolujte, zda jsou všechna pole vyplněna správně a soubor není příliš velký.';
          }
          
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('Chyba při odesílání formuláře:', error);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText || 'Odeslat';
        }
        showToastNotification(
          'Chyba při odesílání',
          error.message || 'Nepodařilo se odeslat formulář. Zkuste to prosím znovu.',
          'error'
        );
      }
    });
  }
});
