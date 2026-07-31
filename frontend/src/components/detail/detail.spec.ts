import { createApp, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import type {
  MvpDataset,
  SelectionState,
  SourcedClaim,
} from '../../domain/mvpTypes'
import CitationList from './CitationList.vue'
import DetailPanel from './DetailPanel.vue'

function claim(
  claimId: string,
  text: string,
  certainty: SourcedClaim['certainty'] = 'UNKNOWN',
  citationIds = ['citation-one', 'citation-two'],
): SourcedClaim {
  return {
    claimId,
    text,
    viewpointType: 'INFERENCE',
    certainty,
    citationIds,
  }
}

const dataset: MvpDataset = {
  schemaVersion: '1.0',
  topic: {
    id: 'topic-test',
    title: '合成详情专题',
    subtitle: '仅用于组件测试',
    summary: '不表示历史事实。',
    initialView: { center: [0, 0], zoom: 3 },
    defaultEventId: 'event-test',
  },
  places: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          id: 'place-test',
          name: '合成关隘',
          modernName: null,
          placeType: 'PASS',
          summary: claim('claim-place-summary', '合成地点说明。', 'DISPUTED'),
          strategicRole: claim(
            'claim-place-role',
            '合成战略作用。',
            'UNKNOWN',
          ),
          certainty: 'DISPUTED',
          coordinateNote: claim(
            'claim-place-coordinate',
            '代表点存在对应争议，不是精确历史坐标。',
            'DISPUTED',
          ),
          citationIds: ['citation-one'],
        },
      },
    ],
  },
  geography: { type: 'FeatureCollection', features: [] },
  routeSegments: { type: 'FeatureCollection', features: [] },
  events: [
    {
      id: 'event-test',
      sequence: 1,
      title: '合成事件',
      eventType: 'OTHER',
      dateLabel: '未换算的相对时间',
      normalizedDate: null,
      timePrecision: 'APPROXIMATE',
      certainty: 'UNKNOWN',
      summary: claim('claim-event-summary', '合成事件摘要。'),
      whyItMatters: claim('claim-event-why', '合成事件重要性。'),
      relatedPlaceIds: ['place-test'],
      actorLabels: ['甲方', '乙方'],
      citationIds: ['citation-one'],
    },
  ],
  sources: [
    {
      id: 'source-one',
      title: '《合成资料一》',
      author: '测试作者',
      edition: '固定测试版本',
      publisher: null,
      publishYear: null,
      sourceType: '合成资料',
      provenance: null,
    },
    {
      id: 'source-two',
      title: '《合成资料二》',
      author: null,
      edition: null,
      publisher: '测试出版社',
      publishYear: 2026,
      sourceType: '合成资料',
      provenance: null,
    },
  ],
  citations: [
    {
      id: 'citation-one',
      sourceId: 'source-one',
      chapter: '测试章节',
      locator: 'anchor-one',
      pageStart: null,
      pageEnd: null,
      quote: '必要且短小的合成原文摘录。',
      summary: '这是一条项目归纳。',
      viewpointType: 'PRIMARY_RECORD',
      certainty: 'UNKNOWN',
    },
    {
      id: 'citation-two',
      sourceId: 'source-two',
      chapter: null,
      locator: null,
      pageStart: 10,
      pageEnd: 12,
      quote: null,
      summary: '这是第二条项目归纳。',
      viewpointType: 'MODERN_RESEARCH',
      certainty: 'DISPUTED',
    },
  ],
}

const mountedHosts: HTMLElement[] = []

function mountDetail(initialSelection: SelectionState) {
  const host = document.createElement('div')
  document.body.append(host)
  mountedHosts.push(host)
  const selection = ref<SelectionState>({ ...initialSelection })
  const app = createApp({
    setup() {
      return () =>
        h(DetailPanel, {
          dataset,
          selection: selection.value,
          onClearPlace: () => {
            selection.value = {
              ...selection.value,
              selectedPlaceId: undefined,
            }
          },
          onSelectPlace: (placeId: string) => {
            selection.value = { ...selection.value, selectedPlaceId: placeId }
          },
        })
    },
  })
  app.mount(host)
  return { app, host, selection }
}

afterEach(() => {
  for (const host of mountedHosts.splice(0)) {
    host.remove()
  }
})

describe('MVP-08 detail components', () => {
  it('按 Place > Event > Empty 优先级切换，关闭地点后回到原事件', async () => {
    const { app, host, selection } = mountDetail({
      selectedEventId: 'event-test',
    })

    expect(host.querySelector('.detail-panel')?.getAttribute('data-detail-mode')).toBe(
      'EVENT',
    )

    selection.value = {
      selectedEventId: 'event-test',
      selectedPlaceId: 'place-test',
    }
    await nextTick()

    expect(host.querySelector('.detail-panel')?.getAttribute('data-detail-mode')).toBe(
      'PLACE',
    )
    host.querySelector<HTMLButtonElement>('.detail-close')?.click()
    await nextTick()

    expect(selection.value.selectedEventId).toBe('event-test')
    expect(selection.value.selectedPlaceId).toBeUndefined()
    expect(host.querySelector('.detail-panel')?.getAttribute('data-detail-mode')).toBe(
      'EVENT',
    )

    selection.value = {}
    await nextTick()
    expect(host.querySelector('[data-testid="empty-detail"]')).not.toBeNull()
    expect(host.textContent).toContain('尚未选择事件或地点')

    app.unmount()
  })

  it('事件详情保留正式时间精度、相关地点、参与者和多个逐条引用', async () => {
    const { app, host, selection } = mountDetail({
      selectedEventId: 'event-test',
    })

    expect(host.textContent).toContain('未换算的相对时间')
    expect(host.textContent).toContain('约略时间；未换算为精确公历日期')
    expect(host.textContent).not.toContain('标准化日期：null')
    expect(host.textContent).toContain('合成事件摘要。')
    expect(host.textContent).toContain('合成事件重要性。')
    expect(
      host.querySelector(
        '[data-claim-id="claim-event-summary"] .viewpoint-badge--claim',
      )?.textContent,
    ).toContain('结论类型：项目推断')
    expect(
      host.querySelector(
        '[data-claim-id="claim-event-summary"] [data-citation-id="citation-one"] .viewpoint-badge--citation',
      )?.textContent,
    ).toContain('资料观点：原始记载')
    expect(host.textContent).toContain('甲方')
    expect(host.textContent).toContain('乙方')
    expect(
      host.querySelectorAll('[data-claim-id="claim-event-summary"] .citation-card'),
    ).toHaveLength(2)
    expect(host.textContent).toContain('测试作者 · 固定测试版本')
    expect(host.textContent).toContain('第 10—12 页')

    host
      .querySelector<HTMLButtonElement>('[data-related-place-id="place-test"]')
      ?.click()
    await nextTick()
    expect(selection.value.selectedPlaceId).toBe('place-test')

    app.unmount()
  })

  it('地点详情省略空现代名，并用文字说明 DISPUTED/UNKNOWN 与坐标边界', () => {
    const { app, host } = mountDetail({ selectedPlaceId: 'place-test' })

    expect(host.textContent).toContain('地点类型：关隘')
    expect(host.textContent).not.toContain('现代对应：')
    expect(host.textContent).toContain('存在争议')
    expect(host.textContent).toContain('当前展示保留争议')
    expect(host.textContent).toContain('尚不确定')
    expect(host.textContent).toContain('不能当作确定事实')
    expect(host.textContent).toContain('不是精确历史坐标')
    expect(host.textContent).not.toContain('null')
    expect(
      host.querySelector('.place-detail > .citation-list > h3')?.textContent,
    ).toContain('地点与代表点依据')

    app.unmount()
  })

  it('原文短摘与项目归纳使用独立文案和结构，空原文不渲染', () => {
    const host = document.createElement('div')
    document.body.append(host)
    mountedHosts.push(host)
    const bundles = dataset.citations.map((citation) => ({
      citation,
      source: dataset.sources.find((source) => source.id === citation.sourceId)!,
    }))
    const app = createApp(CitationList, { citations: bundles })
    app.mount(host)

    expect(host.querySelectorAll('.citation-card__summary')).toHaveLength(2)
    expect(host.querySelectorAll('.citation-card__quote')).toHaveLength(1)
    expect(host.querySelector('.citation-card__summary')?.textContent).toContain(
      '项目归纳',
    )
    expect(host.querySelector('.citation-card__quote')?.textContent).toContain(
      '原文短摘',
    )
    expect(
      host.querySelector('[data-citation-id="citation-two"] .citation-card__locator')
        ?.textContent,
    ).toContain('第 10—12 页')
    expect(
      host.querySelector('[data-citation-id="citation-two"] .citation-card__quote'),
    ).toBeNull()
    expect(
      host.querySelector('[data-citation-id="citation-two"]')?.textContent,
    ).not.toContain('null')

    app.unmount()
  })

  it('未知选择 ID 不制造伪详情', async () => {
    const { app, host, selection } = mountDetail({
      selectedEventId: 'event-unknown',
      selectedPlaceId: 'place-unknown',
    })

    expect(host.querySelector('[data-testid="empty-detail"]')).not.toBeNull()
    selection.value = {
      selectedEventId: 'event-test',
      selectedPlaceId: 'place-unknown',
    }
    await nextTick()
    expect(host.querySelector('.event-detail')).not.toBeNull()

    app.unmount()
  })
})
