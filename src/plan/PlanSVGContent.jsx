import { useMemo } from 'react'
import { parcourirDescendance } from './descendance.js'
import { VB_W, VB_H } from '../contrat/vocabulaire.js'
import { IMAGE_OPACITY } from './tokens.js'
import {
  HebergementMarker,
  BorneEauMarker,
  BorneElecMarker,
  ConnectionLines,
} from './markers.jsx'

// ============================================================
// useHighlight — derives highlighted IDs from a selection.
// Pure hook, no DOM access. Returns three Sets.
// Kept in the content module so admin can import this hook
// without pulling react-zoom-pan-pinch resolution.
// ============================================================

export function useHighlight(selected, data) {
  return useMemo(() => {
    const empty = { hebergements: new Set(), bornes_eau: new Set(), bornes_elec: new Set() }
    if (!selected || !data) return empty

    if (selected.type === 'hebergement') {
      const h = data.hebergements.find((x) => x.id === selected.id)
      if (!h) return empty
      return {
        hebergements: new Set([h.id]),
        bornes_eau: h.borne_eau ? new Set([h.borne_eau]) : new Set(),
        bornes_elec: h.borne_elec ? new Set([h.borne_elec]) : new Set(),
      }
    }

    // Toute la descendance, pas seulement les enfants directs : la chaîne peut avoir
    // plusieurs étages (arrivée → coffret → coffret → bornes).
    if (selected.type === 'borne_eau') {
      const borne = data.bornes_eau.find((b) => b.id === selected.id)
      if (!borne) return empty
      const { noeuds } = parcourirDescendance(data.bornes_eau, borne.id)
      return {
        hebergements: new Set(borne.parcelles),
        bornes_eau: new Set([borne.id, ...noeuds]),
        bornes_elec: new Set(),
      }
    }

    if (selected.type === 'borne_elec') {
      const borne = data.bornes_elec.find((b) => b.id === selected.id)
      if (!borne) return empty
      const { noeuds } = parcourirDescendance(data.bornes_elec, borne.id)
      return {
        hebergements: new Set(borne.parcelles),
        bornes_eau: new Set(),
        bornes_elec: new Set([borne.id, ...noeuds]),
      }
    }

    return empty
  }, [selected, data])
}

// ============================================================
// PlanSVGContent — inner SVG (background image + connection lines + markers).
// Zero dependency on react-zoom-pan-pinch. Consumers like app-admin can wrap
// it with their own zoom/pan system, or use it standalone for thumbnails.
//
// IMPORTANT: planImageSrc is required to render the background plan.
// Omit it intentionally only if you want to render markers without the map.
// Pass an isVisible(x, y) predicate to opt into viewport culling; omit it
// to render every marker.
// ============================================================

export function PlanSVGContent({
  data,
  highlighted,
  selected,
  onSelectHebergement,
  onSelectBorne,
  onDeselect,
  planImageSrc,
  isVisible,
}) {
  if (!data) return null
  const visible = isVisible ?? (() => true)

  return (
    <svg
      role="application"
      aria-label="Plan du camping"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ width: VB_W, height: VB_H, display: 'block' }}
      onClick={onDeselect}
    >
      {planImageSrc && (
        <image
          href={planImageSrc}
          x={0}
          y={0}
          width={VB_W}
          height={VB_H}
          opacity={IMAGE_OPACITY}
          style={{ pointerEvents: 'none' }}
        />
      )}

      <ConnectionLines selected={selected} data={data} />

      {data.hebergements
        .filter((h) => visible(h.cx, h.cy) || highlighted.hebergements.has(h.id))
        .map((h) => (
          <HebergementMarker
            key={h.id}
            h={h}
            isHighlighted={highlighted.hebergements.has(h.id)}
            onClick={onSelectHebergement}
          />
        ))}

      {data.bornes_eau
        .filter((b) => visible(b.x, b.y) || highlighted.bornes_eau.has(b.id))
        .map((b) => (
          <BorneEauMarker
            key={b.id}
            b={b}
            isHighlighted={highlighted.bornes_eau.has(b.id)}
            onClick={(id) => onSelectBorne('borne_eau', id)}
          />
        ))}

      {data.bornes_elec
        .filter((b) => visible(b.x, b.y) || highlighted.bornes_elec.has(b.id))
        .map((b) => (
          <BorneElecMarker
            key={b.id}
            b={b}
            isHighlighted={highlighted.bornes_elec.has(b.id)}
            onClick={(id) => onSelectBorne('borne_elec', id)}
          />
        ))}
    </svg>
  )
}
