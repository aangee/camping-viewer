// Vocabulaire du camping — livré par le studio, à côté de la donnée.
//
// GÉNÉRÉ par app-admin/tools/sync_viewer_data.mjs le 2026-11-12.
// Ne pas éditer à la main : la source est app-admin/src/core/vocabulaire/, et toute
// retouche ici serait écrasée à la prochaine synchronisation.

export const BORNE_TYPES = [
  "eau",
  "elec",
  "irrigation"
]

export const BORNE_COLORS = {
  "eau": {
    "fill": "#0c4a6e",
    "stroke": "#38bdf8",
    "label": "Eau"
  },
  "elec": {
    "fill": "#451a03",
    "stroke": "#fbbf24",
    "label": "Électricité"
  },
  "irrigation": {
    "fill": "#052e16",
    "stroke": "#4ade80",
    "label": "Irrigation"
  }
}

export const ROLE_STYLES = {
  "arrivee": {
    "shape": "square",
    "ringWidth": 3,
    "label": "Arrivée"
  },
  "coffret": {
    "shape": "square",
    "ringWidth": 2,
    "label": "Coffret"
  },
  "borne": {
    "shape": "circle",
    "ringWidth": 2,
    "label": "Borne"
  }
}
