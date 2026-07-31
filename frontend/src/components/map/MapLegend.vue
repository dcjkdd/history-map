<template>
  <aside class="map-legend" aria-labelledby="map-legend-title">
    <h3 id="map-legend-title">图例</h3>

    <div class="map-legend__section">
      <p>地点类型</p>
      <ul>
        <li><span class="legend-symbol legend-symbol--city"></span>城池</li>
        <li><span class="legend-symbol legend-symbol--pass"></span>关隘</li>
        <li><span class="legend-symbol legend-symbol--other"></span>其他地点</li>
      </ul>
    </div>

    <div class="map-legend__section">
      <p>现代地理背景</p>
      <ul>
        <li><span class="legend-line legend-line--river"></span>河流</li>
        <li><span class="legend-area legend-area--mountain"></span>山地 / 通道</li>
      </ul>
    </div>

    <p class="map-legend__uncertainty">
      <span class="legend-symbol legend-symbol--uncertain"></span>
      外圈表示 LOW、DISPUTED 或 UNKNOWN：代表点或重建存在不确定性，不应理解为精确历史坐标。
    </p>
  </aside>
</template>
