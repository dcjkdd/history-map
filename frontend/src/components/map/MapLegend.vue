<template>
  <section class="map-legend" aria-label="图例与不确定性">
    <h3 class="map-legend__title">图例与不确定性</h3>
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
        <li><span class="legend-line legend-line--river"></span>现代河流概览</li>
        <li><span class="legend-flow">➤</span>现代总体流向</li>
        <li><span class="legend-area legend-area--mountain"></span>秦岭相关山地</li>
        <li><span class="legend-corridor"></span>东入关中解释性通道</li>
        <li><span class="legend-line legend-line--province"></span>今省界</li>
      </ul>
    </div>

    <div class="map-legend__section">
      <p>行动路线（虚线、单个箭头与文字区分主体）</p>
      <ul>
        <li><span class="legend-route legend-route--tang"></span>唐军</li>
        <li><span class="legend-route legend-route--yan"></span>燕军</li>
        <li><span class="legend-route legend-route--court"></span>朝廷转移</li>
        <li><span class="legend-route legend-route--active"></span>首现加粗</li>
        <li><span class="legend-route-direction">▶</span>路线方向（单个）</li>
      </ul>
    </div>

    <p class="map-legend__uncertainty">
      <span class="legend-symbol legend-symbol--uncertain"></span>
      外圈表示 LOW、DISPUTED 或 UNKNOWN；虚线路线保持 INFERENCE / LOW，只是宏观节点间的解释性示意，不应理解为精确历史坐标或行军轨迹。
    </p>
      <p class="map-legend__uncertainty">
        河南、陕西边界、流向箭头与低地标签仅用于现代概览；秦岭、低地文字锚点只为显示，均未写入正式历史 JSON。
      </p>
      <p class="map-legend__uncertainty">
        赭金通道带复用灵宝—潼关两个争议代表点，固定 22px 仅为屏幕表达；不是唐代道路、真实宽度或军队路线。
      </p>
      <p class="map-legend__uncertainty">
        路线使用主体色虚线、单个 ▶ 与中文方向/距离；现代河流仍是蓝色实线上的重复 ➤，赭金通道没有箭头。
      </p>
    </div>
  </section>
</template>
