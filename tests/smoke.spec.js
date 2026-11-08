import { test, expect } from '@playwright/test'
import {
  collectPageErrors,
  gotoPlan,
  hebergementMarkers,
  borneEauMarkers,
} from './helpers.js'

test('chargement — plan visible, aucune erreur console', async ({ page }) => {
  const errors = collectPageErrors(page)
  await gotoPlan(page)
  expect(errors, `Erreurs JS : ${errors.join('\n')}`).toHaveLength(0)
})

test('clic hébergement — bottom sheet visible, aucune erreur', async ({ page }) => {
  const errors = collectPageErrors(page)
  await gotoPlan(page)

  await hebergementMarkers(page).first().click()
  await expect(page.locator('.bottom-sheet.open')).toBeVisible()
  await expect(page.locator('.sheet-title')).toContainText('Parcelle')

  expect(errors, `Erreurs JS : ${errors.join('\n')}`).toHaveLength(0)
})

test('clic borne eau — bottom sheet visible, aucune erreur', async ({ page }) => {
  const errors = collectPageErrors(page)
  await gotoPlan(page)

  await borneEauMarkers(page).first().click()
  await expect(page.locator('.bottom-sheet.open')).toBeVisible()
  await expect(page.locator('.sheet-title')).toContainText('Borne eau')

  expect(errors, `Erreurs JS : ${errors.join('\n')}`).toHaveLength(0)
})

test('clic hébergement puis déplacement — pas de blocage', async ({ page }) => {
  const errors = collectPageErrors(page)
  await gotoPlan(page)

  await hebergementMarkers(page).first().click()
  await expect(page.locator('.bottom-sheet.open')).toBeVisible()

  await page.mouse.move(300, 200)
  await page.mouse.down()
  await page.mouse.move(400, 300)
  await page.mouse.up()

  expect(errors, `Erreurs JS : ${errors.join('\n')}`).toHaveLength(0)
})
