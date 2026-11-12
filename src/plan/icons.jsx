import { MARKER_OPACITIES } from './tokens.js'

export function HouseIcon({ fill, stroke }) {
  return (
    <>
      <polygon points="0,-16 -13,-3 13,-3" fill={stroke} opacity={MARKER_OPACITIES.iconRoof} />
      <rect x="-9" y="-3" width="18" height="14" rx="1" fill={fill} stroke={stroke} strokeWidth={1.5} />
      <rect x="-3" y="4" width="6" height="7" fill={stroke} opacity={MARKER_OPACITIES.doorAccent} />
    </>
  )
}

export function DropIcon({ fill, stroke }) {
  return (
    <path
      d="M 0,-14 C -8,-5 -10,1 -10,5 C -10,11 -5,15 0,15 C 5,15 10,11 10,5 C 10,1 8,-5 0,-14 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
    />
  )
}

export function BoltIcon({ fill, stroke }) {
  return (
    <path
      d="M 4,-14 L -5,2 L 2,2 L -5,14 L 11,-2 L 3,-2 L 10,-14 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
    />
  )
}

export function BuildingIcon({ fill, stroke }) {
  return (
    <>
      <rect x="-13" y="-13" width="26" height="26" rx="2" fill={fill} stroke={stroke} strokeWidth={1.5} />
      <rect x="-8" y="-7" width="5" height="6" fill={stroke} opacity={MARKER_OPACITIES.windowAccent} />
      <rect x="3" y="-7" width="5" height="6" fill={stroke} opacity={MARKER_OPACITIES.windowAccent} />
      <rect x="-4" y="3" width="8" height="10" rx="1" fill={stroke} opacity={MARKER_OPACITIES.doorAccent} />
    </>
  )
}
