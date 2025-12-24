window.addEventListener("DOMContentLoaded", async () => {
  // Initialize first access banner - show on every page load
  function initFirstAccessBanner() {
    const banner = document.getElementById('firstAccessBanner');
    const acceptBtn = document.getElementById('firstAccessAcceptBtn');
    
    if (!banner || !acceptBtn) {
      console.warn('First access banner elements not found');
      return;
    }
    
    // Show banner on every page load after a short delay
    setTimeout(() => {
      if (banner) {
        banner.classList.remove('hidden');
      }
    }, 500);
    
    // Handle accept button click - just hide banner, don't save to localStorage
    acceptBtn.addEventListener('click', () => {
      if (banner) {
        banner.classList.add('hidden');
      }
    });
  }
  
  // Initialize banner immediately - banner is in index.html, not in includes
  initFirstAccessBanner();
  
  if (typeof loadIncludes === "function") {
    await loadIncludes();
  }
  
  // Initialize status indicator
  function initStatusIndicator() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusIcon = statusIndicator?.querySelector('.status-icon');
    const statusText = statusIndicator?.querySelector('.status-text');
    
    if (!statusIndicator || !statusIcon || !statusText) return;
    
    function updateStatus(online) {
      if (online) {
        statusIndicator.classList.remove('offline');
        statusText.textContent = 'Online';
        statusIcon.className = 'fas fa-circle status-icon';
      } else {
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Offline';
        statusIcon.className = 'fas fa-circle status-icon';
      }
    }
    
    // Check initial status
    updateStatus(navigator.onLine);
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      updateStatus(true);
    });
    
    window.addEventListener('offline', () => {
      updateStatus(false);
    });
    
    // Optional: Check connection status periodically
    setInterval(() => {
      if (navigator.onLine) {
        // Try to fetch a small resource to verify actual connectivity
        fetch('https://www.google.com/favicon.ico', { 
          mode: 'no-cors',
          cache: 'no-cache'
        }).then(() => {
          updateStatus(true);
        }).catch(() => {
          updateStatus(false);
        });
      } else {
        updateStatus(false);
      }
    }, 30000); // Check every 30 seconds
  }
  
  initStatusIndicator();

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
    const result = await loadZavadyData();
    dataZavady = result.zavady || result; // Support both old and new format
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

  // Create custom layer control (inspired by Google Maps)
  const LayerControl = L.Control.extend({
    onAdd: function(map) {
      const container = L.DomUtil.create('div', 'leaflet-layer-control');
      container.innerHTML = `
        <div class="layer-control-panel">
          <button class="layer-control-toggle" aria-label="Vrstvy mapy" title="Vrstvy mapy">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <div class="layer-control-menu hidden">
            <div class="layer-control-header">Vrstvy mapy</div>
            <label class="layer-control-item">
              <input type="checkbox" data-map-layer="lampy" ${mapLayersVisibility.lampy ? 'checked' : ''}>
              <span class="layer-control-icon">💡</span>
              <span>Lampy</span>
            </label>
            <label class="layer-control-item">
              <input type="checkbox" data-map-layer="kose" ${mapLayersVisibility.kose ? 'checked' : ''}>
              <span class="layer-control-icon">🗑️</span>
              <span>Koše</span>
            </label>
            <label class="layer-control-item">
              <input type="checkbox" data-map-layer="zavady" ${mapLayersVisibility.zavady ? 'checked' : ''}>
              <span class="layer-control-icon">📍</span>
              <span>Závady</span>
            </label>
            <label class="layer-control-item">
              <input type="checkbox" data-map-layer="zelen" ${mapLayersVisibility.zelen ? 'checked' : ''}>
              <span class="layer-control-icon">🌿</span>
              <span>Zeleň</span>
            </label>
          </div>
        </div>
      `;
      
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      
      const toggle = container.querySelector('.layer-control-toggle');
      const menu = container.querySelector('.layer-control-menu');
      
      L.DomEvent.on(toggle, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
        menu.classList.toggle('hidden');
      });
      
      // Close menu when clicking outside
      L.DomEvent.on(map, 'click', function() {
        menu.classList.add('hidden');
      });
      
      // Handle layer toggles
      const layerInputs = container.querySelectorAll('[data-map-layer]');
      layerInputs.forEach(input => {
        L.DomEvent.on(input, 'change', function(e) {
          L.DomEvent.stopPropagation(e);
          const key = input.dataset.mapLayer;
          if (!key || !mapLayersVisibility.hasOwnProperty(key)) return;
          
          const enabled = input.checked;
          mapLayersVisibility[key] = enabled;
          
          // Update layers on map if we're in unified map view
          if (currentCategory === "mapa" && map) {
            requestAnimationFrame(() => {
              Object.entries(layers).forEach(([layerKey, layer]) => {
                const isTravaLayer = layerKey === "zelenTrava";
                const isZahonyLayer = layerKey === "zelenZahony";
                const isZavadyMapaLayer = layerKey === "zavadyMapa";
                let shouldShow = false;
                
                if (layerKey === "lampy") {
                  shouldShow = mapLayersVisibility.lampy;
                } else if (layerKey === "kose") {
                  shouldShow = mapLayersVisibility.kose;
                } else if (isZavadyMapaLayer) {
                  shouldShow = mapLayersVisibility.zavady;
                } else if (isTravaLayer) {
                  shouldShow = mapLayersVisibility.zelen && greenspaceVisibility.trava;
                } else if (isZahonyLayer) {
                  shouldShow = mapLayersVisibility.zelen && greenspaceVisibility.zahony;
                }
                
                const isOnMap = map.hasLayer(layer);
                if (shouldShow && !isOnMap) {
                  map.addLayer(layer);
                } else if (!shouldShow && isOnMap) {
                  map.removeLayer(layer);
                }
              });
              
              // Update bounds to show all visible layers
              const updateBounds = () => {
                const visibleLayers = [];
                Object.entries(layers).forEach(([layerKey, layer]) => {
                  if (map.hasLayer(layer)) {
                    if (layerKey === "lampy" || layerKey === "kose" || layerKey === "zavadyMapa") {
                      layer.eachLayer((marker) => {
                        if (marker.getLatLng) {
                          visibleLayers.push(marker);
                        }
                      });
                    } else if (layerKey === "zelenTrava" || layerKey === "zelenZahony") {
                      layer.eachLayer((polygon) => {
                        if (polygon.getBounds) {
                          visibleLayers.push(polygon);
                        }
                      });
                    }
                  }
                });
                
                if (visibleLayers.length > 0) {
                  const group = new L.featureGroup(visibleLayers);
                  const bounds = group.getBounds();
                  if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [28, 28] });
                  }
                }
              };
              
              setTimeout(updateBounds, 100);
            });
          }
        });
      });
      
      return container;
    },
    
    onRemove: function(map) {
      // Cleanup if needed
    }
  });
  
  // Add layer control to map (only show in unified map view)
  const layerControl = new LayerControl({ position: 'bottomright' });
  let layerControlAdded = false;
  
  // Function to show/hide layer control based on current category
  const updateLayerControlVisibility = () => {
    if (!map) return; // Ensure map exists
    
    if (currentCategory === "mapa") {
      if (!layerControlAdded) {
        layerControl.addTo(map);
        layerControlAdded = true;
      }
      // Hide original HTML overlay when Leaflet control is active
      if (mapaLayersControl) {
        mapaLayersControl.classList.add("hidden");
      }
    } else {
      if (layerControlAdded) {
        map.removeControl(layerControl);
        layerControlAdded = false;
      }
      // Show original HTML overlay when Leaflet control is not active
      if (mapaLayersControl && mapCategories.includes(currentCategory)) {
        mapaLayersControl.classList.remove("hidden");
      }
    }
  };

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
    // Initialize layer control visibility after map is ready
    setTimeout(() => {
      if (currentCategory === "mapa") {
        updateLayerControlVisibility();
      }
    }, 100);
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
    zavadyMapa: L.layerGroup(),
    udrzbaMapa: L.layerGroup(),
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
  const greenspaceBanner = document.getElementById("greenspaceBanner");
  const mapaLayersControl = document.getElementById("mapaLayers");
  const mapaLayerInputs = mapaLayersControl
    ? mapaLayersControl.querySelectorAll("[data-map-layer]")
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

  const mapCategories = ["kose", "lampy", "kontejnery", "zelen", "mapa", "zavady-mapa"];

  const greenspaceVisibility = { trava: true, zahony: true };
  const mapLayersVisibility = { lampy: false, kose: true, zavady: true, zelen: false };
  let currentCategory = null;
  const DEFAULT_CATEGORY = "hladina";
  let mapClickHandler = null;

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
    const useIcon = item.category === "lampy" || item.category === "kriminalita";
    const binStatus = item.category === "kose" ? evaluateBinStatus(item) : null;
    const marker = useIcon
      ? L.marker([lat, lng], {
          icon: buildIcon(item.category, binStatus?.color || color, {
            badge: item.category === "lampy" ? item.id : undefined,
            text: item.category === "lampy" ? null : (item.category === "kriminalita" ? null : undefined),
          }),
        })
      : item.category === "kose"
        ? L.circleMarker([lat, lng], {
            radius: 10,
            color: "#10b981",
            weight: 2,
            fillColor: "#10b981",
            fillOpacity: 0.85,
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
      // Always show "Sensor not installed" for all bins
      // GPS souřadnice
      const gpsCoords = `${item.lat}, ${item.lng}`;
      
      // Odkaz do aplikace s konkrétním košem
      const appUrl = item.id != null 
        ? `${window.location.origin}${window.location.pathname}#kose/${item.id}`
        : `${window.location.origin}${window.location.pathname}#kose/${item.lat},${item.lng}`;
      
      popupContent += `
        <div class="popup-details">
          <div class="popup-no-sensor">
            <span class="popup-no-sensor-icon">⚠️</span>
            <span class="popup-no-sensor-text">Senzor není osazen</span>
          </div>
        </div>
        <div class="popup-actions">
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
        return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
          <a class="popup-link-icon" href="https://kriminalita.policie.gov.cz" target="_blank" rel="noopener" title="Zdroj dat">🔗</a>
        </div>`;
    }

    marker.bindPopup(popupContent);
    
    // Add form submission handler for lamp reports
    // Add form submit handler for lampy, kose
    if (item.category === "lampy" || item.category === "kose") {
      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        const popupElement = popup.getElement();
        if (!popupElement) return;
        
        // Form handling removed - no longer showing report buttons
      });
      
      // Clean up event listener when popup closes
      marker.on('popupclose', () => {
        const popup = marker.getPopup();
        if (popup) {
          const popupElement = popup.getElement();
          if (popupElement) {
            const popupContent = popupElement.querySelector('.leaflet-popup-content');
            if (popupContent && marker._reportFormHandler) {
              popupContent.removeEventListener('click', marker._reportFormHandler);
              delete marker._reportFormHandler;
            }
          }
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
      
      // Form handling removed - no longer showing report buttons
    });
    
    // Clean up event listener when popup closes
    polygon.on('popupclose', () => {
      const popup = polygon.getPopup();
      if (popup) {
        const popupElement = popup.getElement();
        if (popupElement) {
          const popupContent = popupElement.querySelector('.leaflet-popup-content');
          if (popupContent && polygon._reportFormHandler) {
            popupContent.removeEventListener('click', polygon._reportFormHandler);
            delete polygon._reportFormHandler;
          }
        }
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

  // Generate thumbnail path from full image path
  function getThumbnailPath(originalPath) {
    if (!originalPath) return originalPath;
    
    // If path contains 'assets/', create thumbnail path
    if (originalPath.includes('assets/')) {
      // Option 1: Use thumbs/ subdirectory (e.g., assets/image.jpg -> assets/thumbs/image.jpg)
      const thumbPath = originalPath.replace(/assets\/(.+)/, 'assets/thumbs/$1');
      return thumbPath;
    }
    
    // For external URLs, try to use thumbnail service if available
    // For now, just return original path
    return originalPath;
  }

  // Populate zavady on map
  async function populateZavadyMapLayer(zavady) {
    if (!map || !zavady || !Array.isArray(zavady)) return;
    
    // Clear existing zavady markers
    layers.zavadyMapa.clearLayers();
    
    // Filter zavady that have coordinates
    const zavadyWithCoords = zavady.filter(z => z.lat && z.lng);
    
    if (zavadyWithCoords.length === 0) return;
    
    // Helper functions
    const formatDate = (dateStr) => {
      if (!dateStr) return '–';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };
    
    const getCategoryLabel = (category) => {
      const labels = {
        'zelen': 'Údržba zeleně',
        'udrzba zelene': 'Údržba zeleně',
        'kose': 'Koš',
        'lampy': 'Lampa',
        'ostatni': 'Ostatní'
      };
      return labels[category] || category;
    };
    
    const getStatusText = (status) => {
      if (status === 'new') {
        return 'Oznameno';
      }
      return status || 'Nahlášeno';
    };
    
    const getStatusColor = (status, resolved) => {
      if (resolved) return '#22c55e';
      if (status === 'new') return '#f59e0b';
      return '#f59e0b';
    };
    
    zavadyWithCoords.forEach(zavada => {
      const lat = parseFloat(zavada.lat);
      const lng = parseFloat(zavada.lng);
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Create marker with orange icon
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'zavady-map-marker',
          html: '<div style="background: #f97316; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);">!</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      });
      
      // Store zavada ID in marker options for deep linking
      marker.options.zavadaId = zavada.id;
      
      // Create popup content
      const reportedDate = formatDate(zavada.reported_date);
      const description = zavada.description || 'Bez popisu';
      const statusText = getStatusText(zavada.status);
      const statusColor = getStatusColor(zavada.status, zavada.resolved);
      const categoryLabel = getCategoryLabel(zavada.category || 'unknown');
      const photos = zavada.photos || [];
      const hasPhotos = Array.isArray(photos) && photos.length > 0;
      
      // Photo gallery HTML
      let photoGalleryHtml = '';
      if (hasPhotos) {
        photoGalleryHtml = `
          <div class="zavady-popup-gallery">
            <div class="zavady-popup-gallery-title">Fotografie (${photos.length})</div>
            <div class="zavady-popup-gallery-thumbnails">
              ${photos.map((photo, idx) => `
                <div class="zavady-popup-gallery-thumb-wrapper">
                  <div class="zavady-popup-gallery-thumb-loading">
                    <div class="zavady-popup-gallery-thumb-spinner"></div>
                  </div>
                  <img 
                    src="${getThumbnailPath(photo)}" 
                    data-full-src="${photo}"
                    alt="Fotografie ${idx + 1}" 
                    class="zavady-popup-gallery-thumb" 
                    data-photo-index="${idx}"
                    data-photos='${JSON.stringify(photos)}'
                    loading="lazy"
                    decoding="async"
                    onload="this.parentElement.querySelector('.zavady-popup-gallery-thumb-loading').classList.add('hidden')"
                    onerror="this.src = this.dataset.fullSrc || this.src; this.parentElement.querySelector('.zavady-popup-gallery-thumb-loading').classList.add('hidden')"
                  >
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
      
      // GPS coordinates
      const gpsCoords = `${lat}, ${lng}`;
      const deepLinkUrl = `${window.location.origin}${window.location.pathname}#zavady/${zavada.id}`;
      const appUrl = deepLinkUrl;
      
      const popupContent = `
        <div class="zavady-popup-content">
          <div class="zavady-popup-header">
            <strong>${description}</strong>
            <div class="zavady-popup-meta">
              <span class="zavady-popup-category">${categoryLabel}</span>
              <span class="zavady-popup-status" style="color: ${statusColor}">${statusText}</span>
            </div>
            <div class="zavady-popup-date">Nahlášeno: ${reportedDate}</div>
          </div>
          ${photoGalleryHtml}
          <div class="popup-actions">
            <button class="popup-link-icon copy-deep-link-btn" data-deep-link="${deepLinkUrl}" title="Kopírovat odkaz">
              🔗
            </button>
            ${!zavada.resolved ? `<button class="popup-button popup-button-resolved mark-zavada-resolved-btn" data-zavada-id="${zavada.id}" data-zavada-description="${description}" data-zavada-category="${zavada.category || 'unknown'}" data-zavada-lat="${lat}" data-zavada-lng="${lng}" data-zavada-reported-date="${zavada.reported_date}">Nahlásit odstranění</button>` : ''}
            <form class="lamp-report-form hidden" action="https://formspree.io/f/xkgdbplk" method="POST" enctype="multipart/form-data">
              <input type="hidden" name="form_type" value="zavada_report">
              <input type="hidden" name="zavada_id" value="${zavada.id || 'N/A'}">
              <input type="hidden" name="zavada_name" value="${description}">
              <input type="hidden" name="gps_coords" value="${gpsCoords}">
              <input type="hidden" name="app_url" value="${appUrl}">
              <label class="popup-form-label">
                Váš email:
                <input type="email" name="email" required class="popup-form-input">
              </label>
              <label class="popup-form-label">
                Popis závady:
                <textarea name="message" rows="3" class="popup-form-textarea" placeholder="Popište prosím další závadu..."></textarea>
              </label>
              <label class="popup-form-label">
                Fotografie (volitelné):
                <input type="file" name="upload" accept="image/*" class="popup-form-input">
              </label>
              <button type="submit" class="popup-button">Odeslat</button>
            </form>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        maxWidth: 400,
        className: 'zavady-popup'
      });
      
      // Add event listeners for popup
      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        const popupElement = popup.getElement();
        if (!popupElement) return;
        
        // Force light background with dark text for zavady popup - use setTimeout to ensure Leaflet has finished rendering
        const applyLightTheme = () => {
          const contentWrapper = popupElement.querySelector('.leaflet-popup-content-wrapper');
          const content = popupElement.querySelector('.leaflet-popup-content');
          const tip = popupElement.querySelector('.leaflet-popup-tip');
          
          if (contentWrapper) {
            contentWrapper.style.setProperty('background', 'linear-gradient(145deg, #ffffff, #f8fafc)', 'important');
            contentWrapper.style.setProperty('background-color', '#ffffff', 'important');
            contentWrapper.style.setProperty('background-image', 'none', 'important');
            contentWrapper.style.setProperty('color', '#0b1220', 'important');
            contentWrapper.style.setProperty('border', '1px solid rgba(15, 23, 42, 0.15)', 'important');
          }
          
          if (content) {
            content.style.setProperty('color', '#0b1220', 'important');
            content.style.setProperty('background', 'transparent', 'important');
            content.style.setProperty('background-color', 'transparent', 'important');
            content.style.setProperty('background-image', 'none', 'important');
          }
          
          if (tip) {
            tip.style.setProperty('background', '#ffffff', 'important');
            tip.style.setProperty('background-color', '#ffffff', 'important');
            tip.style.setProperty('background-image', 'none', 'important');
            tip.style.setProperty('border', '1px solid rgba(15, 23, 42, 0.15)', 'important');
          }
          
          // Also set text colors for specific elements only - more efficient
          const categoryEl = popupElement.querySelector('.zavady-popup-category');
          if (categoryEl) {
            categoryEl.style.setProperty('color', '#059669', 'important');
          }
          
          const dateEl = popupElement.querySelector('.zavady-popup-date');
          if (dateEl) {
            dateEl.style.setProperty('color', '#475569', 'important');
          }
          
          const headerStrong = popupElement.querySelector('.zavady-popup-header strong');
          if (headerStrong) {
            headerStrong.style.setProperty('color', '#0b1220', 'important');
          }
          
          // Update URL hash when popup opens
          if (marker.options && marker.options.zavadaId) {
            const newHash = `#zavady/${marker.options.zavadaId}`;
            if (window.location.hash !== newHash) {
              window.history.replaceState(null, '', newHash);
            }
          }
          
          // Add click handler for copy deep link button
          const copyLinkBtn = popupElement.querySelector('.copy-deep-link-btn');
          if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              const deepLink = copyLinkBtn.dataset.deepLink;
              if (deepLink) {
                navigator.clipboard.writeText(deepLink).then(() => {
                  const originalText = copyLinkBtn.innerHTML;
                  copyLinkBtn.innerHTML = '✓';
                  copyLinkBtn.style.background = 'rgba(34, 197, 94, 0.2)';
                  copyLinkBtn.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                  copyLinkBtn.style.color = '#22c55e';
                  setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                    copyLinkBtn.style.background = '';
                    copyLinkBtn.style.borderColor = '';
                    copyLinkBtn.style.color = '';
                  }, 2000);
                  showToastNotification('Odkaz zkopírován', 'Deep link byl zkopírován do schránky', 'success');
                }).catch(err => {
                  console.error('Chyba při kopírování:', err);
                  showToastNotification('Chyba', 'Nepodařilo se zkopírovat odkaz', 'error');
                });
              }
            });
          }
          
          const galleryTitle = popupElement.querySelector('.zavady-popup-gallery-title');
          if (galleryTitle) {
            galleryTitle.style.setProperty('color', '#0b1220', 'important');
          }
          
          // Set default text color for popup content wrapper to ensure all text is dark
          if (contentWrapper) {
            contentWrapper.style.setProperty('color', '#0b1220', 'important');
          }
        };
        
        // Apply immediately and after a short delay to ensure it sticks
        // Reduced number of calls to prevent performance issues
        applyLightTheme();
        setTimeout(applyLightTheme, 50);
        setTimeout(applyLightTheme, 150);
        
        // Use MutationObserver to watch for style changes and reapply
        // But prevent infinite loops by debouncing
        let isApplying = false;
        const observer = new MutationObserver(() => {
          if (isApplying) return; // Prevent infinite loop
          isApplying = true;
          setTimeout(() => {
            applyLightTheme();
            isApplying = false;
          }, 100);
        });
        
        if (popupElement) {
          observer.observe(popupElement, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            subtree: true
          });
          
          // Clean up observer when popup closes
          marker.once('popupclose', () => {
            observer.disconnect();
          });
        }
        
        // Handle gallery thumbnails click - use event delegation to prevent duplicate listeners
        const galleryContainer = popupElement.querySelector('.zavady-popup-gallery-thumbnails');
        if (galleryContainer) {
          galleryContainer.addEventListener('click', (e) => {
            const thumb = e.target.closest('.zavady-popup-gallery-thumb');
            if (thumb) {
              e.stopPropagation();
              const photos = JSON.parse(thumb.dataset.photos || '[]');
              if (photos.length > 0) {
                openZavadyPhotoGallery(photos);
              }
            }
          });
        }
        
        // Form handling removed - no longer showing report buttons
      });
      
      marker.addTo(layers.zavadyMapa);
    });
    
    // Fit map to bounds if we have markers and we're in zavady-mapa view (not unified mapa)
    if (zavadyWithCoords.length > 0 && currentCategory === "zavady-mapa") {
      const bounds = L.latLngBounds(zavadyWithCoords.map(z => [parseFloat(z.lat), parseFloat(z.lng)]));
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
          map.flyToBounds(bounds, { padding: [28, 28], duration: 0.6, easeLinearity: 0.25 });
        }
      }, 100);
    } else if (zavadyWithCoords.length > 0 && currentCategory === "mapa" && mapLayersVisibility.zavady) {
      // For unified map, update bounds to include zavady
      setTimeout(() => {
        if (map) {
          const allCoords = [];
          if (mapLayersVisibility.lampy && dataLampy) {
            allCoords.push(...dataLampy.map(item => [item.lat, item.lng]));
          }
          if (mapLayersVisibility.kose && dataKose) {
            allCoords.push(...dataKose.map(item => [item.lat, item.lng]));
          }
          if (mapLayersVisibility.zavady) {
            allCoords.push(...zavadyWithCoords.map(z => [parseFloat(z.lat), parseFloat(z.lng)]));
          }
          if (mapLayersVisibility.zelen) {
            const gsData = visibleGreenspaceData();
            allCoords.push(...gsData.flatMap((area) => area.coords));
          }
          
          if (allCoords.length > 0) {
            const bounds = L.latLngBounds(allCoords);
            map.invalidateSize();
            map.flyToBounds(bounds, { padding: [28, 28], duration: 0.4, easeLinearity: 0.25 });
          }
        }
      }, 200);
    }
  }

  // Populate udrzba map layer - copy from zavady map but with mini photos instead of orange markers
  async function populateUdrzbaMapLayer(zavady) {
    if (!map || !zavady || !Array.isArray(zavady)) {
      console.warn('populateUdrzbaMapLayer: map nebo zavady není dostupné', { map: !!map, zavady: Array.isArray(zavady) });
      return;
    }
    
    console.log('populateUdrzbaMapLayer: načteno závad:', zavady.length);
    
    // Clear existing udrzba markers and point markers
    layers.udrzbaMapa.clearLayers();
    if (window.udrzbaPointMarkers) {
      window.udrzbaPointMarkers.clear();
    }
    
    // Filter zavady that have coordinates and are not resolved (show only unresolved zavady)
    const zavadyWithCoords = zavady.filter(z => {
      const hasCoords = z.lat && z.lng;
      const isUnresolved = !z.resolved || z.resolved === false;
      return hasCoords && isUnresolved;
    });
    
    console.log('populateUdrzbaMapLayer: závady s koordináty:', zavadyWithCoords.length);
    
    if (zavadyWithCoords.length === 0) {
      console.warn('populateUdrzbaMapLayer: žádné závady s koordináty');
      return;
    }
    
    // Helper functions
    const formatDate = (dateStr) => {
      if (!dateStr) return '–';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };
    
    const getCategoryLabel = (category) => {
      const labels = {
        'zelen': 'Údržba zeleně',
        'udrzba zelene': 'Údržba zeleně',
        'kose': 'Koš',
        'lampy': 'Lampa',
        'ostatni': 'Ostatní'
      };
      return labels[category] || category;
    };
    
    const getStatusText = (status) => {
      if (status === 'new') {
        return 'Oznameno';
      }
      return status || 'Nahlášeno';
    };
    
    const getStatusColor = (status, resolved) => {
      if (resolved) return '#22c55e';
      if (status === 'new') return '#f59e0b';
      return '#f59e0b';
    };
    
    // Helper function to calculate distance between two points in pixels at current zoom
    const getPixelDistance = (lat1, lng1, lat2, lng2) => {
      const point1 = map.latLngToContainerPoint([lat1, lng1]);
      const point2 = map.latLngToContainerPoint([lat2, lng2]);
      return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    };
    
    // Threshold for when to use line (in pixels)
    const MIN_DISTANCE_PX = 60;
    
    // First, collect all marker data and group by position
    const markersData = [];
    const positionGroups = new Map(); // key: "lat,lng", value: array of zavady
    
    zavadyWithCoords.forEach(zavada => {
      const lat = parseFloat(zavada.lat);
      const lng = parseFloat(zavada.lng);
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      const photos = zavada.photos || [];
      const firstPhoto = photos.length > 0 ? photos[0] : null;
      const description = zavada.description || 'Bez popisu';
      const categoryLabel = getCategoryLabel(zavada.category || 'unknown');
      
      // Round coordinates to group nearby positions (within ~1 meter)
      const roundedLat = Math.round(lat * 100000) / 100000;
      const roundedLng = Math.round(lng * 100000) / 100000;
      const positionKey = `${roundedLat},${roundedLng}`;
      
      if (!positionGroups.has(positionKey)) {
        positionGroups.set(positionKey, []);
      }
      positionGroups.get(positionKey).push({ lat, lng, firstPhoto, description, categoryLabel, zavada, photos });
      
      markersData.push({ lat, lng, firstPhoto, description, categoryLabel, zavada, photos, positionKey });
    });
    
    // Calculate if marker should use line (has nearby markers)
    const shouldUseLine = (markerData, index, allMarkers) => {
      for (let otherIndex = 0; otherIndex < allMarkers.length; otherIndex++) {
        if (index !== otherIndex) {
          const distance = getPixelDistance(markerData.lat, markerData.lng, allMarkers[otherIndex].lat, allMarkers[otherIndex].lng);
          if (distance < MIN_DISTANCE_PX && distance > 0) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Check for nearby markers and create markers with photos
    markersData.forEach((markerData, index) => {
      const { lat, lng, firstPhoto, description, categoryLabel, zavada, photos } = markerData;
      
      // Store original position for line calculation
      const originalLat = lat;
      const originalLng = lng;
      
      // Check if should use line (has nearby markers)
      const useLine = shouldUseLine(markerData, index, markersData);
      
      // Create marker with mini photo (or fallback icon if no photo)
      const markerHtml = firstPhoto 
        ? `
          <div class="udrzba-marker-container">
            <img src="${getThumbnailPath(firstPhoto)}" alt="${description}" class="udrzba-marker-photo" onerror="this.style.display='none';">
            <div class="udrzba-marker-label">${description}</div>
            <div class="udrzba-marker-category">${categoryLabel}</div>
          </div>
        `
        : `
          <div class="udrzba-marker-container">
            <div class="udrzba-marker-no-photo" style="width: 50px; height: 50px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; border: 3px solid white; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);">!</div>
            <div class="udrzba-marker-label">${description}</div>
            <div class="udrzba-marker-category">${categoryLabel}</div>
          </div>
        `;
      
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'udrzba-marker',
          html: markerHtml,
          iconSize: useLine ? [120, 100] : [80, 60],
          iconAnchor: useLine ? [60, 95] : [40, 55]
        }),
        draggable: true
      });
      
      // Store original position in marker options
      marker.options.zavadaId = zavada.id;
      marker.options.originalLat = originalLat;
      marker.options.originalLng = originalLng;
      
      // Create polyline for connection to original position and point marker at end
      let polyline = null;
      let pointMarker = null;
      if (useLine) {
        // Get all zavady at this position
        const roundedLat = Math.round(originalLat * 100000) / 100000;
        const roundedLng = Math.round(originalLng * 100000) / 100000;
        const positionKey = `${roundedLat},${roundedLng}`;
        const zavadyAtPosition = positionGroups.get(positionKey) || [];
        
        // Create point marker at original position (only once per position)
        const pointMarkerKey = `point-${positionKey}`;
        if (!window.udrzbaPointMarkers) {
          window.udrzbaPointMarkers = new Map();
        }
        
        if (!window.udrzbaPointMarkers.has(pointMarkerKey)) {
          const pointHtml = '<div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>';
          pointMarker = L.marker([originalLat, originalLng], {
            icon: L.divIcon({
              className: 'udrzba-point-marker',
              html: pointHtml,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            }),
            interactive: true
          });
          
          // Create popup with all zavady at this position
          if (zavadyAtPosition.length > 0) {
            const popupContent = `
              <div style="max-width: 300px;">
                <div style="font-weight: 700; margin-bottom: 12px; color: #0b1220;">Závady na této pozici (${zavadyAtPosition.length}):</div>
                <div style="max-height: 400px; overflow-y: auto;">
                  ${zavadyAtPosition.map((z, idx) => `
                    <div style="padding: 8px; margin-bottom: 8px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #10b981;">
                      <div style="font-weight: 600; color: #0b1220; margin-bottom: 4px;">${z.description}</div>
                      <div style="font-size: 12px; color: #64748b;">${z.categoryLabel}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
            pointMarker.bindPopup(popupContent, {
              maxWidth: 320,
              className: 'udrzba-point-popup'
            });
          }
          
          pointMarker.addTo(layers.udrzbaMapa);
          window.udrzbaPointMarkers.set(pointMarkerKey, pointMarker);
        } else {
          pointMarker = window.udrzbaPointMarkers.get(pointMarkerKey);
        }
        
        const updateLine = () => {
          const markerPos = marker.getLatLng();
          const originalPos = [originalLat, originalLng];
          
          if (polyline) {
            polyline.setLatLngs([markerPos, originalPos]);
          } else {
            polyline = L.polyline([markerPos, originalPos], {
              color: '#10b981',
              weight: 2,
              dashArray: '4, 2',
              opacity: 0.8,
              interactive: false
            }).addTo(layers.udrzbaMapa);
            // Store polyline in marker for later access
            marker._polyline = polyline;
          }
        };
        
        marker.on('drag', updateLine);
        marker.on('dragend', updateLine);
        
        // Update line on zoom and move
        const updateLineOnMapChange = () => {
          if (map.hasLayer(marker) && polyline) {
            updateLine();
          }
        };
        map.on('zoom', updateLineOnMapChange);
        map.on('move', updateLineOnMapChange);
        
        // Initial line creation
        setTimeout(updateLine, 100);
      }
      
      // Create popup content (same as zavady map)
      const reportedDate = formatDate(zavada.reported_date);
        const statusText = getStatusText(zavada.status);
        const statusColor = getStatusColor(zavada.status, zavada.resolved);
        
        let photoGalleryHtml = '';
        if (photos.length > 0) {
          photoGalleryHtml = `
            <div class="zavady-popup-gallery">
              <div class="zavady-popup-gallery-title">Fotografie (${photos.length})</div>
              <div class="zavady-popup-gallery-thumbnails">
                ${photos.map((photo, idx) => `
                  <div class="zavady-popup-gallery-thumb-wrapper">
                    <div class="zavady-popup-gallery-thumb-loading">
                      <div class="zavady-popup-gallery-thumb-spinner"></div>
                    </div>
                    <img 
                      src="${getThumbnailPath(photo)}" 
                      data-full-src="${photo}"
                      alt="Fotografie ${idx + 1}" 
                      class="zavady-popup-gallery-thumb" 
                      data-photo-index="${idx}"
                      data-photos='${JSON.stringify(photos)}'
                      loading="lazy"
                      decoding="async"
                      onload="this.parentElement.querySelector('.zavady-popup-gallery-thumb-loading').classList.add('hidden')"
                      onerror="this.src = this.dataset.fullSrc || this.src; this.parentElement.querySelector('.zavady-popup-gallery-thumb-loading').classList.add('hidden')"
                    >
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
        
        const gpsCoords = `${lat}, ${lng}`;
        const deepLinkUrl = `${window.location.origin}${window.location.pathname}#zavady/${zavada.id}`;
        const appUrl = deepLinkUrl;
        
        const popupContent = `
          <div class="zavady-popup-content">
            <div class="zavady-popup-header">
              <strong>${description}</strong>
              <div class="zavady-popup-meta">
                <span class="zavady-popup-category">${categoryLabel}</span>
                <span class="zavady-popup-status" style="color: ${statusColor}">${statusText}</span>
              </div>
              <div class="zavady-popup-date">Nahlášeno: ${reportedDate}</div>
            </div>
            ${photoGalleryHtml}
            <div class="popup-actions">
              <button class="popup-link-icon copy-deep-link-btn" data-deep-link="${deepLinkUrl}" title="Kopírovat odkaz">
                🔗
              </button>
              ${!zavada.resolved ? `<button class="popup-button popup-button-resolved mark-zavada-resolved-btn" data-zavada-id="${zavada.id}" data-zavada-description="${description}" data-zavada-category="${zavada.category || 'unknown'}" data-zavada-lat="${lat}" data-zavada-lng="${lng}" data-zavada-reported-date="${zavada.reported_date}">Nahlásit odstranění</button>` : ''}
              <form class="lamp-report-form hidden" action="https://formspree.io/f/xkgdbplk" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="form_type" value="zavada_report">
                <input type="hidden" name="zavada_id" value="${zavada.id || 'N/A'}">
                <input type="hidden" name="zavada_name" value="${description}">
                <input type="hidden" name="gps_coords" value="${gpsCoords}">
                <input type="hidden" name="app_url" value="${appUrl}">
                <label class="popup-form-label">
                  Váš email:
                  <input type="email" name="email" required class="popup-form-input">
                </label>
                <label class="popup-form-label">
                  Popis závady:
                  <textarea name="message" rows="3" class="popup-form-textarea" placeholder="Popište prosím další závadu..."></textarea>
                </label>
                <label class="popup-form-label">
                  Fotografie (volitelné):
                  <input type="file" name="upload" accept="image/*" class="popup-form-input">
                </label>
                <button type="submit" class="popup-button">Odeslat</button>
              </form>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 400,
          className: 'zavady-popup'
        });
        
        // Add event listeners for popup (same as zavady map)
        marker.on('popupopen', () => {
          const popup = marker.getPopup();
          const popupElement = popup.getElement();
          if (!popupElement) return;
          
          // Force light background with dark text for zavady popup - use setTimeout to ensure Leaflet has finished rendering
          const applyLightTheme = () => {
            const contentWrapper = popupElement.querySelector('.leaflet-popup-content-wrapper');
            const content = popupElement.querySelector('.leaflet-popup-content');
            const tip = popupElement.querySelector('.leaflet-popup-tip');
            
            if (contentWrapper) {
              contentWrapper.style.setProperty('background', 'linear-gradient(145deg, #ffffff, #f8fafc)', 'important');
              contentWrapper.style.setProperty('background-color', '#ffffff', 'important');
              contentWrapper.style.setProperty('background-image', 'none', 'important');
              contentWrapper.style.setProperty('color', '#0b1220', 'important');
              contentWrapper.style.setProperty('border', '1px solid rgba(15, 23, 42, 0.15)', 'important');
            }
            
            if (content) {
              content.style.setProperty('color', '#0b1220', 'important');
              content.style.setProperty('background', 'transparent', 'important');
              content.style.setProperty('background-color', 'transparent', 'important');
              content.style.setProperty('background-image', 'none', 'important');
            }
            
            if (tip) {
              tip.style.setProperty('background', '#ffffff', 'important');
              tip.style.setProperty('background-color', '#ffffff', 'important');
              tip.style.setProperty('background-image', 'none', 'important');
              tip.style.setProperty('border', '1px solid rgba(15, 23, 42, 0.15)', 'important');
            }
            
            // Also set text colors for specific elements only - more efficient
            const categoryEl = popupElement.querySelector('.zavady-popup-category');
            if (categoryEl) {
              categoryEl.style.setProperty('color', '#059669', 'important');
            }
            
            const dateEl = popupElement.querySelector('.zavady-popup-date');
            if (dateEl) {
              dateEl.style.setProperty('color', '#475569', 'important');
            }
            
            const headerStrong = popupElement.querySelector('.zavady-popup-header strong');
            if (headerStrong) {
              headerStrong.style.setProperty('color', '#0b1220', 'important');
            }
            
            // Update URL hash when popup opens
            if (marker.options && marker.options.zavadaId) {
              const newHash = `#zavady/${marker.options.zavadaId}`;
              if (window.location.hash !== newHash) {
                window.history.replaceState(null, '', newHash);
              }
            }
            
            // Add click handler for copy deep link button
            const copyLinkBtn = popupElement.querySelector('.copy-deep-link-btn');
            if (copyLinkBtn) {
              copyLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const deepLink = copyLinkBtn.dataset.deepLink;
                if (deepLink) {
                  navigator.clipboard.writeText(deepLink).then(() => {
                    const originalText = copyLinkBtn.innerHTML;
                    copyLinkBtn.innerHTML = '✓';
                    copyLinkBtn.style.background = 'rgba(34, 197, 94, 0.2)';
                    copyLinkBtn.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                    copyLinkBtn.style.color = '#22c55e';
                    setTimeout(() => {
                      copyLinkBtn.innerHTML = originalText;
                      copyLinkBtn.style.background = '';
                      copyLinkBtn.style.borderColor = '';
                      copyLinkBtn.style.color = '';
                    }, 2000);
                    showToastNotification('Odkaz zkopírován', 'Deep link byl zkopírován do schránky', 'success');
                  }).catch(err => {
                    console.error('Chyba při kopírování:', err);
                    showToastNotification('Chyba', 'Nepodařilo se zkopírovat odkaz', 'error');
                  });
                }
              });
            }
            
            const galleryTitle = popupElement.querySelector('.zavady-popup-gallery-title');
            if (galleryTitle) {
              galleryTitle.style.setProperty('color', '#0b1220', 'important');
            }
            
            // Set default text color for popup content wrapper to ensure all text is dark
            if (contentWrapper) {
              contentWrapper.style.setProperty('color', '#0b1220', 'important');
            }
          };
          
          // Apply immediately and after a short delay to ensure it sticks
          // Reduced number of calls to prevent performance issues
          applyLightTheme();
          setTimeout(applyLightTheme, 50);
          setTimeout(applyLightTheme, 150);
          
          // Use MutationObserver to watch for style changes and reapply
          // But prevent infinite loops by debouncing
          let isApplying = false;
          const observer = new MutationObserver(() => {
            if (isApplying) return; // Prevent infinite loop
            isApplying = true;
            setTimeout(() => {
              applyLightTheme();
              isApplying = false;
            }, 100);
          });
          
          if (popupElement) {
            observer.observe(popupElement, {
              attributes: true,
              attributeFilter: ['style', 'class'],
              subtree: true
            });
            
            // Clean up observer when popup closes
            marker.once('popupclose', () => {
              observer.disconnect();
            });
          }
          
          // Handle gallery thumbnails click - use event delegation to prevent duplicate listeners
          const galleryContainer = popupElement.querySelector('.zavady-popup-gallery-thumbnails');
          if (galleryContainer) {
            galleryContainer.addEventListener('click', (e) => {
              const thumb = e.target.closest('.zavady-popup-gallery-thumb');
              if (thumb) {
                e.stopPropagation();
                const photos = JSON.parse(thumb.dataset.photos || '[]');
                if (photos.length > 0) {
                  openZavadyPhotoGallery(photos);
                }
              }
            });
          }
          
          // Form handling removed - no longer showing report buttons
        });
      
      // Add marker to map
      marker.addTo(layers.udrzbaMapa);
    });
    
    console.log('populateUdrzbaMapLayer: přidáno markerů:', markersData.length);
    
    // Fit map to bounds if we have markers
    const allMarkers = [];
    layers.udrzbaMapa.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options && layer.options.zavadaId) {
        allMarkers.push(layer);
      }
    });
    
    console.log('populateUdrzbaMapLayer: počet markerů ve vrstvě:', allMarkers.length);
    console.log('populateUdrzbaMapLayer: aktuální kategorie:', currentCategory);
    console.log('populateUdrzbaMapLayer: vrstva je na mapě:', map.hasLayer(layers.udrzbaMapa));
    
    // Function to automatically distribute labels to avoid overlaps
    const distributeLabels = () => {
      if (allMarkers.length === 0) return;
      
      const PADDING = 25; // Minimum padding between labels in pixels
      const BASE_DISTANCE = 100; // Base distance from center in pixels
      const MAX_DISTANCE = 350; // Maximum distance from center in pixels
      const DISTANCE_STEP = 15; // Step size for distance search
      
      // Helper function to get marker bounding box from DOM element
      const getMarkerBoxFromDOM = (marker, latlng) => {
        const point = map.latLngToContainerPoint(latlng);
        const iconElement = marker._icon;
        
        if (iconElement) {
          const rect = iconElement.getBoundingClientRect();
          const mapRect = map.getContainer().getBoundingClientRect();
          return {
            left: rect.left - mapRect.left,
            top: rect.top - mapRect.top,
            right: rect.right - mapRect.left,
            bottom: rect.bottom - mapRect.top,
            width: rect.width,
            height: rect.height
          };
        } else {
          // Fallback to calculated size
          const icon = marker.options.icon;
          const iconSize = icon.options.iconSize || [80, 60];
          const iconAnchor = icon.options.iconAnchor || [40, 55];
          return {
            left: point.x - iconAnchor[0],
            top: point.y - iconAnchor[1],
            right: point.x - iconAnchor[0] + iconSize[0],
            bottom: point.y - iconAnchor[1] + iconSize[1],
            width: iconSize[0],
            height: iconSize[1]
          };
        }
      };
      
      // Helper function to check if two boxes overlap
      const boxesOverlap = (box1, box2, padding = PADDING) => {
        return box1.left < box2.right + padding &&
               box1.right + padding > box2.left &&
               box1.top < box2.bottom + padding &&
               box1.bottom + padding > box2.top;
      };
      
      // Helper function to check if position is valid (no overlaps, within bounds)
      const isValidPosition = (newBox, markerBoxes, excludeIndices) => {
        const mapBounds = map.getBounds();
        const centerPoint = L.point(newBox.left + (newBox.width / 2), newBox.top + (newBox.height / 2));
        const newLatLng = map.containerPointToLatLng(centerPoint);
        
        if (!mapBounds.contains(newLatLng)) return false;
        
        // Check bounds - ensure box is within map container
        const mapSize = map.getSize();
        if (newBox.left < 0 || newBox.top < 0 || 
            newBox.right > mapSize.x || newBox.bottom > mapSize.y) {
          return false;
        }
        
        for (let k = 0; k < markerBoxes.length; k++) {
          if (excludeIndices.includes(k)) continue;
          if (boxesOverlap(newBox, markerBoxes[k].box)) {
            return false;
          }
        }
        return true;
      };
      
      // Force map to update before getting positions
      map.invalidateSize();
      
      // Get all marker data with original positions
      const markerData = allMarkers.map((marker, index) => {
        const latlng = marker.getLatLng();
        const originalLat = marker.options.originalLat || latlng.lat;
        const originalLng = marker.options.originalLng || latlng.lng;
        const originalPoint = map.latLngToContainerPoint([originalLat, originalLng]);
        return {
          marker,
          index,
          originalLat,
          originalLng,
          originalPoint,
          currentLatLng: latlng,
          currentPoint: map.latLngToContainerPoint(latlng)
        };
      });
      
      // Group markers by proximity to their original positions
      const GROUP_RADIUS_PX = 80;
      const groups = [];
      const processed = new Set();
      
      markerData.forEach((data, i) => {
        if (processed.has(i)) return;
        
        const group = {
          center: { lat: data.originalLat, lng: data.originalLng },
          centerPoint: data.originalPoint,
          markers: [i]
        };
        processed.add(i);
        
        // Find nearby markers
        markerData.forEach((other, j) => {
          if (i === j || processed.has(j)) return;
          const dist = Math.sqrt(
            Math.pow(other.originalPoint.x - data.originalPoint.x, 2) +
            Math.pow(other.originalPoint.y - data.originalPoint.y, 2)
          );
          if (dist < GROUP_RADIUS_PX) {
            group.markers.push(j);
            processed.add(j);
          }
        });
        
        groups.push(group);
      });
      
      // Distribute markers in star pattern for each group
      groups.forEach(group => {
        const numMarkers = group.markers.length;
        if (numMarkers === 0) return;
        
        // Calculate angles for star pattern
        const angleStep = 360 / numMarkers;
        const startAngle = 0; // Start from right
        
        // Get all current boxes for collision detection
        const allBoxes = markerData.map((data, idx) => ({
          marker: data.marker,
          box: getMarkerBoxFromDOM(data.marker, data.currentLatLng),
          index: idx
        }));
        
        // Sort markers by distance from center (closest first) for better distribution
        const sortedMarkers = [...group.markers].sort((a, b) => {
          const distA = Math.sqrt(
            Math.pow(markerData[a].currentPoint.x - group.centerPoint.x, 2) +
            Math.pow(markerData[a].currentPoint.y - group.centerPoint.y, 2)
          );
          const distB = Math.sqrt(
            Math.pow(markerData[b].currentPoint.x - group.centerPoint.x, 2) +
            Math.pow(markerData[b].currentPoint.y - group.centerPoint.y, 2)
          );
          return distA - distB;
        });
        
        sortedMarkers.forEach((markerIndex, groupIndex) => {
          const data = markerData[markerIndex];
          const marker = data.marker;
          
          // Calculate angle for this marker in star
          const angle = (startAngle + groupIndex * angleStep) % 360;
          const rad = (angle * Math.PI) / 180;
          
          // Try to place marker at increasing distances
          let placed = false;
          for (let distance = BASE_DISTANCE; distance <= MAX_DISTANCE && !placed; distance += DISTANCE_STEP) {
            const newX = group.centerPoint.x + Math.cos(rad) * distance;
            const newY = group.centerPoint.y + Math.sin(rad) * distance;
            
            const icon = marker.options.icon;
            const iconSize = icon.options.iconSize || [80, 60];
            const iconAnchor = icon.options.iconAnchor || [40, 55];
            const newBox = {
              left: newX - iconAnchor[0],
              top: newY - iconAnchor[1],
              right: newX - iconAnchor[0] + iconSize[0],
              bottom: newY - iconAnchor[1] + iconSize[1],
              width: iconSize[0],
              height: iconSize[1]
            };
            
            // Check collision with all other markers (use current positions)
            let hasCollision = false;
            for (let k = 0; k < allMarkers.length; k++) {
              if (k === markerIndex) continue;
              
              // Get current box of other marker
              const otherMarker = allMarkers[k];
              const otherLatLng = otherMarker.getLatLng();
              const otherBox = getMarkerBoxFromDOM(otherMarker, otherLatLng);
              
              if (boxesOverlap(newBox, otherBox)) {
                hasCollision = true;
                break;
              }
            }
            
            // Also check bounds
            const mapBounds = map.getBounds();
            const centerPoint = L.point(newBox.left + (newBox.width / 2), newBox.top + (newBox.height / 2));
            const newLatLng = map.containerPointToLatLng(centerPoint);
            const mapSize = map.getSize();
            
            if (!hasCollision && 
                mapBounds.contains(newLatLng) &&
                newBox.left >= 0 && newBox.top >= 0 &&
                newBox.right <= mapSize.x && newBox.bottom <= mapSize.y) {
              // Valid position found
              marker.setLatLng(newLatLng);
              data.currentLatLng = newLatLng;
              data.currentPoint = map.latLngToContainerPoint(newLatLng);
              
              // Update line
              if (marker._polyline) {
                marker._polyline.setLatLngs([newLatLng, [data.originalLat, data.originalLng]]);
              }
              
              placed = true;
            }
          }
        });
      });
      
      // Final update of all lines
      allMarkers.forEach(marker => {
        if (marker._polyline && marker.options.originalLat && marker.options.originalLng) {
          const currentPos = marker.getLatLng();
          const originalPos = [marker.options.originalLat, marker.options.originalLng];
          marker._polyline.setLatLngs([currentPos, originalPos]);
        }
      });
    };
    
    // Distribute labels after a short delay to ensure map is rendered
    if (allMarkers.length > 0 && currentCategory === "udrzba-mapa") {
      const redistributeOnMapChange = () => {
        setTimeout(() => {
          distributeLabels();
          // Update lines after distribution
          allMarkers.forEach(marker => {
            if (marker._polyline && marker.options.originalLat && marker.options.originalLng) {
              const currentPos = marker.getLatLng();
              const originalPos = [marker.options.originalLat, marker.options.originalLng];
              marker._polyline.setLatLngs([currentPos, originalPos]);
            }
          });
        }, 100);
      };
      
      setTimeout(() => {
        map.whenReady(() => {
          // Wait for all markers to be rendered
          setTimeout(() => {
            // Force map to update
            map.invalidateSize();
            
            // Wait a bit more for DOM to update
            requestAnimationFrame(() => {
              setTimeout(() => {
                distributeLabels();
                // Update lines after distribution
                allMarkers.forEach(marker => {
                  if (marker._polyline && marker.options.originalLat && marker.options.originalLng) {
                    const currentPos = marker.getLatLng();
                    const originalPos = [marker.options.originalLat, marker.options.originalLng];
                    marker._polyline.setLatLngs([currentPos, originalPos]);
                  }
                });
                
                // Redistribute on zoom and move
                map.on('zoomend', redistributeOnMapChange);
                map.on('moveend', redistributeOnMapChange);
              }, 300);
            });
          }, 800);
        });
      }, 500);
    }
    
    if (allMarkers.length > 0 && currentCategory === "udrzba-mapa") {
      const group = new L.featureGroup(allMarkers);
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        console.log('populateUdrzbaMapLayer: fitování mapy na bounds:', bounds);
        requestAnimationFrame(() => {
          if (map) {
            map.invalidateSize();
            map.flyToBounds(bounds, { padding: [28, 28], duration: 0.6, easeLinearity: 0.25 });
          }
        });
      }
    }
  }

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

  function syncMapaLayerInputs() {
    if (!mapaLayerInputs.length) return;
    mapaLayerInputs.forEach((input) => {
      const key = input.dataset.mapLayer;
      if (key && mapLayersVisibility.hasOwnProperty(key)) {
        input.checked = mapLayersVisibility[key];
      }
    });
  }

  // Update sběrný dvůr status function
  function updateSbernyDvurStatus() {
    const wasteSbernyDvurEl = document.getElementById("wasteSbernyDvur");
    const odpadCounterEl = counters.odpad;
    if (!wasteSbernyDvurEl) return;
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Time in minutes from midnight
    const openTime = 8 * 60; // 8:00 in minutes
    const closeTime = 16 * 60; // 16:00 in minutes
    
    const isOpen = dayOfWeek === 6 && currentTime >= openTime && currentTime < closeTime;
    
    if (isOpen) {
      wasteSbernyDvurEl.textContent = "Sběrný dvůr otevřen";
      wasteSbernyDvurEl.style.color = "var(--accent)";
      wasteSbernyDvurEl.style.fontWeight = "800";
      wasteSbernyDvurEl.style.fontSize = "26px";
      wasteSbernyDvurEl.style.lineHeight = "1.2";
      wasteSbernyDvurEl.style.marginTop = "0";
      wasteSbernyDvurEl.style.marginBottom = "4px";
      
      // Move sběrný dvůr above odpad date
      const parent = wasteSbernyDvurEl.parentElement;
      if (parent && odpadCounterEl && odpadCounterEl.parentElement === parent) {
        parent.insertBefore(wasteSbernyDvurEl, odpadCounterEl);
      }
      
      // Make odpad date smaller when sběrný dvůr is open
      if (odpadCounterEl) {
        odpadCounterEl.style.fontSize = "16px";
        odpadCounterEl.style.opacity = "0.6";
        odpadCounterEl.style.fontWeight = "600";
      }
    } else {
      wasteSbernyDvurEl.textContent = "";
      wasteSbernyDvurEl.style.fontSize = "";
      wasteSbernyDvurEl.style.fontWeight = "";
      wasteSbernyDvurEl.style.color = "";
      wasteSbernyDvurEl.style.marginTop = "";
      wasteSbernyDvurEl.style.marginBottom = "";
      
      // Restore original order
      const parent = wasteSbernyDvurEl.parentElement;
      if (parent && odpadCounterEl && odpadCounterEl.parentElement === parent) {
        parent.insertBefore(odpadCounterEl, wasteSbernyDvurEl);
      }
      
      // Restore odpad date to normal size
      if (odpadCounterEl) {
        odpadCounterEl.style.fontSize = "";
        odpadCounterEl.style.opacity = "";
        odpadCounterEl.style.fontWeight = "";
      }
    }
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
    
    // Update sběrný dvůr status (will be handled by interval, but update here too)
    if (typeof updateSbernyDvurStatus === 'function') {
      updateSbernyDvurStatus();
    }
    // Count active (unresolved) zavady
    if (counters.zavady) {
      try {
        const activeZavady = (typeof dataZavady !== 'undefined' && dataZavady && Array.isArray(dataZavady)) 
        ? dataZavady.filter(z => !z.resolved).length 
        : 0;
      counters.zavady.textContent = activeZavady;
      } catch (error) {
        console.warn('Chyba při aktualizaci počítadla závad:', error);
        counters.zavady.textContent = 0;
      }
    }
    if (zavadySummary) {
      try {
        const totalZavady = (typeof dataZavady !== 'undefined' && dataZavady && Array.isArray(dataZavady)) ? dataZavady.length : 0;
        const activeZavady = (typeof dataZavady !== 'undefined' && dataZavady && Array.isArray(dataZavady)) 
        ? dataZavady.filter(z => !z.resolved).length 
        : 0;
      if (totalZavady > 0) {
        zavadySummary.textContent = `${activeZavady} z ${totalZavady} nevyřešených`;
      } else {
          zavadySummary.textContent = "Nevyřešené problémy";
        }
      } catch (error) {
        console.warn('Chyba při aktualizaci souhrnu závad:', error);
        zavadySummary.textContent = "Nevyřešené problémy";
      }
    }
    if (levelReading) {
      if (streamState.updated) {
        levelReading.textContent = `Naposledy měřeno: ${streamState.updated}`;
      } else {
        levelReading.textContent = "Načítám data senzorů…";
      }
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
    
    // Update layer control visibility after category is set
    updateLayerControlVisibility();

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
          const isZavadyMapaLayer = key === "zavadyMapa";
          const isUdrzbaMapaLayer = key === "udrzbaMapa";
          let shouldShow = false;
          
          if (category === "mapa") {
            // Unified map - show layers based on mapLayersVisibility
            if (key === "lampy") {
              shouldShow = mapLayersVisibility.lampy;
            } else if (key === "kose") {
              shouldShow = mapLayersVisibility.kose;
            } else if (isZavadyMapaLayer) {
              shouldShow = mapLayersVisibility.zavady;
            } else if (isTravaLayer) {
              shouldShow = mapLayersVisibility.zelen && greenspaceVisibility.trava;
            } else if (isZahonyLayer) {
              shouldShow = mapLayersVisibility.zelen && greenspaceVisibility.zahony;
            }
          } else if (isGreenspace) {
            shouldShow = (isTravaLayer && greenspaceVisibility.trava) || (isZahonyLayer && greenspaceVisibility.zahony);
          } else if (category === "zavady-mapa") {
            shouldShow = isZavadyMapaLayer;
          } else if (category === "udrzba-mapa") {
            shouldShow = isUdrzbaMapaLayer;
            if (isUdrzbaMapaLayer && shouldShow) {
              console.log('setActiveCategory: přidávám vrstvu udrzbaMapa na mapu, key:', key);
            }
          } else {
            shouldShow = key === category;
          }
          
          // Check if layer is already on map to avoid duplicate adds
          const isOnMap = map.hasLayer(layer);
          
          if (shouldShow) {
            if (!isOnMap) {
              console.log('setActiveCategory: přidávám vrstvu na mapu:', key);
              map.addLayer(layer);
            } else {
              console.log('setActiveCategory: vrstva už je na mapě:', key);
            }
          } else {
            if (isOnMap) {
              console.log('setActiveCategory: odstraňuji vrstvu z mapy:', key);
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
      let activeData;
      
      if (category === "mapa") {
        // Unified map - load zavady and prepare all data
        loadZavadyData().then(zavady => {
          populateZavadyMapLayer(zavady);
          // Update bounds after zavady are loaded
          if (mapLayersVisibility.zavady) {
            const zavadyWithCoords = zavady.filter(z => z.lat && z.lng);
            if (zavadyWithCoords.length > 0) {
              const allCoords = [];
              if (mapLayersVisibility.lampy && dataLampy) {
                allCoords.push(...dataLampy.map(item => [item.lat, item.lng]));
              }
              if (mapLayersVisibility.kose && dataKose) {
                allCoords.push(...dataKose.map(item => [item.lat, item.lng]));
              }
              allCoords.push(...zavadyWithCoords.map(z => [parseFloat(z.lat), parseFloat(z.lng)]));
              if (mapLayersVisibility.zelen) {
                const gsData = visibleGreenspaceData();
                allCoords.push(...gsData.flatMap((area) => area.coords));
              }
              
              if (allCoords.length > 0) {
                const bounds = L.latLngBounds(allCoords);
                setTimeout(() => {
                  if (map) {
                    map.invalidateSize();
                    map.flyToBounds(bounds, { padding: [28, 28], duration: 0.4, easeLinearity: 0.25 });
                  }
                }, 300);
              }
            }
          }
        }).catch(error => {
          console.error('Chyba při načítání závad pro mapu:', error);
        });
        
        // Collect all coordinates from visible layers (without zavady for now)
        const allCoords = [];
        if (mapLayersVisibility.lampy && dataLampy) {
          allCoords.push(...dataLampy.map(item => [item.lat, item.lng]));
        }
        if (mapLayersVisibility.kose && dataKose) {
          allCoords.push(...dataKose.map(item => [item.lat, item.lng]));
        }
        if (mapLayersVisibility.zelen) {
          const gsData = visibleGreenspaceData();
          allCoords.push(...gsData.flatMap((area) => area.coords));
        }
        
        if (allCoords.length > 0) {
          const bounds = L.latLngBounds(allCoords);
          requestAnimationFrame(() => {
            if (map) {
              map.invalidateSize();
              map.flyToBounds(bounds, { padding: [28, 28], duration: 0.6, easeLinearity: 0.25 });
            }
          });
        } else {
          requestAnimationFrame(() => {
            if (map) {
              map.invalidateSize();
              map.setView([50.1322, 14.222], 14);
            }
          });
        }
        activeData = [];
      } else if (category === "zavady-mapa") {
        // Load and display zavady on map
        loadZavadyData().then(result => {
          const zavady = result.zavady || result; // Support both old and new format
          dataZavady = zavady;
          populateZavadyMapLayer(zavady);
        }).catch(error => {
          console.error('Chyba při načítání závad pro mapu:', error);
        });
        activeData = [];
      } else if (category === "udrzba-mapa") {
        // Load and display udrzba zelene on map
        console.log('setActiveCategory: načítám závady pro mapu údržby');
        loadZavadyData().then(result => {
          const zavady = result.zavady || result; // Support both old and new format
          dataZavady = zavady;
          console.log('setActiveCategory: závady načteny, volám populateUdrzbaMapLayer s', zavady.length, 'závadami');
          populateUdrzbaMapLayer(zavady);
        }).catch(error => {
          console.error('Chyba při načítání závad pro mapu údržby:', error);
        });
        activeData = [];
      } else {
        activeData =
          category === "kose"
            ? dataKose
            : category === "lampy"
              ? dataLampy
              : category === "kontejnery"
                ? dataKontejnery
                : greenspaceData;
      }

      const coords =
        category === "zelen" ? activeData.flatMap((area) => area.coords) : 
        category === "zavady-mapa" || category === "mapa" ? [] : 
        activeData.map((item) => [item.lat, item.lng]);

      if (coords.length && category !== "mapa") {
        const bounds = L.latLngBounds(coords);
        // Ensure map is visible and sized before flying to bounds
        requestAnimationFrame(() => {
          if (map) {
            map.invalidateSize();
            map.flyToBounds(bounds, { padding: [28, 28], duration: 0.6, easeLinearity: 0.25 });
          }
        });
      } else if (category === "zavady-mapa") {
        // Set default view for zavady map
        requestAnimationFrame(() => {
          if (map) {
            map.invalidateSize();
            map.setView([50.1322, 14.222], 14);
          }
        });
      } else if (category === "udrzba-mapa") {
        // Set default view for udrzba map
        requestAnimationFrame(() => {
          if (map) {
            map.invalidateSize();
            map.setView([50.1322, 14.222], 14);
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
          : category === "zavady-mapa"
            ? "Mapa závad"
          : category === "udrzba-mapa"
            ? "Mapa údržby"
          : category === "mapa"
            ? "Mapa"
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
      if (isGreenspace && category !== "mapa") {
        greenspaceLayersControl.classList.remove("hidden");
        syncGreenspaceLayerInputs();
      } else {
        greenspaceLayersControl.classList.add("hidden");
      }
    }
    if (greenspaceBanner) {
      if (isGreenspace && category !== "mapa") {
        greenspaceBanner.classList.remove("hidden");
      } else {
        greenspaceBanner.classList.add("hidden");
      }
    }
    if (mapaLayersControl) {
      if (category === "mapa") {
        // Hide HTML overlay - use Leaflet control instead
        mapaLayersControl.classList.add("hidden");
      } else {
        mapaLayersControl.classList.add("hidden");
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
        // Clear update interval when leaving zavady view
        if (zavadyUpdateInterval) {
          clearInterval(zavadyUpdateInterval);
          zavadyUpdateInterval = null;
        }
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
    
    // Add/remove click handler for reporting zavady on map
    if (map) {
      // Remove existing handler if any
      if (mapClickHandler) {
        map.off('click', mapClickHandler);
        mapClickHandler = null;
      }
      
      // Report zavada functionality removed
    }
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
      return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      
      return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  // Store last updated time and interval for auto-refresh
  let zavadyLastUpdated = null;
  let zavadyUpdateInterval = null;
  
  const formatTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    
    // Calculate total seconds
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Format as MM:SS or M:SS
    const formattedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
  };
  
  // Track if auto-refresh is in progress to avoid multiple simultaneous refreshes
  let zavadyAutoRefreshInProgress = false;
  
  const updateZavadyTimestampDisplay = (skipAutoRefresh = false) => {
    if (!zavadyLastUpdated) return;
    
    const now = new Date();
    const diffMs = now - zavadyLastUpdated;
    const diffMins = Math.floor(diffMs / 60000);
    const timeAgo = formatTimeAgo(zavadyLastUpdated);
    
    // Determine color based on time difference
    const timeColor = diffMins >= 10 ? '#ef4444' : '#22c55e'; // Red if >= 10 min, green otherwise
    
    const headerSubtitle = document.querySelector('#zavadyView .view-header .subtitle');
    if (headerSubtitle) {
      headerSubtitle.innerHTML = `Závady nahlášené zastupitelem Janem Řečínským skrze Munopolis <span style="opacity: 0.7; font-size: 0.9em;">• Aktualizováno před <span style="color: ${timeColor}; font-weight: 600;">${timeAgo}</span></span>`;
    }
    
    // Auto-refresh in background if more than 5 minutes old and not already refreshing
    if (!skipAutoRefresh && diffMins >= 5 && !zavadyAutoRefreshInProgress) {
      zavadyAutoRefreshInProgress = true;
      // Refresh data in background without showing loading state
      loadZavadyData().then(result => {
        const zavady = result.zavady || result;
        dataZavady = zavady;
        if (result.lastUpdated) {
          zavadyLastUpdated = result.lastUpdated;
        }
        // Re-render zavady list silently (this updates the table)
        renderZavady(zavady);
        // Update timestamp display after refresh (skip auto-refresh to avoid recursion)
        updateZavadyTimestampDisplay(true);
        zavadyAutoRefreshInProgress = false;
      }).catch(error => {
        console.error('Chyba při automatickém obnovování dat:', error);
        zavadyAutoRefreshInProgress = false;
      });
    }
  };
  
  // Alias for backward compatibility
  const updateZavadyTimestamp = updateZavadyTimestampDisplay;

  async function loadZavadyDataView() {
    if (!zavadyList) return;
    
    // Clear existing interval if any
    if (zavadyUpdateInterval) {
      clearInterval(zavadyUpdateInterval);
      zavadyUpdateInterval = null;
    }
    
    zavadyList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><span>Načítám hlášené závady…</span></div>';
    
    try {
      const result = await loadZavadyData();
      const zavady = result.zavady || result; // Support both old and new format
      dataZavady = zavady;
      
      // Store last updated time and start auto-refresh
      if (result.lastUpdated) {
        zavadyLastUpdated = result.lastUpdated;
        updateZavadyTimestamp();
        
        // Update every second for live countdown
        zavadyUpdateInterval = setInterval(() => {
          updateZavadyTimestamp();
        }, 1000); // Update every 1 second
      }
      
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

  // Initialize map for zavada detail
  function initializeZavadyMap(container, lat, lng) {
    if (!window.L || !container) return;
    
    // Small delay to ensure container is visible
    setTimeout(() => {
      try {
        const map = L.map(container, {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          dragging: true,
          touchZoom: true
        });
        
        // Set view to zavada location
        map.setView([lat, lng], 16);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);
        
        // Add marker
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'zavady-map-marker',
            html: '<div style="background: #f97316; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.6);">!</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        }).addTo(map);
        
        // Store map instance for cleanup
        container._mapInstance = map;
        
        // Invalidate size after a short delay to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (error) {
        console.error('Chyba při inicializaci mapy závady:', error);
      }
    }, 50);
  }

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
        return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };
    
    const formatDateShort = (dateStr) => {
      if (!dateStr) return '–';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
        'udrzba zelene': 'Údržba zeleně',
        'kose': 'Koš',
        'lampy': 'Lampa',
        'ostatni': 'Ostatní'
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
    
    const getStatusColor = (status, resolved) => {
      if (resolved) return '#22c55e';
      if (status === 'new') return '#f59e0b';
      return '#f59e0b';
    };
    
    const getStatusText = (status) => {
      if (status === 'new') {
        return 'Oznameno';
      }
      return status || 'Nahlášeno';
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
                // Use shorter date format on mobile
                const isMobile = window.innerWidth <= 960;
                const reportedDate = isMobile 
                  ? formatDateShort(item.reported_date) 
                  : formatDate(item.reported_date);
                const resolvedDate = item.resolved_date 
                  ? (isMobile ? formatDateShort(item.resolved_date) : formatDate(item.resolved_date))
                  : '–';
                const days = calculateDays(item.reported_date, item.resolved_date);
                const category = item.category || 'unknown';
                const categoryLabel = getCategoryLabel(category);
                const categoryLink = getCategoryLink(category, item);
                const statusColor = getStatusColor(item.status, item.resolved);
                const statusText = getStatusText(item.status);
                const description = item.description || item.message || 'Bez popisu';
                const photos = item.photos || [];
                const hasPhotos = Array.isArray(photos) && photos.length > 0;
                
                // Generate photo preview HTML
                let photoPreview = '–';
                if (hasPhotos) {
                  const firstPhoto = photos[0];
                  const photoCount = photos.length;
                  const thumbnailPath = getThumbnailPath(firstPhoto);
                  photoPreview = `
                    <div class="zavady-photos-preview" data-zavada-id="${item.id}" data-photos='${JSON.stringify(photos)}'>
                      <img src="${thumbnailPath}" data-full-src="${firstPhoto}" alt="Náhled fotografie" class="zavady-photo-thumb" loading="lazy" decoding="async" onerror="this.src = this.dataset.fullSrc || this.src; if (this.complete && this.naturalWidth === 0) { this.style.display='none'; this.nextElementSibling.style.display='flex'; }">
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
                          <div class="zavady-gallery-thumb-wrapper">
                            <div class="zavady-gallery-thumb-loading">
                              <div class="zavady-gallery-thumb-spinner"></div>
                            </div>
                            <img 
                              src="${getThumbnailPath(photo)}" 
                              data-full-src="${photo}"
                              alt="Fotografie ${idx + 1}" 
                              class="zavady-gallery-thumb" 
                              data-photo-index="${idx}"
                              data-photos='${JSON.stringify(photos)}'
                              loading="lazy"
                              decoding="async"
                              onload="this.parentElement.querySelector('.zavady-gallery-thumb-loading').classList.add('hidden')"
                              onerror="this.src = this.dataset.fullSrc || this.src; this.parentElement.querySelector('.zavady-gallery-thumb-loading').classList.add('hidden')"
                            >
                          </div>
                        `).join('')}
                      </div>
                    </div>`
                  : '<div class="zavady-expanded-gallery"><p class="zavady-no-photos">Žádné fotografie</p></div>';
                
                // Map HTML - only if we have coordinates
                const mapHtml = (item.lat && item.lng) 
                  ? `<div class="zavady-map-container">
                      <div class="zavady-map-header">
                        <strong>Lokace závady</strong>
                      </div>
                      <div id="zavady-map-${item.id}" class="zavady-map" data-lat="${item.lat}" data-lng="${item.lng}"></div>
                    </div>`
                  : '';
                
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
                        ${mapHtml}
                        ${galleryHtml}
                        ${!item.resolved ? `<div class="zavady-detail-actions">
                          <button class="zavada-resolved-button mark-zavada-resolved-btn" data-zavada-id="${item.id}" data-zavada-description="${description}" data-zavada-category="${category}" data-zavada-lat="${item.lat}" data-zavada-lng="${item.lng}" data-zavada-reported-date="${item.reported_date}">Nahlásit odstranění</button>
                        </div>` : ''}
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
            // Close all other detail rows and remove expanded class from all rows
            zavadyList.querySelectorAll('.zavady-detail-row').forEach(dr => {
              dr.classList.add('hidden');
            });
            zavadyList.querySelectorAll('.zavady-row').forEach(r => {
              r.classList.remove('zavady-row-expanded');
            });
            // Toggle current detail row
            if (isHidden) {
              detailRow.classList.remove('hidden');
              row.classList.add('zavady-row-expanded');
              
              // Initialize map if it exists and hasn't been initialized
              const mapContainer = detailRow.querySelector(`#zavady-map-${zavadaId}`);
              if (mapContainer && !mapContainer.dataset.initialized) {
                const lat = parseFloat(mapContainer.dataset.lat);
                const lng = parseFloat(mapContainer.dataset.lng);
                if (!isNaN(lat) && !isNaN(lng)) {
                  initializeZavadyMap(mapContainer, lat, lng);
                  mapContainer.dataset.initialized = 'true';
                }
              }
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

  // Print zavady map function
  function printZavadyMap() {
    if (!dataZavady || !Array.isArray(dataZavady) || dataZavady.length === 0) {
      showToastNotification(
        'Chyba',
        'Žádné závady k tisku.',
        'error'
      );
      return;
    }
    
    // Check if html2canvas is available
    if (typeof html2canvas === 'undefined') {
      showToastNotification(
        'Chyba',
        'Knihovna pro tisk není k dispozici.',
        'error'
      );
      return;
    }
    
    // Switch to map view - ensure it's visible
    const mapView = document.getElementById('mapView');
    if (mapView) {
      mapView.classList.remove('hidden');
      mapView.style.display = 'flex';
    }
    
    // Hide all other views
    document.querySelectorAll('.view').forEach(view => {
      if (view.id !== 'mapView') {
        view.classList.add('hidden');
      }
    });
    
    // Ensure map container is visible
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.style.display = 'block';
      mapContainer.style.visibility = 'visible';
    }
    
    // Get zavady with coordinates and photos
    const zavadyWithCoords = dataZavady.filter(z => z.lat && z.lng);
    
    if (zavadyWithCoords.length === 0) {
      showToastNotification(
        'Chyba',
        'Žádné závady s GPS souřadnicemi k tisku.',
        'error'
      );
      return;
    }
    
    // Store original markers
    const originalMarkers = [];
    layers.zavadyMapa.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        originalMarkers.push(layer);
        layers.zavadyMapa.removeLayer(layer);
      }
    });
    
    // Replace markers with photo markers for print
    const printMarkers = [];
    zavadyWithCoords.forEach(zavada => {
      const lat = parseFloat(zavada.lat);
      const lng = parseFloat(zavada.lng);
      if (isNaN(lat) || isNaN(lng)) return;
      
      const photos = zavada.photos || [];
      const firstPhoto = photos.length > 0 ? photos[0] : null;
      const description = zavada.description || 'Bez popisu';
      const categoryLabel = zavada.category === 'zelen' ? 'Zelen' : 
                           zavada.category === 'udrzba zelene' ? 'Údržba zeleně' :
                           zavada.category === 'kose' ? 'Koš' :
                           zavada.category === 'lampy' ? 'Lampa' : 'Ostatní';
      
      // Create print marker with photo
      if (firstPhoto) {
        const thumbnailPath = getThumbnailPath(firstPhoto);
        const markerHtml = `
          <div class="print-marker-container">
            <img src="${thumbnailPath}" alt="${description}" class="print-marker-photo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="print-marker-fallback" style="display: none; background: #f97316; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 2px solid white;">!</div>
            <div class="print-marker-line"></div>
            <div class="print-marker-label">${description}</div>
            <div class="print-marker-category">${categoryLabel}</div>
          </div>
        `;
        
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'print-zavady-marker',
            html: markerHtml,
            iconSize: [120, 80],
            iconAnchor: [60, 75]
          })
        });
        
        printMarkers.push(marker);
        layers.zavadyMapa.addLayer(marker);
      } else {
        // Fallback marker without photo
        const markerHtml = `
          <div class="print-marker-container">
            <div class="print-marker-fallback" style="background: #f97316; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 2px solid white;">!</div>
            <div class="print-marker-line"></div>
            <div class="print-marker-label">${description}</div>
            <div class="print-marker-category">${categoryLabel}</div>
          </div>
        `;
        
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'print-zavady-marker',
            html: markerHtml,
            iconSize: [120, 60],
            iconAnchor: [60, 55]
          })
        });
        
        printMarkers.push(marker);
        layers.zavadyMapa.addLayer(marker);
      }
    });
    
    // Fit map to show all markers
    if (printMarkers.length > 0) {
      const group = new L.featureGroup(printMarkers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
    
    // Wait for map to render, then capture
    setTimeout(() => {
      // Force map to update size
      map.invalidateSize();
      
      // Wait for tiles to load
      map.whenReady(() => {
        // Wait a bit for all tiles and markers to render
        setTimeout(() => {
          // Invalidate size again to ensure everything is rendered
          map.invalidateSize();
          
          // Force render all markers
          printMarkers.forEach(marker => {
            if (marker._icon) {
              marker._icon.style.visibility = 'visible';
              marker._icon.style.display = 'block';
              marker._icon.style.opacity = '1';
            }
          });
          
          // Wait a bit more for everything to render
          setTimeout(() => {
            // Capture map as image using html2canvas
            html2canvas(mapContainer, {
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#f5f5f5',
              scale: 2, // Higher quality
              logging: false,
              width: mapContainer.offsetWidth,
              height: mapContainer.offsetHeight
            }).then(canvas => {
              // Create a new window with the map image for printing
              const printWindow = window.open('', '_blank');
              if (!printWindow) {
                showToastNotification(
                  'Chyba',
                  'Nepodařilo se otevřít okno pro tisk. Zkontrolujte blokování pop-up oken.',
                  'error'
                );
                // Restore original markers
                printMarkers.forEach(marker => {
                  layers.zavadyMapa.removeLayer(marker);
                });
                originalMarkers.forEach(marker => {
                  layers.zavadyMapa.addLayer(marker);
                });
                return;
              }
              
              // Get image data
              const imgData = canvas.toDataURL('image/png');
              
              // Create print HTML
              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Mapa závad - Tisk</title>
                  <style>
                    @page {
                      size: A4 landscape;
                      margin: 0.5cm;
                    }
                    body {
                      margin: 0;
                      padding: 0;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                      background: white;
                    }
                    img {
                      max-width: 100%;
                      max-height: 100vh;
                      width: auto;
                      height: auto;
                      object-fit: contain;
                    }
                    @media print {
                      body {
                        margin: 0;
                        padding: 0;
                      }
                      img {
                        width: 100%;
                        height: 100vh;
                        object-fit: contain;
                      }
                    }
                  </style>
                </head>
                <body>
                  <img src="${imgData}" alt="Mapa závad" />
                </body>
                </html>
              `);
              
              printWindow.document.close();
              
              // Wait for image to load, then print
              printWindow.onload = () => {
                setTimeout(() => {
                  printWindow.print();
                  
                  // Restore original markers after printing
                  setTimeout(() => {
                    printWindow.close();
                    // Remove print markers
                    printMarkers.forEach(marker => {
                      layers.zavadyMapa.removeLayer(marker);
                    });
                    // Restore original markers
                    originalMarkers.forEach(marker => {
                      layers.zavadyMapa.addLayer(marker);
                    });
                  }, 1000);
                }, 500);
              };
            }).catch(error => {
              console.error('Chyba při zachycení mapy:', error);
              showToastNotification(
                'Chyba',
                'Nepodařilo se zachytit mapu pro tisk.',
                'error'
              );
              // Restore original markers
              printMarkers.forEach(marker => {
                layers.zavadyMapa.removeLayer(marker);
              });
              originalMarkers.forEach(marker => {
                layers.zavadyMapa.addLayer(marker);
              });
            });
          }, 1000);
        }, 1000);
      });
    }, 500);
  }
  
  // Print button removed

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
            <div class="zavady-photo-gallery-loading">
              <div class="zavady-photo-gallery-spinner"></div>
            </div>
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
    const galleryLoading = galleryModal.querySelector('.zavady-photo-gallery-loading');
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
      
      // If switching to a different image, hide current one first
      if (galleryImage.src && galleryImage.src !== newPhotoUrl) {
        galleryImage.style.opacity = '0';
      }
      
      // Show loading spinner
      if (galleryLoading) {
        galleryLoading.classList.remove('hidden');
      }
      
      // Check if image is already loaded in cache
      if (cachedImage && cachedImage.complete && cachedImage.naturalWidth > 0) {
        // Image is already loaded, switch immediately
        galleryImage.src = newPhotoUrl;
        // Use requestAnimationFrame to ensure smooth transition
        requestAnimationFrame(() => {
          galleryImage.style.opacity = '1';
          if (galleryLoading) {
            galleryLoading.classList.add('hidden');
          }
        });
      } else {
        // Image not loaded yet, use fade transition
        // Set src immediately (browser will start loading)
        galleryImage.src = newPhotoUrl;
        
        // If image is already in browser cache, show immediately
        if (galleryImage.complete && galleryImage.naturalWidth > 0) {
          requestAnimationFrame(() => {
            galleryImage.style.opacity = '1';
            if (galleryLoading) {
              galleryLoading.classList.add('hidden');
            }
          });
        } else {
          // Wait for image to load
          const onLoad = () => {
            galleryImage.style.opacity = '1';
            if (galleryLoading) {
              galleryLoading.classList.add('hidden');
            }
            galleryImage.removeEventListener('load', onLoad);
            galleryImage.removeEventListener('error', onError);
          };
          const onError = () => {
            galleryImage.style.opacity = '1';
            if (galleryLoading) {
              galleryLoading.classList.add('hidden');
            }
            galleryImage.removeEventListener('load', onLoad);
            galleryImage.removeEventListener('error', onError);
          };
          galleryImage.addEventListener('load', onLoad);
          galleryImage.addEventListener('error', onError);
        }
      }
      
      // Update thumbnails - use thumbnails for faster loading
      thumbnailsContainer.innerHTML = photos.map((photo, index) => `
        <img 
          src="${getThumbnailPath(photo)}" 
          data-full-src="${photo}"
          alt="Náhled ${index + 1}" 
          class="zavady-photo-thumbnail ${index === currentIndex ? 'active' : ''}"
          data-index="${index}"
          loading="lazy"
          decoding="async"
          onerror="this.src = this.dataset.fullSrc || this.src"
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
    
    // Show gallery - hide previous image first
    galleryImage.style.opacity = '0';
    galleryImage.src = ''; // Clear previous image immediately
    currentIndex = 0;
    
    // Show loading spinner immediately (galleryLoading is already defined above)
    if (galleryLoading) {
      galleryLoading.classList.remove('hidden');
    }
    
    // Show modal first
    galleryModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Then update gallery (this will load the correct image)
    updateGallery();
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
    if (zavadyView) {
      zavadyView.classList.add("hidden");
      // Clear update interval when hiding zavady view
      if (zavadyUpdateInterval) {
        clearInterval(zavadyUpdateInterval);
        zavadyUpdateInterval = null;
      }
    }
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
  
  // Update URL with current layer visibility
  function updateLayerParams() {
    if (currentCategory !== "mapa") return;
    
    // Get enabled layers
    const enabledLayers = Object.entries(mapLayersVisibility)
      .filter(([key, enabled]) => enabled)
      .map(([key]) => key);
    
    const url = new URL(window.location);
    
    if (enabledLayers.length > 0) {
      url.searchParams.set('layers', enabledLayers.join(','));
    } else {
      url.searchParams.delete('layers');
    }
    
    // Update URL without reload
    window.history.pushState({}, '', url);
  }

  // Handle URL parameters for map layers (e.g., ?layers=zavady or ?layers=zavady,kose)
  function handleLayerParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const layersParam = urlParams.get('layers');
    
    if (!layersParam) return false;
    
    // Parse layers from URL (e.g., "zavady" or "zavady,kose")
    const requestedLayers = layersParam.split(',').map(l => l.trim().toLowerCase());
    
    // Reset all layers to false
    Object.keys(mapLayersVisibility).forEach(key => {
      mapLayersVisibility[key] = false;
    });
    
    // Set requested layers to true
    requestedLayers.forEach(layer => {
      if (mapLayersVisibility.hasOwnProperty(layer)) {
        mapLayersVisibility[layer] = true;
      }
    });
    
    // If any layers were set, switch to unified map view
    if (requestedLayers.some(layer => mapLayersVisibility.hasOwnProperty(layer))) {
      // Sync checkboxes if they exist
      if (mapaLayerInputs && mapaLayerInputs.length > 0) {
        syncMapaLayerInputs();
      }
      return true;
    }
    
    return false;
  }

  // Handle deep linking from URL hash (e.g., #lampy/1 or #lampy/50.133935,14.222031 or #zelen/50.133935,14.222031 or #zavady-mapa or #zavady/1)
  function handleDeepLink() {
    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return;
    
    // Handle zavady-mapa deep link (map with zavady)
    if (hash === 'zavady-mapa') {
      setTimeout(() => {
        setActiveCategory('zavady-mapa');
      }, 500);
      return;
    }
    
    // Handle zavady/{id} deep link (specific zavada)
    if (hash.startsWith('zavady/')) {
      const zavadaId = hash.split('/')[1];
      if (zavadaId) {
        setTimeout(() => {
          setActiveCategory('zavady-mapa');
          // Wait for zavady to load, then find and open the marker
          setTimeout(() => {
            if (map && layers.zavadyMapa) {
              let foundMarker = null;
              const targetId = parseInt(zavadaId);
              layers.zavadyMapa.eachLayer((marker) => {
                // Check if marker has zavadaId in options
                if (marker.options && marker.options.zavadaId === targetId) {
                  foundMarker = marker;
                }
              });
              if (foundMarker) {
                map.flyTo(foundMarker.getLatLng(), 18, {
                  duration: 0.8,
                  easeLinearity: 0.25
                });
                setTimeout(() => {
                  foundMarker.openPopup();
                }, 900);
              } else {
                // If marker not found, try to load zavady data first
                console.log('Zavada marker not found for ID:', zavadaId, '- waiting for data to load...');
                // Wait a bit more and try again
                setTimeout(() => {
                  layers.zavadyMapa.eachLayer((marker) => {
                    if (marker.options && marker.options.zavadaId === targetId) {
                      foundMarker = marker;
                    }
                  });
                  if (foundMarker) {
                    map.flyTo(foundMarker.getLatLng(), 18, {
                      duration: 0.8,
                      easeLinearity: 0.25
                    });
                    setTimeout(() => {
                      foundMarker.openPopup();
                    }, 900);
                  }
                }, 1500);
              }
            }
          }, 800);
        }, 500);
      }
      return;
    }
    
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
  
  // Handle URL parameters for map layers first
  const hasLayerParams = handleLayerParams();
  
  // Start with "Hladina potoka" (hladina) as default category, unless deep link or layer params are present
  // Wait a bit to ensure data is loaded and markers are populated
  setTimeout(() => {
    if (hasLayerParams) {
      // If layer params are present, switch to unified map
      setActiveCategory("mapa");
    } else if (!window.location.hash || !window.location.hash.match(/^#\w+\//)) {
      setActiveCategory("hladina");
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
  
  // Setup event listeners for unified map layers
  if (mapaLayerInputs.length) {
    mapaLayerInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.mapLayer;
        if (!key || !mapLayersVisibility.hasOwnProperty(key)) return;
        
        const enabled = input.checked;
        mapLayersVisibility[key] = enabled;
        
        // Update layers on map if we're in unified map view
        if (currentCategory === "mapa" && map) {
          requestAnimationFrame(() => {
            Object.entries(layers).forEach(([layerKey, layer]) => {
              const isTravaLayer = layerKey === "zelenTrava";
              const isZahonyLayer = layerKey === "zelenZahony";
              const isZavadyMapaLayer = layerKey === "zavadyMapa";
              let shouldShow = false;
              
              if (layerKey === "lampy") {
                shouldShow = mapLayersVisibility.lampy;
              } else if (layerKey === "kose") {
                shouldShow = mapLayersVisibility.kose;
              } else if (isZavadyMapaLayer) {
                shouldShow = mapLayersVisibility.zavady;
              } else if (isTravaLayer) {
                shouldShow = mapLayersVisibility.zelen && greenspaceVisibility.trava;
              } else if (isZahonyLayer) {
                shouldShow = mapLayersVisibility.zelen && greenspaceVisibility.zahony;
              }
              
              const isOnMap = map.hasLayer(layer);
              if (shouldShow && !isOnMap) {
                map.addLayer(layer);
              } else if (!shouldShow && isOnMap) {
                map.removeLayer(layer);
              }
            });
            
            // Update bounds to show all visible layers
            const updateBounds = () => {
              const allCoords = [];
              if (mapLayersVisibility.lampy && dataLampy) {
                allCoords.push(...dataLampy.map(item => [item.lat, item.lng]));
              }
              if (mapLayersVisibility.kose && dataKose) {
                allCoords.push(...dataKose.map(item => [item.lat, item.lng]));
              }
              if (mapLayersVisibility.zavady) {
                // Get zavady coordinates from markers on map
                layers.zavadyMapa.eachLayer((marker) => {
                  const latlng = marker.getLatLng();
                  allCoords.push([latlng.lat, latlng.lng]);
                });
              }
              if (mapLayersVisibility.zelen) {
                const gsData = visibleGreenspaceData();
                allCoords.push(...gsData.flatMap((area) => area.coords));
              }
              
              if (allCoords.length > 0) {
                const bounds = L.latLngBounds(allCoords);
                map.flyToBounds(bounds, { padding: [28, 28], duration: 0.4, easeLinearity: 0.25 });
              }
            };
            
            // If zavady layer was toggled, wait a bit for markers to be added/removed
            if (key === "zavady") {
              setTimeout(updateBounds, 100);
            } else {
              updateBounds();
            }
            
            map.invalidateSize();
          });
        }
        
        // Update URL with new layer configuration
        updateLayerParams();
      });
    });
    syncMapaLayerInputs();
  }
  fetchStreamLevel();
  
  // Auto-refresh stream data every 5 minutes when page is visible
  let streamRefreshInterval = null;
  const STREAM_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  
  const startStreamAutoRefresh = () => {
    if (streamRefreshInterval) return; // Already running
    
    streamRefreshInterval = setInterval(() => {
      // Only refresh if page is visible
      if (!document.hidden) {
        refreshStreamData(false).catch(error => {
          console.warn('Automatické obnovení dat hladiny potoka selhalo:', error);
        });
      }
    }, STREAM_REFRESH_INTERVAL_MS);
  };
  
  const stopStreamAutoRefresh = () => {
    if (streamRefreshInterval) {
      clearInterval(streamRefreshInterval);
      streamRefreshInterval = null;
    }
  };
  
  // Start auto-refresh when page becomes visible
  if (!document.hidden) {
    startStreamAutoRefresh();
  }
  
  // Handle page visibility changes (pause when tab is in background)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopStreamAutoRefresh();
    } else {
      startStreamAutoRefresh();
      // Refresh immediately when page becomes visible again
      refreshStreamData(false).catch(error => {
        console.warn('Obnovení dat hladiny potoka při zobrazení stránky selhalo:', error);
      });
    }
  });
  
  // Update sběrný dvůr status immediately and then every minute
  updateSbernyDvurStatus();
  setInterval(updateSbernyDvurStatus, 60000); // Update every minute
  
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
  
  // Report zavada modal functionality removed
  
  // Handle "Závada odstraněna" button clicks
  function openResolveZavadaModal(zavadaData) {
    const modal = document.getElementById('resolveZavadaModal');
    if (!modal) return;
    
    // Fill in form fields
    document.getElementById('resolveZavadaId').value = zavadaData.id || '';
    document.getElementById('resolveZavadaCategory').value = zavadaData.category || '';
    document.getElementById('resolveZavadaLat').value = zavadaData.lat || '';
    document.getElementById('resolveZavadaLng').value = zavadaData.lng || '';
    document.getElementById('resolveZavadaReportedDate').value = zavadaData.reportedDate || '';
    
    // Fill in display fields (read-only)
    document.getElementById('resolveZavadaDescription').textContent = zavadaData.description || 'Bez popisu';
    
    const categoryLabels = {
      'zelen': 'Zelen',
      'udrzba zelene': 'Údržba zeleně',
      'kose': 'Koš',
      'lampy': 'Lampa',
      'ostatni': 'Ostatní'
    };
    document.getElementById('resolveZavadaCategoryLabel').textContent = categoryLabels[zavadaData.category] || zavadaData.category || 'Neznámá';
    
    const gpsText = zavadaData.lat && zavadaData.lng 
      ? `${zavadaData.lat}, ${zavadaData.lng}`
      : 'Není k dispozici';
    document.getElementById('resolveZavadaGPS').textContent = gpsText;
    
    let reportedDateLabel = 'Neznámé';
    if (zavadaData.reportedDate) {
      try {
        const date = new Date(zavadaData.reportedDate);
        if (!isNaN(date.getTime())) {
          reportedDateLabel = formatDateShort(date);
        }
      } catch (e) {
        reportedDateLabel = zavadaData.reportedDate;
      }
    }
    document.getElementById('resolveZavadaReportedDateLabel').textContent = reportedDateLabel;
    
    // Show modal
    modal.classList.remove('hidden');
  }
  
  function closeResolveZavadaModal() {
    const modal = document.getElementById('resolveZavadaModal');
    if (modal) {
      modal.classList.add('hidden');
      // Reset form
      const form = document.getElementById('resolveZavadaForm');
      if (form) {
        form.reset();
      }
    }
  }
  
  // Add event listeners for "Závada odstraněna" buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('mark-zavada-resolved-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const button = e.target;
      const zavadaData = {
        id: button.dataset.zavadaId,
        description: button.dataset.zavadaDescription || '',
        category: button.dataset.zavadaCategory || '',
        lat: button.dataset.zavadaLat || '',
        lng: button.dataset.zavadaLng || '',
        reportedDate: button.dataset.zavadaReportedDate || ''
      };
      
      openResolveZavadaModal(zavadaData);
    }
  });
  
  // Modal close handlers
  const resolveZavadaModal = document.getElementById('resolveZavadaModal');
  const resolveZavadaModalClose = resolveZavadaModal?.querySelector('.report-zavada-modal-close');
  const resolveZavadaModalCancel = resolveZavadaModal?.querySelector('.report-zavada-form-cancel');
  const resolveZavadaModalBackdrop = resolveZavadaModal?.querySelector('.report-zavada-modal-backdrop');
  
  if (resolveZavadaModalClose) {
    resolveZavadaModalClose.addEventListener('click', closeResolveZavadaModal);
  }
  
  if (resolveZavadaModalCancel) {
    resolveZavadaModalCancel.addEventListener('click', closeResolveZavadaModal);
  }
  
  if (resolveZavadaModalBackdrop) {
    resolveZavadaModalBackdrop.addEventListener('click', closeResolveZavadaModal);
  }
  
  // Handle form submission
  const resolveZavadaForm = document.getElementById('resolveZavadaForm');
  if (resolveZavadaForm) {
    resolveZavadaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = resolveZavadaForm.querySelector('.report-zavada-form-submit');
      const originalText = submitButton?.textContent;
      
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Odesílám...';
      }
      
      try {
        const formData = new FormData(resolveZavadaForm);
        
        let response;
        try {
          response = await fetch(resolveZavadaForm.action, {
            method: 'POST',
            body: formData
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
          
          closeResolveZavadaModal();
          showToastNotification(
            'Závada označena jako odstraněna!',
            'Děkujeme za nahlášení. Informace byla odeslána.',
            'success'
          );
        } else {
          // Try to get error message from response
          let errorMsg = `HTTP ${response.status}: ${response.statusText || 'Chyba'}`;
          
          // Only try to parse response if it's a real Response object
          if (!isSyntheticResponse) {
            try {
              const errorText = await response.text();
              try {
                const errorDetails = JSON.parse(errorText);
                if (errorDetails.error) {
                  if (typeof errorDetails.error === 'string') {
                    errorMsg = errorDetails.error;
                  } else if (errorDetails.error.message) {
                    errorMsg = errorDetails.error.message;
                  }
                }
              } catch (e) {
                // Not JSON, use text response if short
                if (errorText && errorText.length < 200) {
                  errorMsg = errorText;
                }
              }
            } catch (e) {
              console.error('Error reading response:', e);
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
        
        showToastNotification(
          'Chyba při odesílání',
          error.message && !error.message.includes('HTTP') 
            ? error.message 
            : 'Nepodařilo se odeslat formulář. Zkuste to prosím znovu.',
          'error'
        );
      }
    });
  }
});
