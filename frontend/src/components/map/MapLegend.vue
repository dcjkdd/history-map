<template>
  <details class="map-legend">
    <summary>图例与不确定性</summary>
    <div class="map-legend__content">

    <div class="map-legend__section">
      <p>地点类型</p>
      <ul>
        <li><span class="legend-symbol legend-symbol--city"></span>城池</li>
        <li><span class="legend-symbol legend-symbol--pass"></span>关隘</li>
        <li><span class="legend-symbol legend-symbol--other"></span>其他地点</li>
      </ul>
    </div>

    <div class="map-legend__section">
      <p>地形与现代定位</p>
      <ul>
        <li><span class="legend-terrain"></span>高程分层 + hillshade</li>
        <li><span class="legend-line legend-line--river"></span>河流</li>
        <li><span class="legend-area legend-area--mountain"></span>山地 / 通道</li>
        <li><span class="legend-line legend-line--province"></span>今省界</li>
      </ul>
    </div>

    <div class="map-legend__section">
      <p>行动路线（虚线与粗细区分主体）</p>
      <ul>
        <li><span class="legend-route legend-route--tang"></span>唐军</li>
        <li><span class="legend-route legend-route--yan"></span>燕军</li>
        <li><span class="legend-route legend-route--court"></span>朝廷转移</li>
        <li><span class="legend-route legend-route--active"></span>首现加粗</li>
      </ul>
    </div>

    <p class="map-legend__uncertainty">
      <span class="legend-symbol legend-symbol--uncertain"></span>
      外圈表示 LOW、DISPUTED 或 UNKNOWN；虚线路线保持 INFERENCE / LOW，只是宏观节点间的解释性示意，不应理解为精确历史坐标或行军轨迹。
    </p>
      <p class="map-legend__uncertainty">
        河南、陕西边界与“今”标签仅用于现代方位，不表示唐代边界；秦岭文字锚点仅用于显示，未写入正式历史 JSON。
      </p>
    </div>
  </details>
</template>
