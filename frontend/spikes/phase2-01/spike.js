import * as maplibregl from "./vendor/maplibre-gl.mjs";

const TRIAL_BOUNDS = [
  [108.45, 33.65],
  [112.8, 35.45],
];

const runtime = {
  startedAt: performance.now(),
  readyAt: null,
  mode: "topdown",
  errors: [],
  styleLoads: 0,
};

window.__PHASE2_SPIKE__ = runtime;
window.addEventListener("error", (event) => runtime.errors.push(String(event.error || event.message)));
window.addEventListener("unhandledrejection", (event) => runtime.errors.push(String(event.reason)));

const attribution = [
  "produced using Copernicus WorldDEM-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved",
  "Made with Natural Earth",
  "Administrative boundaries: geoBoundaries",
].join(" · ");

const style = {
  version: 8,
  sources: {
    "color-relief": {
      type: "image",
      url: "./assets/color-relief.png",
      coordinates: [
        [108, 36],
        [113, 36],
        [113, 33],
        [108, 33],
      ],
    },
    "dem-hillshade": {
      type: "raster-dem",
      tiles: ["./assets/terrain/{z}/{x}/{y}.png"],
      encoding: "terrarium",
      tileSize: 256,
      minzoom: 5,
      maxzoom: 9,
      bounds: [108, 33, 113, 36],
      attribution,
    },
    "dem-terrain": {
      type: "raster-dem",
      tiles: ["./assets/terrain/{z}/{x}/{y}.png"],
      encoding: "terrarium",
      tileSize: 256,
      minzoom: 5,
      maxzoom: 9,
      bounds: [108, 33, 113, 36],
    },
    trial: {
      type: "geojson",
      data: "./assets/trial-overlay.geojson",
      attribution: "现有历史语义：history-map 正式数据（地点 DISPUTED；路线 INFERENCE / LOW）",
    },
    provinces: {
      type: "geojson",
      data: "./assets/provinces.geojson",
      attribution: "geoBoundaries CHN ADM1, current fixed commit 9469f09",
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#e7e2d2" } },
    { id: "color-relief", type: "raster", source: "color-relief", paint: { "raster-opacity": 1 } },
    {
      id: "dem-hillshade",
      type: "hillshade",
      source: "dem-hillshade",
      paint: {
        "hillshade-exaggeration": 0.42,
        "hillshade-shadow-color": "#2b2a24",
        "hillshade-highlight-color": "#fff8df",
        "hillshade-accent-color": "#6a5a43",
        "hillshade-illumination-anchor": "map",
        "hillshade-illumination-direction": 315,
      },
    },
    {
      id: "province-fill",
      type: "fill",
      source: "provinces",
      filter: ["==", ["get", "featureKind"], "boundary"],
      paint: { "fill-color": ["match", ["get", "labelZh"], "陕西", "#d29f42", "河南", "#68a3a4", "#bcb8a4"], "fill-opacity": 0.07 },
    },
    {
      id: "province-outline",
      type: "line",
      source: "provinces",
      filter: ["==", ["get", "featureKind"], "boundary"],
      paint: { "line-color": "#463f34", "line-width": 1.4, "line-opacity": 0.78, "line-dasharray": [5, 3] },
    },
    {
      id: "qinling-fill",
      type: "fill",
      source: "trial",
      filter: ["all", ["==", ["get", "featureKind"], "geography"], ["==", ["get", "geographyType"], "MOUNTAIN"]],
      paint: { "fill-color": "#5a6048", "fill-opacity": 0.13, "fill-outline-color": "#4f5740" },
    },
    {
      id: "rivers-casing",
      type: "line",
      source: "trial",
      filter: ["all", ["==", ["get", "featureKind"], "geography"], ["==", ["get", "geographyType"], "RIVER"]],
      paint: { "line-color": "#f2f5e9", "line-width": 5.2, "line-opacity": 0.82 },
    },
    {
      id: "rivers",
      type: "line",
      source: "trial",
      filter: ["all", ["==", ["get", "featureKind"], "geography"], ["==", ["get", "geographyType"], "RIVER"]],
      paint: { "line-color": "#236f9b", "line-width": 2.7, "line-opacity": 0.96 },
    },
    {
      id: "routes-casing",
      type: "line",
      source: "trial",
      filter: ["==", ["get", "featureKind"], "route"],
      paint: { "line-color": "#fff8e6", "line-width": 7, "line-opacity": 0.88 },
    },
    {
      id: "routes",
      type: "line",
      source: "trial",
      filter: ["==", ["get", "featureKind"], "route"],
      paint: {
        "line-color": ["match", ["get", "side"], "YAN", "#a12622", "#285b93"],
        "line-width": 3.5,
        "line-opacity": 0.96,
        "line-dasharray": [2, 1.2],
      },
    },
    {
      id: "route-directions",
      type: "symbol",
      source: "trial",
      filter: ["==", ["get", "featureKind"], "route"],
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 420,
        "text-field": ["get", "directionLabel"],
        "text-size": 13,
        "text-allow-overlap": false,
        "text-rotation-alignment": "viewport",
        "text-keep-upright": true,
      },
      paint: { "text-color": ["match", ["get", "side"], "YAN", "#7f1716", "#174a80"], "text-halo-color": "#fff7e8", "text-halo-width": 1.5 },
    },
    {
      id: "place-symbols",
      type: "circle",
      source: "trial",
      filter: ["==", ["get", "featureKind"], "place"],
      paint: {
        "circle-radius": ["match", ["get", "placeType"], "PASS", 10, "BATTLEFIELD", 7, 6],
        "circle-color": ["match", ["get", "placeType"], "PASS", "#f5b83b", "BATTLEFIELD", "#9e2c2c", "#252e2a"],
        "circle-stroke-color": "#fff7e5",
        "circle-stroke-width": ["match", ["get", "placeType"], "PASS", 3, 2],
      },
    },
    {
      id: "place-labels",
      type: "symbol",
      source: "trial",
      filter: ["==", ["get", "featureKind"], "place"],
      layout: {
        "text-field": ["case", ["==", ["get", "placeType"], "PASS"], ["concat", ["get", "name"], " 关隘代表点"], ["get", "name"]],
        "text-size": ["case", ["==", ["get", "placeType"], "PASS"], 15, 14],
        "text-offset": [0, 1.3],
        "text-anchor": "top",
        "text-allow-overlap": false,
        "text-optional": false,
      },
      paint: { "text-color": "#17231d", "text-halo-color": "#fff8e7", "text-halo-width": 2.2 },
    },
    {
      id: "river-labels",
      type: "symbol",
      source: "trial",
      filter: ["all", ["==", ["get", "featureKind"], "geography"], ["==", ["get", "geographyType"], "RIVER"]],
      layout: {
        "symbol-placement": "line",
        "symbol-spacing": 420,
        "text-field": ["get", "name"],
        "text-size": 14,
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#155b83",
        "text-halo-color": "#fff8e5",
        "text-halo-width": 2,
      },
    },
    {
      id: "mountain-labels",
      type: "symbol",
      source: "trial",
      filter: ["==", ["get", "featureKind"], "mountainLabel"],
      layout: { "text-field": ["get", "name"], "text-size": 17, "text-letter-spacing": 0.14, "text-allow-overlap": false },
      paint: { "text-color": "#3f4734", "text-halo-color": "#fff8e5", "text-halo-width": 2 },
    },
    {
      id: "province-labels",
      type: "symbol",
      source: "provinces",
      filter: ["==", ["get", "featureKind"], "label"],
      layout: {
        "text-field": ["get", "labelZh"],
        "text-size": 18,
        "text-letter-spacing": 0.18,
        "text-allow-overlap": true,
      },
      paint: { "text-color": "#5f4c2e", "text-halo-color": "#fff7df", "text-halo-width": 2.5 },
    },
  ],
};

const map = new maplibregl.Map({
  container: "map",
  style,
  center: [110.55, 34.55],
  zoom: 6.7,
  minZoom: 5.7,
  maxZoom: 9,
  pitch: 0,
  bearing: 0,
  localIdeographFontFamily: "PingFang SC, sans-serif",
  attributionControl: false,
  fadeDuration: 0,
  canvasContextAttributes: { antialias: true },
});

runtime.map = map;
map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), "top-right");
map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");
map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

const modeTopdown = document.querySelector("#mode-topdown");
const modeTerrain = document.querySelector("#mode-terrain");
const modeTitle = document.querySelector("#mode-title");
const modeNote = document.querySelector("#mode-note");
const runtimeStatus = document.querySelector("#runtime-status");

function setButtons(mode) {
  const topdown = mode === "topdown";
  modeTopdown.classList.toggle("is-active", topdown);
  modeTerrain.classList.toggle("is-active", !topdown);
  modeTopdown.setAttribute("aria-pressed", String(topdown));
  modeTerrain.setAttribute("aria-pressed", String(!topdown));
}

function applyMode(mode, instant = false) {
  runtime.mode = mode;
  setButtons(mode);
  if (mode === "terrain") {
    map.setTerrain({ source: "dem-terrain", exaggeration: 1.25 });
    modeTitle.textContent = "方案 B · 倾斜 3D terrain";
    modeNote.textContent = "观察起伏更强，但必须检查标签遮挡、范围变形与操作成本。";
    map.easeTo({ center: [110.55, 34.46], zoom: 7.15, pitch: 45, bearing: -8, duration: instant ? 0 : 700 });
  } else {
    map.setTerrain(null);
    modeTitle.textContent = "方案 A · 俯视 hillshade + 分层设色";
    modeNote.textContent = "先看低地与山地，再看黄河、渭河、秦岭和潼关。";
    map.jumpTo({ pitch: 0, bearing: 0 });
    map.fitBounds(TRIAL_BOUNDS, { padding: { top: 62, right: 44, bottom: 50, left: 44 }, duration: instant ? 0 : 700 });
  }
}

modeTopdown.addEventListener("click", () => applyMode("topdown"));
modeTerrain.addEventListener("click", () => applyMode("terrain"));

map.on("style.load", () => {
  runtime.styleLoads += 1;
});

map.on("error", (event) => {
  const message = String(event.error?.message || event.error || "unknown map error");
  runtime.errors.push(message);
  runtimeStatus.textContent = `资源错误：${message}`;
});

map.once("idle", () => {
  runtime.readyAt = performance.now();
  runtime.firstIdleMs = Math.round(runtime.readyAt - runtime.startedAt);
  runtime.canvasCount = document.querySelectorAll(".maplibregl-canvas").length;
  runtime.mapContainerCount = document.querySelectorAll(".maplibregl-map").length;
  runtime.resources = performance.getEntriesByType("resource").map((entry) => ({
    name: entry.name,
    transferSize: entry.transferSize,
    decodedBodySize: entry.decodedBodySize,
    duration: Math.round(entry.duration),
  }));
  runtimeStatus.textContent = `本地资产就绪 · ${runtime.firstIdleMs} ms · ${runtime.resources.length} 个资源 · ${runtime.canvasCount} 个 Canvas`;
  applyMode("topdown", true);
});
