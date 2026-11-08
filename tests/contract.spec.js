import { test, expect } from '@playwright/test'
import { VIEWER_PATH, gotoPlan, hebergementMarkers } from './helpers.js'

test('viewBox — conforme 2560x1567', async ({ page }) => {
  await gotoPlan(page)
  const vb = await page.getByRole('application', { name: 'Plan du camping' }).getAttribute('viewBox')
  expect(vb).toBe('0 0 2560 1567')
})

test('IDs SVG — aucun doublon', async ({ page }) => {
  await gotoPlan(page)
  await expect(hebergementMarkers(page).first()).toBeVisible()

  const ids = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[id]')).map((el) => el.id).filter(Boolean)
  )
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  expect(dupes, `IDs en doublon : ${[...new Set(dupes)].join(', ')}`).toHaveLength(0)
})

test('data.json — refs bornes_eau et bornes_elec resolues', async ({ request }) => {
  const resp = await request.get(`${VIEWER_PATH}data.json`)
  expect(resp.status()).toBe(200)
  const data = await resp.json()

  const eauIds = new Set((data.bornes_eau ?? []).map((b) => b.id))
  const elecIds = new Set((data.bornes_elec ?? []).map((b) => b.id))

  const broken = (data.hebergements ?? []).flatMap((h) => {
    const errs = []
    if (h.borne_eau && !eauIds.has(h.borne_eau)) {
      errs.push(`${h.id}: borne_eau "${h.borne_eau}" introuvable`)
    }
    if (h.borne_elec && !elecIds.has(h.borne_elec)) {
      errs.push(`${h.id}: borne_elec "${h.borne_elec}" introuvable`)
    }
    return errs
  })

  expect(broken, broken.join('\n')).toHaveLength(0)
})
