#!/usr/bin/env python3
"""Build the isolated PHASE2-01 static terrain trial from audited inputs."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE_BOUNDS = (108.0, 33.0, 113.0, 36.0)
DISPLAY_BOUNDS = (108.45, 33.65, 112.8, 35.45)
ZOOMS = range(5, 10)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--formal-json", type=Path, required=True)
    parser.add_argument("--spike-dir", type=Path, required=True)
    parser.add_argument("--maplibre-dist", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def refuse_existing(path: Path) -> None:
    if path.exists():
        raise SystemExit(f"refusing to overwrite existing path: {path}")
    path.mkdir(parents=True)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_mosaic(dem_dir: Path) -> tuple[np.ndarray, list[dict[str, object]]]:
    rows: list[np.ndarray] = []
    inputs: list[dict[str, object]] = []
    for latitude in (35, 34, 33):
        columns: list[np.ndarray] = []
        for longitude in range(108, 113):
            tile = f"Copernicus_DSM_COG_30_N{latitude}_00_E{longitude}_00_DEM.tif"
            path = dem_dir / tile
            if not path.is_file():
                raise SystemExit(f"missing DEM tile: {path}")
            with Image.open(path) as image:
                values = np.asarray(image, dtype=np.float32)
            if values.shape != (1200, 1200):
                raise SystemExit(f"unexpected GLO-90 tile shape {values.shape}: {path}")
            columns.append(values)
            inputs.append({"file": tile, "bytes": path.stat().st_size, "sha256": sha256(path)})
        rows.append(np.concatenate(columns, axis=1))
    mosaic = np.concatenate(rows, axis=0)
    invalid = (~np.isfinite(mosaic)) | (mosaic <= -10000)
    if invalid.any():
        valid_median = float(np.nanmedian(np.where(invalid, np.nan, mosaic)))
        mosaic[invalid] = valid_median
    return mosaic, inputs


def hypsometric_rgb(height: np.ndarray) -> np.ndarray:
    stops = np.array([-100, 0, 180, 350, 600, 900, 1300, 1800, 2600, 4000], dtype=np.float32)
    colors = np.array(
        [
            [191, 207, 171], [201, 214, 180], [218, 216, 164], [215, 198, 139],
            [190, 163, 115], [164, 132, 94], [137, 108, 82], [111, 88, 72],
            [88, 73, 64], [74, 66, 62],
        ],
        dtype=np.float32,
    )
    channels = [np.interp(height, stops, colors[:, channel]) for channel in range(3)]
    return np.stack(channels, axis=-1).clip(0, 255).astype(np.uint8)


def lon_to_tile_x(longitude: float, zoom: int) -> float:
    return (longitude + 180.0) / 360.0 * (2**zoom)


def lat_to_tile_y(latitude: float, zoom: int) -> float:
    radians = math.radians(latitude)
    return (1.0 - math.asinh(math.tan(radians)) / math.pi) / 2.0 * (2**zoom)


def sample_mosaic(mosaic: np.ndarray, lon: np.ndarray, lat: np.ndarray) -> np.ndarray:
    west, south, east, north = SOURCE_BOUNDS
    x = (lon - west) / (east - west) * (mosaic.shape[1] - 1)
    y = (north - lat) / (north - south) * (mosaic.shape[0] - 1)
    outside = (x < 0) | (x > mosaic.shape[1] - 1) | (y < 0) | (y > mosaic.shape[0] - 1)
    x = np.clip(x, 0, mosaic.shape[1] - 1)
    y = np.clip(y, 0, mosaic.shape[0] - 1)
    x0 = np.floor(x).astype(np.int32)
    y0 = np.floor(y).astype(np.int32)
    x1 = np.minimum(x0 + 1, mosaic.shape[1] - 1)
    y1 = np.minimum(y0 + 1, mosaic.shape[0] - 1)
    dx = x - x0
    dy = y - y0
    sampled = (
        mosaic[y0, x0] * (1 - dx) * (1 - dy)
        + mosaic[y0, x1] * dx * (1 - dy)
        + mosaic[y1, x0] * (1 - dx) * dy
        + mosaic[y1, x1] * dx * dy
    )
    return np.where(outside, 0.0, sampled)


def terrarium_rgb(height: np.ndarray) -> np.ndarray:
    encoded = np.clip(height + 32768.0, 0, 65535.996)
    red = np.floor(encoded / 256.0)
    green = np.floor(encoded - red * 256.0)
    blue = np.floor((encoded - np.floor(encoded)) * 256.0)
    return np.stack([red, green, blue], axis=-1).astype(np.uint8)


def build_terrain_tiles(mosaic: np.ndarray, target: Path) -> list[dict[str, int]]:
    counts: list[dict[str, int]] = []
    west, south, east, north = SOURCE_BOUNDS
    for zoom in ZOOMS:
        x_min = math.floor(lon_to_tile_x(west, zoom))
        x_max = math.floor(lon_to_tile_x(np.nextafter(east, west), zoom))
        y_min = math.floor(lat_to_tile_y(north, zoom))
        y_max = math.floor(lat_to_tile_y(south, zoom))
        count = 0
        for x_tile in range(x_min, x_max + 1):
            for y_tile in range(y_min, y_max + 1):
                pixels = np.arange(256, dtype=np.float64) + 0.5
                global_x = x_tile * 256 + pixels
                global_y = y_tile * 256 + pixels
                scale = 256 * (2**zoom)
                longitude = global_x / scale * 360.0 - 180.0
                mercator = math.pi * (1.0 - 2.0 * global_y / scale)
                latitude = np.degrees(np.arctan(np.sinh(mercator)))
                lon_grid, lat_grid = np.meshgrid(longitude, latitude)
                height = sample_mosaic(mosaic, lon_grid, lat_grid)
                tile_path = target / str(zoom) / str(x_tile) / f"{y_tile}.png"
                tile_path.parent.mkdir(parents=True, exist_ok=True)
                Image.fromarray(terrarium_rgb(height), mode="RGB").save(tile_path, compress_level=6)
                count += 1
        counts.append({"zoom": zoom, "tiles": count})
    return counts


def feature_copy(feature: dict, feature_kind: str) -> dict:
    properties = feature["properties"]
    copied = {
        "type": "Feature",
        "geometry": feature["geometry"],
        "properties": {
            "featureKind": feature_kind,
            "id": properties["id"],
            "name": properties.get("name") or properties.get("routeName"),
            "certainty": properties.get("certainty"),
        },
    }
    if feature_kind == "place":
        copied["properties"]["placeType"] = properties["placeType"]
    elif feature_kind == "geography":
        copied["properties"]["geographyType"] = properties["geographyType"]
    else:
        copied["properties"].update(
            {
                "side": properties["side"],
                "viewpointType": properties["summary"]["viewpointType"],
                "directionLabel": "燕军向西" if properties["side"] == "YAN" else "唐军向东",
            }
        )
    return copied


def build_trial_overlay(formal_json: Path, target: Path) -> dict[str, int]:
    data = json.loads(formal_json.read_text(encoding="utf-8"))
    features = []
    for feature in data["geography"]["features"]:
        features.append(feature_copy(feature, "geography"))
        if feature["properties"]["geographyType"] == "MOUNTAIN":
            features.append(
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [110.45, 33.86]},
                    "properties": {
                        "featureKind": "mountainLabel",
                        "name": feature["properties"]["name"],
                        "labelBasis": "display-only anchor derived from the approved generalized polygon",
                    },
                }
            )
    for feature in data["routeSegments"]["features"]:
        features.append(feature_copy(feature, "route"))
    for feature in data["places"]["features"]:
        features.append(feature_copy(feature, "place"))
    target.write_text(json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False), encoding="utf-8")
    return {
        "places": len(data["places"]["features"]),
        "geographies": len(data["geography"]["features"]),
        "routes": len(data["routeSegments"]["features"]),
        "displayOnlyMountainLabels": 1,
    }


def build_provinces(source: Path, target: Path) -> dict[str, object]:
    data = json.loads(source.read_text(encoding="utf-8"))
    wanted: list[dict] = []
    names = {
        "Henan": "河南",
        "Henan Province": "河南",
        "Henan Sheng": "河南",
        "Shaanxi": "陕西",
        "Shaanxi Province": "陕西",
        "Shaanxi Sheng": "陕西",
    }
    for feature in data["features"]:
        shape_name = feature.get("properties", {}).get("shapeName")
        if shape_name in names:
            wanted.append(
                {
                    "type": "Feature",
                    "geometry": feature["geometry"],
                    "properties": {"featureKind": "boundary", "labelZh": names[shape_name], "sourceName": shape_name},
                }
            )
    if len(wanted) != 2:
        available = sorted(str(feature.get("properties", {}).get("shapeName")) for feature in data["features"])
        raise SystemExit(f"expected Henan and Shaanxi boundaries, found {len(wanted)}; available={available}")
    wanted.extend(
        [
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [109.2, 35.18]}, "properties": {"featureKind": "label", "labelZh": "陕西"}},
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [112.18, 35.18]}, "properties": {"featureKind": "label", "labelZh": "河南"}},
        ]
    )
    target.write_text(json.dumps({"type": "FeatureCollection", "features": wanted}, ensure_ascii=False), encoding="utf-8")
    return {"boundaryFeatures": 2, "labelFeatures": 2}


def copy_site_sources(spike_dir: Path, maplibre_dist: Path, target: Path) -> None:
    for name in ("index.html", "spike.css", "spike.js"):
        shutil.copy2(spike_dir / name, target / name)
    vendor = target / "vendor"
    vendor.mkdir()
    for name in ("maplibre-gl.css", "maplibre-gl.mjs", "maplibre-gl-shared.mjs", "maplibre-gl-worker.mjs"):
        shutil.copy2(maplibre_dist / name, vendor / name)


def main() -> None:
    args = parse_args()
    refuse_existing(args.output_dir)
    root_site = args.output_dir / "root"
    root_site.mkdir()
    copy_site_sources(args.spike_dir, args.maplibre_dist, root_site)
    assets = root_site / "assets"
    assets.mkdir()

    mosaic, dem_inputs = load_mosaic(args.source_dir / "dem")
    relief = Image.fromarray(hypsometric_rgb(mosaic), mode="RGB").resize((1800, 1080), Image.Resampling.LANCZOS)
    relief.save(assets / "color-relief.png", optimize=True)
    tile_counts = build_terrain_tiles(mosaic, assets / "terrain")
    formal_counts = build_trial_overlay(args.formal_json, assets / "trial-overlay.geojson")
    province_counts = build_provinces(
        args.source_dir / "metadata" / "geoboundaries-chn-adm1-simplified.geojson",
        assets / "provinces.geojson",
    )

    subpath_site = args.output_dir / "history-map"
    shutil.copytree(root_site, subpath_site)
    files = [path for path in root_site.rglob("*") if path.is_file()]
    manifest = {
        "sourceBounds": SOURCE_BOUNDS,
        "displayBounds": DISPLAY_BOUNDS,
        "dem": {
            "source": "Copernicus DEM GLO-90 AWS 2021 COG",
            "inputs": dem_inputs,
            "heightMinM": round(float(mosaic.min()), 2),
            "heightMaxM": round(float(mosaic.max()), 2),
        },
        "terrainTiles": tile_counts,
        "formalOverlay": formal_counts,
        "provinces": province_counts,
        "rootFiles": len(files),
        "rootBytes": sum(path.stat().st_size for path in files),
        "assets": [
            {"path": str(path.relative_to(root_site)), "bytes": path.stat().st_size, "sha256": sha256(path)}
            for path in sorted(files)
        ],
    }
    manifest_text = json.dumps(manifest, ensure_ascii=False, indent=2)
    (args.output_dir / "manifest.json").write_text(manifest_text, encoding="utf-8")
    print(manifest_text)


if __name__ == "__main__":
    main()
