import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parcourirDescendance } from './descendance.js'

// Le réseau réel du camping : l'arrivée Enedis alimente une borne ET le boîtier de la
// guinguette, qui alimente une borne ET le boîtier des sanitaires, qui alimente les
// siennes. C'est le cas que la version précédente ne savait pas parcourir.
const CHAINE = [
  { id: 'ARRIVEE',    distribue_vers: ['GUINGUETTE', 'B-01'] },
  { id: 'GUINGUETTE', distribue_vers: ['SANITAIRES', 'B-02'] },
  { id: 'SANITAIRES', distribue_vers: ['B-03', 'B-04'] },
  { id: 'B-01' },
  { id: 'B-02' },
  { id: 'B-03' },
  { id: 'B-04' },
]

test('remonte toute la chaîne, pas seulement les enfants directs', () => {
  const { noeuds } = parcourirDescendance(CHAINE, 'ARRIVEE')
  assert.deepEqual(
    [...noeuds].sort(),
    ['B-01', 'B-02', 'B-03', 'B-04', 'GUINGUETTE', 'SANITAIRES'],
    'les six descendants, sur trois étages',
  )
})

test('la racine est exclue — l’appelant la rajoute s’il la veut', () => {
  const { noeuds } = parcourirDescendance(CHAINE, 'ARRIVEE')
  assert.ok(!noeuds.has('ARRIVEE'))
})

test('depuis un étage intermédiaire, ne remonte pas vers le parent', () => {
  const { noeuds } = parcourirDescendance(CHAINE, 'GUINGUETTE')
  assert.deepEqual([...noeuds].sort(), ['B-02', 'B-03', 'B-04', 'SANITAIRES'])
  assert.ok(!noeuds.has('ARRIVEE'), 'le parcours descend, il ne remonte jamais')
  assert.ok(!noeuds.has('B-01'), 'la branche sœur reste en dehors')
})

test('un point sans enfant rend une descendance vide', () => {
  const { noeuds, aretes } = parcourirDescendance(CHAINE, 'B-01')
  assert.equal(noeuds.size, 0)
  assert.equal(aretes.length, 0)
})

test('les arêtes portent la parenté, ce qu’un ensemble plat perdrait', () => {
  const { aretes } = parcourirDescendance(CHAINE, 'ARRIVEE')
  assert.equal(aretes.length, 6, 'un couple par lien de la chaîne')
  assert.ok(
    aretes.some((a) => a.parent === 'SANITAIRES' && a.enfant === 'B-03'),
    'un lien du troisième étage est bien présent, avec son parent réel',
  )
  // Sans la parenté, on ne saurait pas d’où partir pour tracer ce trait.
  assert.ok(!aretes.some((a) => a.parent === 'ARRIVEE' && a.enfant === 'B-03'))
})

test('un cycle termine au lieu de figer la page', () => {
  const cycle = [
    { id: 'A', distribue_vers: ['B'] },
    { id: 'B', distribue_vers: ['C'] },
    { id: 'C', distribue_vers: ['A'] },
  ]
  const { noeuds } = parcourirDescendance(cycle, 'A')
  assert.deepEqual([...noeuds].sort(), ['B', 'C'])
})

test('un cycle sur soi-même termine aussi', () => {
  const { noeuds } = parcourirDescendance([{ id: 'A', distribue_vers: ['A'] }], 'A')
  assert.equal(noeuds.size, 0)
})

test('un enfant qui ne correspond à aucun point ne casse pas le parcours', () => {
  // Cas réel : une borne supprimée dont un parent garde la référence.
  const orphelin = [{ id: 'A', distribue_vers: ['DISPARU', 'B'] }, { id: 'B' }]
  const { noeuds, aretes } = parcourirDescendance(orphelin, 'A')
  assert.deepEqual([...noeuds].sort(), ['B', 'DISPARU'])
  assert.equal(aretes.length, 2, 'l’arête morte est rendue ; c’est au tracé de l’ignorer')
})
