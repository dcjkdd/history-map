import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { MvpDataset } from '../../src/domain/mvpTypes'
import {
  buildRouteDisplayFeatures,
  EARTH_MEAN_RADIUS_KM,
  getRoutePresentation,
  haversineDistanceKm,
  roundRouteDistanceKm,
  ROUTE_DISTANCE_METHOD_NOTE,
  routeIdIsVisible,
} from '../../src/domain/routePresentation'

const datasetPath = resolve(process.cwd(), 'public/data/anshi/mvp-v1.json')
const dataset = JSON.parse(readFileSync(datasetPath, 'utf8')) as MvpDataset

describe('PHASE2-04 route presentation', () => {
  it('用已批准平均地球半径、Haversine 与最近 5 公里规则复算三段距离', () => {
    expect(EARTH_MEAN_RADIUS_KM).toBe(6371.0088)
    expect(ROUTE_DISTANCE_METHOD_NOTE).toContain('不等于唐代道路或历史行军里程')

    const rawDistances = dataset.routeSegments.features.map((segment) =>
      haversineDistanceKm(
        segment.geometry.coordinates[0]!,
        segment.geometry.coordinates[1]!,
      ),
    )

    expect(rawDistances[0]).toBeCloseTo(119.995101, 6)
    expect(rawDistances[1]).toBeCloseTo(81.167887, 6)
    expect(rawDistances[2]).toBeCloseTo(53.246055, 6)
    expect(rawDistances.map(roundRouteDistanceKm)).toEqual([120, 80, 55])
  })

  it('派生方向、单箭头和距离属性时逐点复制正式两点几何', () => {
    const display = buildRouteDisplayFeatures(
      dataset.routeSegments,
      dataset.places,
    )

    expect(display.features).toHaveLength(3)
    expect(display.features.map((feature) => feature.geometry)).toEqual(
      dataset.routeSegments.features.map((feature) => feature.geometry),
    )
    expect(display.features.map((feature) => feature.properties.arrowText)).toEqual([
      '▶',
      '▶',
      '▶',
    ])
    expect(
      display.features.map((feature) => feature.properties.directionLabel),
    ).toEqual(['燕军 · 向西', '燕军 · 向西', '唐军 · 向东'])
    expect(
      display.features.map((feature) => feature.properties.distanceLabel),
    ).toEqual([
      '现代代表点间直线距离约 120 公里',
      '现代代表点间直线距离约 80 公里',
      '现代代表点间直线距离约 55 公里',
    ])
  })

  it('路线详情只使用获批四句、正式 Citation 与燕军三条补充来源', () => {
    const yan = getRoutePresentation(dataset, 'route-yan-westward')
    const tang = getRoutePresentation(dataset, 'route-tang-advance')

    expect(yan?.notes).toHaveLength(4)
    expect(yan?.notes[3]).toContain('其中陕州—潼关西段南依崤山、北临黄河')
    expect(yan?.supplementalSources.map((source) => source.id)).toEqual([
      'PHASE2-04-SRC-XIAOHAN-SCOPE-01',
      'PHASE2-04-SRC-XIAOHAN-WEST-TERRAIN-01',
      'PHASE2-04-SRC-XIAOHAN-TANG-CONTEXT-01',
    ])
    expect(yan?.citationIds).toContain('CIT-ZZTJ217-R783496-P01')
    expect(tang?.notes).toHaveLength(4)
    expect(tang?.notes[1]).toContain('南近山、北临黄河的狭窄通道')
    expect(tang?.supplementalSources).toEqual([])
    expect(tang?.segments[0]?.roundedDistanceKm).toBe(55)
  })

  it('拒绝无效坐标、负距离与偏离 Place 代表点的路线端点', () => {
    expect(() => haversineDistanceKm([181, 0], [0, 0])).toThrow(
      '不是有效的经纬度坐标',
    )
    expect(() => roundRouteDistanceKm(-1)).toThrow('非负有限数值')

    const drifted = structuredClone(dataset.routeSegments)
    drifted.features[0]!.geometry.coordinates[0] = [112.45, 34.67]

    expect(() => buildRouteDisplayFeatures(drifted, dataset.places)).toThrow(
      '与 Place place-luoyang 的正式代表点不一致',
    )
  })

  it('事件回退时只以当前可见 segment 判断逻辑路线是否仍可选择', () => {
    expect(
      routeIdIsVisible(
        dataset.routeSegments,
        'route-tang-advance',
        ['route-yan-westward-01', 'route-yan-westward-02'],
      ),
    ).toBe(false)
    expect(
      routeIdIsVisible(
        dataset.routeSegments,
        'route-tang-advance',
        ['route-tang-advance-01'],
      ),
    ).toBe(true)
  })
})
