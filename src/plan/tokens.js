const deepFreeze = (o) => {
  if (o === null || typeof o !== 'object' || Object.isFrozen(o)) return o
  for (const v of Object.values(o)) deepFreeze(v)
  return Object.freeze(o)
}

export const MARKER_GEOMETRY = deepFreeze({
  hitboxRadius: 28,
  pulseRingRadius: 22,
  pulseRingStrokeWidth: 2.5,
})

export const MARKER_TYPOGRAPHY = deepFreeze({
  fontFamily: "'Courier New', monospace",
  fontWeight: 700,
  hebergementFontSize: 10,
  borneFontSize: 9,
  hebergementLabelOffsetY: 27,
  borneLabelOffsetY: 28,
})

export const ZOOM_CONFIG = deepFreeze({
  initialScale: 0.3,
  minScale: 0.1,
  maxScale: 4,
  selectionPad: 60,
  selectionMaxScale: 2.5,
  selectionAvailHeightRatio: 0.58,
  transitionMs: 350,
  transitionEasing: 'easeOut',
})

export const CONNECTION_STYLES = deepFreeze({
  normalStrokeWidth: 3,
  thinStrokeWidth: 1.5,
  normalDasharray: '14 8',
  thinDasharray: '4 6',
  normalOpacity: 0.7,
  thinOpacity: 0.55,
})

export const MARKER_OPACITIES = deepFreeze({
  highlightRing: 0.9,
  iconRoof: 0.95,
  windowAccent: 0.8,
  doorAccent: 0.7,
})

export const IMAGE_OPACITY = 0.5
