// Parcours de la chaîne d'alimentation d'un réseau.
//
// Le réseau réel est une chaîne qui essaime : une arrivée alimente des bornes ET un
// coffret, qui alimente des bornes ET un autre coffret. La profondeur n'est pas fixée.
// Jusqu'à la v0.5.0, la surbrillance et le tracé ne regardaient que `distribue_vers`
// du point sélectionné — donc un seul niveau : sélectionner l'arrivée n'éclairait que
// le premier coffret.
//
// ⚠ La garde anti-cycle n'est pas une précaution de principe. Rien, dans les données
// reprises, n'empêche A d'alimenter B qui alimente A — et sans elle, le parcours
// boucle indéfiniment et fige la page.

/**
 * Parcourt toute la descendance d'un point, en largeur.
 *
 * @param {Array<{id: string, distribue_vers?: string[]}>} bornes - les points du réseau
 * @param {string} racineId - le point de départ
 * @returns {{noeuds: Set<string>, aretes: Array<{parent: string, enfant: string}>}}
 *   `noeuds` : tous les descendants, **racine exclue** — l'appelant la rajoute s'il la
 *   veut, ce qui évite d'avoir à la retirer côté surbrillance.
 *   `aretes` : chaque couple parent→enfant rencontré, dans l'ordre du parcours. C'est
 *   ce qui permet de tracer les traits : un ensemble plat perdrait la parenté.
 */
export function parcourirDescendance(bornes, racineId) {
  const parIdentifiant = new Map(bornes.map((b) => [b.id, b]))
  const noeuds = new Set()
  const aretes = []
  const file = [racineId]

  while (file.length) {
    const courant = file.shift()
    if (noeuds.has(courant)) continue // déjà traversé : coupe le cycle
    noeuds.add(courant)

    for (const enfant of parIdentifiant.get(courant)?.distribue_vers ?? []) {
      aretes.push({ parent: courant, enfant })
      file.push(enfant)
    }
  }

  noeuds.delete(racineId)
  return { noeuds, aretes }
}
