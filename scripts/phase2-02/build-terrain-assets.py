#!/usr/bin/env python3
"""Build the PHASE2-02 offline terrain asset set from audited inputs.

The 15 source COGs are intentionally not copied into the repository. This
script verifies every input before producing the bounded, static derivative.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE_BOUNDS = (108.0, 33.0, 113.0, 36.0)
DISPLAY_BOUNDS = (108.45, 33.65, 112.8, 35.45)
ZOOMS = range(5, 10)
ASSET_BUDGET_BYTES = 10 * 1024 * 1024

DEM_SHA256 = {
    "Copernicus_DSM_COG_30_N33_00_E108_00_DEM.tif": "da9dc510b0942784697566cea3c3963e5007a26fba59050d37626768a957a88d",
    "Copernicus_DSM_COG_30_N33_00_E109_00_DEM.tif": "2f32ba28bbd5b43759687e3c199b5c8c00113a174b881b6274efea2d8e005358",
    "Copernicus_DSM_COG_30_N33_00_E110_00_DEM.tif": "2e1140f015dd475b6a259f0f50ea33ef4a07df8c242d759a352d59d7ddc22de4",
    "Copernicus_DSM_COG_30_N33_00_E111_00_DEM.tif": "a0723e06bc72a5e7d5e29ba670266b0c14868b4cfb67703efc651751a740ae77",
    "Copernicus_DSM_COG_30_N33_00_E112_00_DEM.tif": "c24ef1f6024b91197440c006cf33d296adf64bf4709f49764842823bd5409684",
    "Copernicus_DSM_COG_30_N34_00_E108_00_DEM.tif": "b93bc07e4ed351dae8764a020c6de3586c1e85df6fdaf75bb98bc5080a332938",
    "Copernicus_DSM_COG_30_N34_00_E109_00_DEM.tif": "81862980d1c806a514d383f04b5091cb1077abb6b70ddef1258e02b923092da6",
    "Copernicus_DSM_COG_30_N34_00_E110_00_DEM.tif": "874bb8ee2be07bbc4f0f21c823351ee05f7de0a349e81cdb3df70ca236d4d7b2",
    "Copernicus_DSM_COG_30_N34_00_E111_00_DEM.tif": "0dfdb693d6f0992311b754c806e33b21875015f65129787b7394f5aa9555d55d",
    "Copernicus_DSM_COG_30_N34_00_E112_00_DEM.tif": "da49c916a4530c472d971801e0bf60b3a6c5c516d0e38f7508e65440d67352bd",
    "Copernicus_DSM_COG_30_N35_00_E108_00_DEM.tif": "6ce5cfa8c849cbf82070ca36bc46756d88d6402715ba87761dec88ae60fe7ff2",
    "Copernicus_DSM_COG_30_N35_00_E109_00_DEM.tif": "c0bd58628b730b5ffbddc5d1b19ef5ac643ca163cb875aa98f72589f9ff296d2",
    "Copernicus_DSM_COG_30_N35_00_E110_00_DEM.tif": "f71d2e6bead1c1b7341a8ca9528db794c06affbcb7c40638a120269888ab406f",
    "Copernicus_DSM_COG_30_N35_00_E111_00_DEM.tif": "ab2f7ba20634fd54fda5afbcedf0fa2bc3df7260550c017b04026ac983fb448f",
    "Copernicus_DSM_COG_30_N35_00_E112_00_DEM.tif": "0a3193500e9888366b90104fe920ca4f580f8606cd3ffb866118bc82a28e5132",
}
PROVINCE_SHA256 = "bc4afc7eacf4351ae5b3ae7a612327987ce1123cb5deb8574fb49107091c6623"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_hash(path: Path, expected: str) -> None:
    actual = sha256(path)
    if actual != expected:
        raise SystemExit(f"SHA-256 mismatch for {path}: expected {expected}, got {actual}")


def refuse_existing(path: Path) -> None:
    if path.exists():
        raise SystemExit(f"refusing to overwrite existing path: {path}")
    path.mkdir(parents=True)


def load_mosaic(dem_dir: Path) -> tuple[np.ndarray, list[dict[str, object]]]:
    rows: list[np.ndarray] = []
    inputs: list[dict[str, object]] = []
    for latitude in (35, 34, 33):
        columns: list[np.ndarray] = []
        for longitude in range(108, 113):
            name = f"Copernicus_DSM_COG_30_N{latitude}_00_E{longitude}_00_DEM.tif"
            path = dem_dir / name
            if not path.is_file():
                raise SystemExit(f"missing DEM input: {path}")
            verify_hash(path, DEM_SHA256[name])
            with Image.open(path) as image:
                values = np.asarray(image, dtype=np.float32)
            if values.shape != (1200, 1200):
                raise SystemExit(f"unexpected GLO-90 tile shape {values.shape}: {path}")
            columns.append(values)
            inputs.append({"file": name, "bytes": path.stat().st_size, "sha256": DEM_SHA256[name]})
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


def sample_mosaic(mosaic: np.ndarray, longitude: np.ndarray, latitude: np.ndarray) -> np.ndarray:
    west, south, east, north = SOURCE_BOUNDS
    x = (longitude - west) / (east - west) * (mosaic.shape[1] - 1)
    y = (north - latitude) / (north - south) * (mosaic.shape[0] - 1)
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


def build_provinces(source: Path, target: Path) -> dict[str, int]:
    verify_hash(source, PROVINCE_SHA256)
    data = json.loads(source.read_text(encoding="utf-8"))
    names = {
        "Henan": "河南",
        "Henan Province": "河南",
        "Shaanxi": "陕西",
        "Shaanxi Province": "陕西",
    }
    features: list[dict[str, object]] = []
    for feature in data["features"]:
        source_name = feature.get("properties", {}).get("shapeName")
        if source_name in names:
            features.append(
                {
                    "type": "Feature",
                    "geometry": feature["geometry"],
                    "properties": {
                        "featureKind": "modernProvinceBoundary",
                        "labelZh": names[source_name],
                        "sourceName": source_name,
                        "temporalScope": "modern reference only; not a Tang dynasty boundary",
                    },
                }
            )
    if len(features) != 2:
        raise SystemExit(f"expected Henan and Shaanxi boundaries, found {len(features)}")
    features.extend(
        [
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [109.2, 35.18]}, "properties": {"featureKind": "modernProvinceLabel", "labelZh": "陕西", "temporalScope": "modern reference only"}},
            {"type": "Feature", "geometry": {"type": "Point", "coordinates": [112.18, 35.18]}, "properties": {"featureKind": "modernProvinceLabel", "labelZh": "河南", "temporalScope": "modern reference only"}},
        ]
    )
    target.write_text(json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return {"boundaryFeatures": 2, "labelFeatures": 2}


def main() -> None:
    args = parse_args()
    refuse_existing(args.output_dir)
    mosaic, dem_inputs = load_mosaic(args.source_dir / "dem")

    relief = Image.fromarray(hypsometric_rgb(mosaic), mode="RGB").resize((1800, 1080), Image.Resampling.LANCZOS)
    relief.save(args.output_dir / "color-relief.png", optimize=True)
    tile_counts = build_terrain_tiles(mosaic, args.output_dir / "terrain")
    province_input = args.source_dir / "metadata" / "geoboundaries-chn-adm1-simplified.geojson"
    province_counts = build_provinces(province_input, args.output_dir / "provinces.geojson")

    asset_paths = sorted(path for path in args.output_dir.rglob("*") if path.is_file())
    assets = [
        {"path": str(path.relative_to(args.output_dir)), "bytes": path.stat().st_size, "sha256": sha256(path)}
        for path in asset_paths
    ]
    total_bytes = sum(asset["bytes"] for asset in assets)
    if total_bytes > ASSET_BUDGET_BYTES:
        raise SystemExit(f"asset set exceeds {ASSET_BUDGET_BYTES} bytes: {total_bytes}")

    manifest = {
        "schemaVersion": "1.0",
        "assetSetId": "phase2-02-glo90-topdown",
        "generatedOn": "2026-08-04",
        "runtimeNetworkRequired": False,
        "sourceBounds": SOURCE_BOUNDS,
        "displayBounds": DISPLAY_BOUNDS,
        "dem": {
            "source": "Copernicus DEM GLO-90 AWS 2021 COG",
            "sourceUrl": "https://copernicus-dem-90m.s3.eu-central-1.amazonaws.com/",
            "sourceInputsCommitted": False,
            "inputs": dem_inputs,
            "heightMinM": round(float(mosaic.min()), 2),
            "heightMaxM": round(float(mosaic.max()), 2),
            "encoding": "Mapbox Terrarium PNG",
        },
        "provinces": {
            "source": "geoBoundaries gbOpen CHN ADM1",
            "boundaryId": "CHN-ADM1-43563684",
            "geometryCommit": "9469f09",
            "sourceUrl": "https://www.geoboundaries.org/api/current/gbOpen/CHN/ADM1/",
            "inputSha256": PROVINCE_SHA256,
            **province_counts,
        },
        "licenses": {
            "copernicus": {
                "access": "GLO-90 Full, Free and Open",
                "licenseUrl": "https://dataspace.copernicus.eu/sites/default/files/media/files/2025-06/copernicus_contributing_mission_data_access_v2_cop_dem_licenses.pdf",
                "requiredAttribution": "produced using Copernicus WorldDEM-90 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved",
                "requiredDisclaimer": "The organisations in charge of the Copernicus programme by law or by delegation do not incur any liability for any use of the Copernicus WorldDEM™-90.",
            },
            "geoBoundaries": {
                "distributionLicense": "CC BY 4.0",
                "upstreamBoundaryMetadataLicense": "Public Domain",
                "licenseUrl": "https://www.geoboundaries.org/api.html",
                "requiredAttribution": "geoBoundaries",
            },
        },
        "processing": [
            "verify 15 fixed GLO-90 COG SHA-256 values",
            "mosaic and crop to the audited regional bounds",
            "render an 1800x1080 hypsometric image",
            "encode zoom 5-9 Terrarium tiles for client-side hillshade",
            "extract only modern Henan and Shaanxi ADM1 boundaries and add display labels",
        ],
        "terrainTiles": tile_counts,
        "assetBudgetBytes": ASSET_BUDGET_BYTES,
        "totalBytes": total_bytes,
        "assets": assets,
    }
    manifest_path = args.output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output_dir), "assets": len(assets), "bytes": total_bytes, "manifestSha256": sha256(manifest_path)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
