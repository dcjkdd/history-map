#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "用法: $0 <全新输出目录>" >&2
  exit 2
fi

output_dir=$1
if [[ -e "$output_dir" ]]; then
  echo "拒绝覆盖已有路径: $output_dir" >&2
  exit 2
fi

mkdir -p "$output_dir/dem" "$output_dir/metadata"

for latitude in 33 34 35; do
  for longitude in 108 109 110 111 112; do
    tile="Copernicus_DSM_COG_30_N${latitude}_00_E${longitude}_00_DEM"
    url="https://copernicus-dem-90m.s3.amazonaws.com/${tile}/${tile}.tif"
    curl --fail --location --retry 3 --show-error \
      --output "$output_dir/dem/${tile}.tif" "$url"
  done
done

curl --fail --location --retry 3 --show-error \
  --output "$output_dir/metadata/geoboundaries-current.json" \
  "https://www.geoboundaries.org/api/current/gbOpen/CHN/ADM1/"

boundary_url=$(
  /usr/bin/python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["simplifiedGeometryGeoJSON"])' \
    "$output_dir/metadata/geoboundaries-current.json"
)
curl --fail --location --retry 3 --show-error \
  --output "$output_dir/metadata/geoboundaries-chn-adm1-simplified.geojson" \
  "$boundary_url"

(
  cd "$output_dir"
  shasum -a 256 dem/*.tif metadata/*.json metadata/*.geojson > SHA256SUMS
)

echo "$output_dir"
