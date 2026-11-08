import { expect } from '@playwright/test'

export const VIEWER_PATH = '/camping-viewer/'

export function collectPageErrors(page) {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

export async function gotoPlan(page) {
  await page.goto(VIEWER_PATH)
  await expect(page.getByRole('application', { name: 'Plan du camping' })).toBeVisible({
    timeout: 10_000,
  })
}

export function hebergementMarkers(page) {
  return page.getByRole('button', { name: /^Hebergement / })
}

// L'annonce accessible d'un point du réseau est composée dans le package :
// `${ROLE_STYLES[role].label} ${BORNE_COLORS[reseau].label} ${num}` — soit
// « Borne Eau EAU-01 » (markers.jsx:69). Le motif est donc insensible à la casse :
// ces deux libellés vivent dans des tables de `cottet-plan-lib`, et une majuscule
// qui change là-bas ne doit pas casser un test d'ici.
//
// ⚠ Ne pas élargir à /^Borne / : « Borne Électricité … » matcherait aussi.
//
// Corrigé le 2026-11-08 : le motif était `/^Borne eau /`, juste à l'écriture de ce
// fichier le 11/09, puis cassé le 15/09 par le commit 027c032 (« styles par rôle »)
// qui a composé l'annonce depuis les deux tables. Personne ne l'a vu pendant deux
// mois — ces tests ne tournent pas automatiquement.
export function borneEauMarkers(page) {
  return page.getByRole('button', { name: /^Borne eau /i })
}
