import {
  TYPE_COLORS,
  TYPE_COLORS_DEFAULT,
  BORNE_COLORS,
  ROLE_STYLES,
} from '../contrat/vocabulaire.js'
import {
  MARKER_GEOMETRY,
  MARKER_TYPOGRAPHY,
  MARKER_OPACITIES,
  CONNECTION_STYLES,
} from './tokens.js'
import { HouseIcon, DropIcon, BoltIcon, BuildingIcon } from './icons.jsx'
import { parcourirDescendance } from './descendance.js'

export function HebergementMarker({ h, isHighlighted, onClick }) {
  const colors = TYPE_COLORS[h.type] ?? TYPE_COLORS_DEFAULT
  return (
    <g
      role="button"
      aria-label={`Hebergement ${h.nom}`}
      tabIndex={0}
      className={isHighlighted ? 'marker-highlighted' : ''}
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onClick(h.id) }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(h.id) } }}
    >
      <circle cx={h.cx} cy={h.cy} r={MARKER_GEOMETRY.hitboxRadius} fill="transparent" />
      {isHighlighted && (
        <circle
          className="pulse-ring"
          cx={h.cx}
          cy={h.cy}
          r={MARKER_GEOMETRY.pulseRingRadius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={MARKER_GEOMETRY.pulseRingStrokeWidth}
          opacity={MARKER_OPACITIES.highlightRing}
        />
      )}
      <g transform={`translate(${h.cx}, ${h.cy})`}>
        {h.type === 'infra'
          ? <BuildingIcon fill={colors.fill} stroke={colors.stroke} />
          : <HouseIcon fill={colors.fill} stroke={colors.stroke} />}
      </g>
      <text
        x={h.cx}
        y={h.cy + MARKER_TYPOGRAPHY.hebergementLabelOffsetY}
        textAnchor="middle"
        fontSize={MARKER_TYPOGRAPHY.hebergementFontSize}
        fontWeight={MARKER_TYPOGRAPHY.fontWeight}
        fill={colors.stroke}
        fontFamily={MARKER_TYPOGRAPHY.fontFamily}
        pointerEvents="none"
      >
        {h.nom}
      </text>
    </g>
  )
}

function BorneMarker({ b, isHighlighted, onClick, colors, IconComp }) {
  // Le rôle décide de la forme, le réseau décide de la couleur — deux axes
  // indépendants. `?? 'borne'` couvre les données publiées avant la v0.5.0.
  const style = ROLE_STYLES[b.role] ?? ROLE_STYLES.borne
  // L'annonce dit ce que l'objet EST puis à quel réseau il appartient :
  // « Coffret Électricité ELEC-10 ». Les deux libellés viennent de leur table
  // respective, pour qu'aucune formulation ne soit écrite deux fois.
  const annonce = `${style.label} ${colors.label} ${b.num}`
  return (
    <g
      role="button"
      aria-label={annonce}
      tabIndex={0}
      className={isHighlighted ? 'marker-highlighted' : ''}
      style={{ cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onClick(b.id) }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(b.id) } }}
    >
      <circle cx={b.x} cy={b.y} r={MARKER_GEOMETRY.hitboxRadius} fill="transparent" />
      {style.shape === 'square' && (
        // Le cadre distingue un point qui redistribue d'un point qui dessert.
        <rect
          x={b.x - MARKER_GEOMETRY.pulseRingRadius}
          y={b.y - MARKER_GEOMETRY.pulseRingRadius}
          width={MARKER_GEOMETRY.pulseRingRadius * 2}
          height={MARKER_GEOMETRY.pulseRingRadius * 2}
          rx={3}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={style.ringWidth}
          opacity={MARKER_OPACITIES.highlightRing}
          pointerEvents="none"
        />
      )}
      {isHighlighted && (
        <circle
          className="pulse-ring"
          cx={b.x}
          cy={b.y}
          r={MARKER_GEOMETRY.pulseRingRadius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={MARKER_GEOMETRY.pulseRingStrokeWidth}
          opacity={MARKER_OPACITIES.highlightRing}
        />
      )}
      <g transform={`translate(${b.x}, ${b.y})`}>
        <IconComp fill={colors.fill} stroke={colors.stroke} />
      </g>
      <text
        x={b.x}
        y={b.y + MARKER_TYPOGRAPHY.borneLabelOffsetY}
        textAnchor="middle"
        fontSize={MARKER_TYPOGRAPHY.borneFontSize}
        fontWeight={MARKER_TYPOGRAPHY.fontWeight}
        fill={colors.stroke}
        fontFamily={MARKER_TYPOGRAPHY.fontFamily}
        pointerEvents="none"
      >
        {b.num}
      </text>
    </g>
  )
}

export function BorneEauMarker({ b, isHighlighted, onClick }) {
  return (
    <BorneMarker
      b={b}
      isHighlighted={isHighlighted}
      onClick={onClick}
      colors={BORNE_COLORS.eau}
      IconComp={DropIcon}
    />
  )
}

export function BorneElecMarker({ b, isHighlighted, onClick }) {
  return (
    <BorneMarker
      b={b}
      isHighlighted={isHighlighted}
      onClick={onClick}
      colors={BORNE_COLORS.elec}
      IconComp={BoltIcon}
    />
  )
}

export function ConnectionLines({ selected, data }) {
  if (!selected || !data) return null
  const lines = []

  if (selected.type === 'hebergement') {
    const h = data.hebergements.find((x) => x.id === selected.id)
    if (!h) return null
    if (h.borne_eau) {
      const b = data.bornes_eau.find((x) => x.id === h.borne_eau)
      if (b) lines.push({ x1: h.cx, y1: h.cy, x2: b.x, y2: b.y, color: BORNE_COLORS.eau.stroke })
    }
    if (h.borne_elec) {
      const b = data.bornes_elec.find((x) => x.id === h.borne_elec)
      if (b) lines.push({ x1: h.cx, y1: h.cy, x2: b.x, y2: b.y, color: BORNE_COLORS.elec.stroke })
    }
  } else if (selected.type === 'borne_eau') {
    const b = data.bornes_eau.find((x) => x.id === selected.id)
    if (!b) return null
    data.hebergements
      .filter((h) => h.borne_eau === b.id)
      .forEach((h) => lines.push({ x1: b.x, y1: b.y, x2: h.cx, y2: h.cy, color: BORNE_COLORS.eau.stroke }))
    // Toute la chaîne, pas seulement les enfants directs : chaque couple
    // parent→enfant de la descendance donne un trait fin.
    parcourirDescendance(data.bornes_eau, b.id).aretes.forEach(({ parent, enfant }) => {
      const p = data.bornes_eau.find((x) => x.id === parent)
      const e = data.bornes_eau.find((x) => x.id === enfant)
      if (p && e) lines.push({ x1: p.x, y1: p.y, x2: e.x, y2: e.y, color: BORNE_COLORS.eau.stroke, thin: true })
    })
  } else if (selected.type === 'borne_elec') {
    const b = data.bornes_elec.find((x) => x.id === selected.id)
    if (!b) return null
    data.hebergements
      .filter((h) => h.borne_elec === b.id)
      .forEach((h) => lines.push({ x1: b.x, y1: b.y, x2: h.cx, y2: h.cy, color: BORNE_COLORS.elec.stroke }))
    parcourirDescendance(data.bornes_elec, b.id).aretes.forEach(({ parent, enfant }) => {
      const p = data.bornes_elec.find((x) => x.id === parent)
      const e = data.bornes_elec.find((x) => x.id === enfant)
      if (p && e) lines.push({ x1: p.x, y1: p.y, x2: e.x, y2: e.y, color: BORNE_COLORS.elec.stroke, thin: true })
    })
  }

  return (
    <>
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={l.color}
          strokeWidth={l.thin ? CONNECTION_STYLES.thinStrokeWidth : CONNECTION_STYLES.normalStrokeWidth}
          strokeDasharray={l.thin ? CONNECTION_STYLES.thinDasharray : CONNECTION_STYLES.normalDasharray}
          opacity={l.thin ? CONNECTION_STYLES.thinOpacity : CONNECTION_STYLES.normalOpacity}
          pointerEvents="none"
        />
      ))}
    </>
  )
}
