import { useRef, useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { VB_W, VB_H, CULL_MARGIN } from '../contrat/vocabulaire.js'
import { ZOOM_CONFIG } from './tokens.js'
import { PlanSVGContent } from './PlanSVGContent.jsx'

// ============================================================
// zoomToFitSelection — adjusts a react-zoom-pan-pinch transform
// to frame the points implied by a selection. Reads window
// dimensions, so should not be called in SSR.
// ============================================================

export function zoomToFitSelection(transformRef, selected, data) {
  if (!selected || !data || !transformRef.current) return
  const points = []

  if (selected.type === 'hebergement') {
    const h = data.hebergements.find((x) => x.id === selected.id)
    if (!h) return
    points.push({ x: h.cx, y: h.cy })
    if (h.borne_eau) {
      const b = data.bornes_eau.find((x) => x.id === h.borne_eau)
      if (b) points.push({ x: b.x, y: b.y })
    }
    if (h.borne_elec) {
      const b = data.bornes_elec.find((x) => x.id === h.borne_elec)
      if (b) points.push({ x: b.x, y: b.y })
    }
  } else if (selected.type === 'borne_eau') {
    const b = data.bornes_eau.find((x) => x.id === selected.id)
    if (!b) return
    points.push({ x: b.x, y: b.y })
    data.hebergements.filter((h) => h.borne_eau === b.id).forEach((h) => points.push({ x: h.cx, y: h.cy }))
    ;(b.distribue_vers ?? []).forEach((targetId) => {
      const t = data.bornes_eau.find((x) => x.id === targetId)
      if (t) points.push({ x: t.x, y: t.y })
    })
  } else if (selected.type === 'borne_elec') {
    const b = data.bornes_elec.find((x) => x.id === selected.id)
    if (!b) return
    points.push({ x: b.x, y: b.y })
    data.hebergements.filter((h) => h.borne_elec === b.id).forEach((h) => points.push({ x: h.cx, y: h.cy }))
    ;(b.distribue_vers ?? []).forEach((targetId) => {
      const t = data.bornes_elec.find((x) => x.id === targetId)
      if (t) points.push({ x: t.x, y: t.y })
    })
  }

  if (!points.length) return

  const pad = ZOOM_CONFIG.selectionPad
  const minX = Math.min(...points.map((p) => p.x)) - pad
  const maxX = Math.max(...points.map((p) => p.x)) + pad
  const minY = Math.min(...points.map((p) => p.y)) - pad
  const maxY = Math.max(...points.map((p) => p.y)) + pad

  const boxW = maxX - minX
  const boxH = maxY - minY
  const availW = window.innerWidth
  const availH = window.innerHeight * ZOOM_CONFIG.selectionAvailHeightRatio

  const scale = Math.min(availW / boxW, availH / boxH, ZOOM_CONFIG.selectionMaxScale)

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const tx = availW / 2 - cx * scale
  const ty = availH / 2 - cy * scale

  transformRef.current.setTransform(tx, ty, scale, ZOOM_CONFIG.transitionMs, ZOOM_CONFIG.transitionEasing)
}

// ============================================================
// PlanSVG — viewer-style assembly with TransformWrapper +
// auto zoom-to-fit on selection + viewport culling.
// Requires react-zoom-pan-pinch as a peer dependency.
// ============================================================

export function PlanSVG({
  data,
  highlighted,
  selected,
  onSelectHebergement,
  onSelectBorne,
  onDeselect,
  planImageSrc,
}) {
  const transformRef = useRef(null)
  const [xform, setXform] = useState({
    scale: ZOOM_CONFIG.initialScale,
    positionX: 0,
    positionY: 0,
  })

  useEffect(() => {
    zoomToFitSelection(transformRef, selected, data)
  }, [selected, data])

  const isVisible = (x, y) => {
    const { scale, positionX, positionY } = xform
    const sx = positionX + x * scale
    const sy = positionY + y * scale
    const w = window.innerWidth
    const h = window.innerHeight
    return (
      sx > -CULL_MARGIN && sx < w + CULL_MARGIN &&
      sy > -CULL_MARGIN && sy < h + CULL_MARGIN
    )
  }

  if (!data) return null

  return (
    <TransformWrapper
      ref={transformRef}
      initialScale={ZOOM_CONFIG.initialScale}
      minScale={ZOOM_CONFIG.minScale}
      maxScale={ZOOM_CONFIG.maxScale}
      centerOnInit
      onInit={(ref) => setXform({ ...ref.state })}
      onPanningStop={(ref) => setXform({ ...ref.state })}
      onZoomStop={(ref) => setXform({ ...ref.state })}
      onPinchingStop={(ref) => setXform({ ...ref.state })}
    >
      <TransformComponent
        wrapperStyle={{ width: '100vw', height: '100vh' }}
        contentStyle={{ width: VB_W, height: VB_H }}
      >
        <PlanSVGContent
          data={data}
          highlighted={highlighted}
          selected={selected}
          onSelectHebergement={onSelectHebergement}
          onSelectBorne={onSelectBorne}
          onDeselect={onDeselect}
          planImageSrc={planImageSrc}
          isVisible={isVisible}
        />
      </TransformComponent>
    </TransformWrapper>
  )
}
