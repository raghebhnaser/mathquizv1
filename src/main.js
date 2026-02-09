import { race } from "racing-bars";
import * as d3 from "d3-dsv";

/**
 * 1. DESIGN & STYLING
 */
const style = document.createElement("style");
style.innerHTML = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #0b0b0b; color: #fff; font-family: 'Segoe UI', sans-serif; overflow: hidden; }

  #setup-ui { padding: 20px; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; min-height: 100vh; justify-content: center; }

  .header h1 {
    margin: 0; font-size: 28px; font-weight: 900; text-align: center;
    background: linear-gradient(to right, #007aff, #00ff88);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    text-transform: uppercase;
  }

  .input-group { display: flex; flex-direction: column; gap: 4px; position: relative; }
  .input-group label { font-size: 10px; font-weight: bold; color: #007aff; text-transform: uppercase; }
  input, select { padding: 12px; background: #1c1c1e; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 14px; }

  .mapping-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; background: #1c1c1e; border-radius: 12px; border: 1px solid #007aff44; }
  .mapping-grid .input-group { min-width: 0; }

  #race-container {
    display: none; width: 100vw; height: 100dvh;
    justify-content: center; align-items: center; position: relative; overflow: hidden;
  }

  /* THEME FIXES: Target the SVG and internal text directly */
  .theme-dark, .theme-dark svg { background: #0b0b0b !important; }
  .theme-dark text { fill: #ffffff !important; }

  .theme-light, .theme-light svg { background: #ffffff !important; }
  .theme-light text { fill: #000000 !important; }

  .theme-blue, .theme-blue svg { background: #000814 !important; }
  .theme-blue text { fill: #ffffff !important; }

  .theme-gold, .theme-gold svg { background: #1a1a1a !important; border-top: 5px solid #ffca3a; }
  .theme-gold text { fill: #ffca3a !important; }

  .bg-watermark {
    position: absolute; top: 13%; left: 50%; transform: translate(-50%, -50%);
    width: 80px; opacity: 0.15; z-index: 1; pointer-events: none;
  }

  #race .controls { display:none; }
  #race { width: 100%; height: 90%; max-width: 56.25vh; position: relative; z-index: 2; }

  #fullscreen-ctrl {
    position: absolute; top: 20px; right: 20px; z-index: 1000;
    padding: 10px 15px; background: rgba(255, 255, 255, 0.2);
    color: white; border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px;
  }

  .primary-btn { padding: 16px; background: linear-gradient(135deg, #007aff, #0051af); border: none; border-radius: 12px; color: #fff; font-weight: 800; cursor: pointer; width: 100%; text-transform: uppercase; }
  .secondary-btn { padding: 8px 12px; background: #2c2c2e; border: 1px solid #444; border-radius: 6px; color: #bbb; font-size: 11px; cursor: pointer; }

  .racing-bars-date { margin-bottom: 50px !important; font-weight: 900 !important; font-size: 45px !important; }

  .source-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .hint { font-size: 11px; color: #9a9a9a; }
  .hidden { display: none; }
`;
document.head.appendChild(style);

/**
 * 2. UI LAYOUT
 */
document.body.innerHTML = `
  <div id="setup-ui">
    <div class="header"><h1>RgRank Reel Studio</h1></div>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <div class="input-group">
        <label>Visual Theme</label>
        <select id="in-theme">
          <option value="theme-dark">Midnight Dark</option>
          <option value="theme-light">Clean White</option>
          <option value="theme-blue">Deep Ocean</option>
          <option value="theme-gold">Luxury Gold</option>
        </select>
      </div>
      <div class="input-group">
        <label>Icon Style</label>
        <select id="in-type">
          <option value="flag">Flags</option>
          <option value="player">Players</option>
          <option value="club">Clubs</option>
        </select>
      </div>
    </div>

    <div class="input-group">
      <label>Data Source</label>
      <select id="in-source">
        <option value="json">Custom JSON URL</option>
        <option value="world-bank">World Bank API</option>
        <option value="csv">Upload CSV</option>
      </select>
    </div>

    <div id="source-json" class="input-group">
      <label>API URL</label>
      <input type="text" id="in-json-url" placeholder="https://example.com/data.json" value="">
    </div>

    <div id="source-world-bank" class="source-options hidden">
      <div class="input-group">
        <label>Indicator Code</label>
        <input type="text" id="wb-indicator" value="SP.POP.TOTL">
        <span class="hint">Example: SP.POP.TOTL (population), NY.GDP.MKTP.CD (GDP)</span>
      </div>
      <div class="input-group">
        <label>Countries (comma separated)</label>
        <input type="text" id="wb-countries" value="US,CN,IN,BR,NG">
        <span class="hint">Use ISO2 or ISO3 codes (US, CN, IN, BRA, NGA)</span>
      </div>
      <div class="input-group">
        <label>Date Range</label>
        <input type="text" id="wb-dates" value="2000:2023">
      </div>
    </div>

    <div id="source-csv" class="input-group hidden">
      <label>Upload CSV</label>
      <input type="file" id="csvUpload" accept=".csv">
    </div>

    <div class="mapping-grid">
      <div class="input-group"><label>Date Key</label><input type="text" id="map-date" value="date"></div>
      <div class="input-group"><label>Name Key</label><input type="text" id="map-name" value="country.value"></div>
      <div class="input-group"><label>Value Key</label><input type="text" id="map-value" value="value"></div>
      <div class="input-group"><label>Code Key</label><input type="text" id="map-code" value="country.id"></div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <div class="input-group">
        <label>Video Title</label>
        <input type="text" id="in-title" value="RgRank Highlights">
      </div>
      <div class="input-group"><label>Speed (ms)</label><input type="number" id="in-speed" value="600"></div>
    </div>
    <button id="btn-run" class="primary-btn">Create Video</button>
  </div>
  <div id="race-container">
    <button id="fullscreen-ctrl">⛶ Fullscreen</button>
    <img src="https://i.ibb.co/p7dFGDP/RgRank-Logo.png" id="logo-bg" class="bg-watermark">
    <div id="race"></div>
  </div>
`;

/**
 * 3. LOGIC
 */
const toggleFullscreen = () => {
  const container = document.getElementById("race-container");
  if (!document.fullscreenElement) {
    if (container.requestFullscreen) container.requestFullscreen();
    else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
};
document.getElementById("fullscreen-ctrl").onclick = toggleFullscreen;

const getNested = (obj, path) =>
  path ? path.split(".").reduce((o, i) => (o ? o[i] : null), obj) : null;

const mapWorldBankFields = () => {
  document.getElementById("map-date").value = "date";
  document.getElementById("map-name").value = "country.value";
  document.getElementById("map-value").value = "value";
  document.getElementById("map-code").value = "country.id";
};

const buildWorldBankUrl = ({ indicator, countries, dates }) => {
  const normalizedCountries = countries
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean)
    .join(";") || "all";

  const query = new URLSearchParams({
    format: "json",
    per_page: "20000",
    date: dates || "2000:2023",
  });

  return `https://api.worldbank.org/v2/country/${normalizedCountries}/indicator/${indicator}?${query.toString()}`;
};

const fetchWorldBankData = async () => {
  const indicator = document.getElementById("wb-indicator").value.trim();
  const countries = document.getElementById("wb-countries").value.trim();
  const dates = document.getElementById("wb-dates").value.trim();

  if (!indicator) {
    throw new Error("Please provide a World Bank indicator code.");
  }

  const url = buildWorldBankUrl({ indicator, countries, dates });
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`World Bank request failed (${res.status}).`);
  }
  return res.json();
};

const fetchJsonData = async () => {
  const url = document.getElementById("in-json-url").value.trim();
  if (!url) {
    throw new Error("Please provide an API URL.");
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API request failed (${res.status}).`);
  }
  return res.json();
};

const fetchCsvData = async () => {
  const fileInput = document.getElementById("csvUpload");
  if (fileInput.files.length === 0) {
    throw new Error("Please upload a CSV file.");
  }
  const file = fileInput.files[0];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(d3.csvParse(e.target.result));
    reader.onerror = () => reject(new Error("Failed to read CSV."));
    reader.readAsText(file);
  });
};

const resolveDataSource = async () => {
  const source = document.getElementById("in-source").value;
  if (source === "world-bank") {
    mapWorldBankFields();
    return fetchWorldBankData();
  }
  if (source === "csv") {
    return fetchCsvData();
  }
  return fetchJsonData();
};

const normalizeData = (data) => {
  if (Array.isArray(data) && data[0]?.page !== undefined) {
    return data[1] || [];
  }
  if (data?.standings?.[0]?.table) {
    return data.standings[0].table;
  }
  if (data?.matches) {
    return data.matches;
  }
  return Array.isArray(data) ? data : [];
};

function startRace(rawData) {
  const selectedTheme = document.getElementById("in-theme").value;
  const typeMode = document.getElementById("in-type").value;
  const container = document.getElementById("race-container");
  const logo = document.getElementById("logo-bg");

  container.className = selectedTheme;
  logo.style.filter =
    selectedTheme === "theme-light"
      ? "grayscale(1) opacity(0.3)"
      : "brightness(0) invert(1)";

  const config = {
    title: document.getElementById("in-title").value,
    showIcons: true,
    showControls: false,
    topN: 12,
    tickDuration: parseInt(document.getElementById("in-speed").value, 10) || 600,
    margin: { top: 120, right: 200, bottom: 150, left: 100 },
    labelsPosition: "outside",
    iconPosition: "after",
    color: selectedTheme === "theme-light" ? "#000000" : "#ffffff",
    dataTransform: (data) => {
      const list = normalizeData(data);
      return list.filter(Boolean).map((item) => {
        const name =
          getNested(item, document.getElementById("map-name").value) ||
          "Unknown";
        const code = (
          getNested(item, document.getElementById("map-code").value) || ""
        )
          .toString()
          .toLowerCase()
          .trim();
        let icon = "";
        if (code) {
          if (typeMode === "player") {
            icon = `https://www.futbin.com/content/fifa24/img/players/${code}.png`;
          } else if (typeMode === "club") {
            icon = `https://tmssl.akamaized.net/images/wappen/head/${code}.png`;
          } else {
            icon = `https://flagcdn.com/w160/${code}.png`;
          }
        }
        return {
          date: getNested(item, document.getElementById("map-date").value) ||
            "2024",
          name,
          value:
            Number(getNested(item, document.getElementById("map-value").value)) ||
            0,
          icon,
        };
      });
    },
    iconStyle: {
      width: "48px",
      height: "48px",
      borderRadius: typeMode === "player" ? "50%" : "6px",
    },
  };

  document.getElementById("setup-ui").style.display = "none";
  container.style.display = "flex";
  race(rawData, "#race", config);
}

const syncSourceVisibility = () => {
  const source = document.getElementById("in-source").value;
  document.getElementById("source-json").classList.toggle(
    "hidden",
    source !== "json"
  );
  document.getElementById("source-world-bank").classList.toggle(
    "hidden",
    source !== "world-bank"
  );
  document.getElementById("source-csv").classList.toggle(
    "hidden",
    source !== "csv"
  );
};

syncSourceVisibility();
document.getElementById("in-source").addEventListener("change", syncSourceVisibility);

document.getElementById("btn-run").onclick = async () => {
  try {
    const data = await resolveDataSource();
    startRace(data);
  } catch (error) {
    alert(error.message || "Data Error");
  }
};
