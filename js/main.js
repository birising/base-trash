window.addEventListener("DOMContentLoaded", async () => {
  if (typeof loadIncludes === "function") {
    await loadIncludes();
  }

  const themePreferenceKey = "appTheme";
  const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  let themeToggleButton;
  let themeToggleLabel;
  let themeToggleIcon;

  const updateThemeToggle = (theme) => {
    if (!themeToggleButton) return;
    const isDark = theme === "dark";
    themeToggleButton.setAttribute("aria-pressed", String(isDark));
    themeToggleButton.dataset.theme = theme;
    if (themeToggleLabel) themeToggleLabel.textContent = isDark ? "Tmavý" : "Světlý";
    if (themeToggleIcon) themeToggleIcon.textContent = isDark ? "🌙" : "☀️";
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

    themeToggleLabel = themeToggleButton.querySelector(".theme-toggle-label");
    themeToggleIcon = themeToggleButton.querySelector(".theme-toggle-icon");

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
    
    // Handle tile loading errors
    baseLayer.on('tileerror', (error) => {
      console.warn('Map tile loading error:', error);
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
  };

  const layers = {
    kose: L.layerGroup(),
    lampy: L.layerGroup(),
    kontejnery: L.layerGroup(),
    zelenTrava: L.layerGroup(),
    zelenZahony: L.layerGroup(),
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
  const greenspaceLayersControl = document.getElementById("greenspaceLayers");
  const greenspaceLayerInputs = greenspaceLayersControl
    ? greenspaceLayersControl.querySelectorAll("[data-greenspace-layer]")
    : [];
  const mapView = document.getElementById("mapView");
  const streamView = document.getElementById("streamView");
  const wasteView = document.getElementById("wasteView");

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
    const popupTitle = item.category === "lampy" && item.id != null ? `Lampa #${item.id}` : name;
    const useIcon = item.category === "kose" || item.category === "lampy";
    const binStatus = item.category === "kose" ? evaluateBinStatus(item) : null;
    const marker = useIcon
      ? L.marker([lat, lng], {
          icon: buildIcon(item.category, binStatus?.color || color, {
            badge: item.category === "lampy" ? item.id : undefined,
            text: item.category === "lampy" ? null : undefined,
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
      
      // Odkaz na Google Maps s GPS souřadnicemi
      const mapsUrl = `https://www.google.com/maps?q=${item.lat},${item.lng}`;
      
      // Tělo emailu s GPS souřadnicemi a odkazem na mapu
      const bodyText = `Popište závadu a případně přidejte fotku. Děkujeme!

GPS souřadnice: ${gpsCoords}
Odkaz na mapu: ${mapsUrl}`;
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
    }

    marker.bindPopup(popupContent);
    return marker;
  }

  function createPolygon(area, color, style) {
    const baseStyle = style || greenspaceStyles.trava;
    const polygon = L.polygon(area.coords, { ...baseStyle, color: color || baseStyle.color });

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
    layers[category].clearLayers();
    let source = [];
    if (category === "kose") source = dataKose;
    if (category === "lampy") source = dataLampy;
    if (category === "kontejnery") source = dataKontejnery;
    if (category === "hladina") source = dataHladina;

    source.forEach((item) => {
      const shape = createMarker(item, iconColors[category]);
      shape.addTo(layers[category]);
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
    const isMapCategory = mapCategories.includes(category);
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
  
  // Start with "údržba zeleně" (zelen) as default category
  setActiveCategory("zelen");
  setupSidebarToggle();
  initNav();
  
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
});
