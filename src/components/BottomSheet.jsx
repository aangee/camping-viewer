import { BORNE_TYPES, BORNE_COLORS, ROLE_STYLES } from '../contrat/vocabulaire.js'

const LABELS = {
  mh_2ch_3p:    'MH 2CH/3P',
  mh_2ch_4p:    'MH 2CH/4P',
  mh_3ch_6p:    'MH 3CH/6P',
  resident:     'Résident',
  dome_cocoon:  'Dôme Cocoon',
  tente_equipee:'Tente équipée',
  chalet_eco:   'Chalet Eco-lodge',
  caravane:     'Caravane',
  emplacement_nu:'Emplacement nu',
  piscine:       'Piscine',
  infra:         'Infrastructure',
}

function HebergementContent({ h }) {
  return (
    <>
      <div className="sheet-title">Parcelle {h.nom}</div>
      <div className="sheet-label">{LABELS[h.type] ?? h.type}</div>
      <div style={{ marginTop: 12 }}>
        <div className="sheet-row">
          <span>💧</span>
          <span>{h.borne_eau ?? 'Non raccordé'}</span>
        </div>
        <div className="sheet-row">
          <span>⚡</span>
          <span>{h.borne_elec ?? 'Non raccordé'}</span>
        </div>
      </div>
      {h.note && (
        <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
          ⚠ {h.note}
        </div>
      )}
    </>
  )
}

// Un seul composant pour les deux réseaux : ils ne différaient que par la couleur
// et le libellé, tous deux disponibles dans la table du package.
function PointReseauContent({ borne, reseau }) {
  const couleurs = BORNE_COLORS[reseau]
  const role = borne.role ?? 'borne'
  const style = ROLE_STYLES[role] ?? ROLE_STYLES.borne
  const redistribue = role !== 'borne'

  const Pastilles = ({ valeurs, plein }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {valeurs.map(v => (
        <span key={v} style={{
          background: plein ? couleurs.fill : 'transparent',
          color: couleurs.stroke,
          border: plein ? 'none' : `1px solid ${couleurs.stroke}`,
          borderRadius: 6, padding: '2px 8px',
          fontSize: plein ? 14 : 13, fontWeight: 700,
        }}>{v}</span>
      ))}
    </div>
  )

  const alimente = borne.distribue_vers ?? []
  const dessert = borne.parcelles ?? []

  // Ce qu'un boîtier fait d'abord, c'est redistribuer : sa fiche commence donc par
  // là, quand une borne commence par ce qu'elle dessert.
  const blocAlimente = alimente.length > 0 && (
    <div key="alimente">
      <div className="sheet-label" style={{ marginTop: 12, marginBottom: 6 }}>
        Alimente {alimente.length} point{alimente.length > 1 ? 's' : ''} :
      </div>
      <Pastilles valeurs={alimente} plein={false} />
    </div>
  )

  const blocDessert = (
    <div key="dessert">
      {dessert.length > 0 ? (
        <>
          <div className="sheet-label" style={{ marginTop: 12, marginBottom: 8 }}>Dessert :</div>
          <Pastilles valeurs={dessert} plein />
        </>
      ) : (
        <div className="sheet-label" style={{ marginTop: 12 }}>
          {redistribue ? 'Ne dessert aucun emplacement directement' : 'Aucun emplacement enregistré'}
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="sheet-title">
        {borne.num} — {style.label} {couleurs.label.toLowerCase()}
      </div>
      {redistribue
        ? <>{blocAlimente}{blocDessert}</>
        : <>{blocDessert}{blocAlimente}</>}
      {borne.note && (
        <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
          ⚠ {borne.note}
        </div>
      )}
    </>
  )
}

export function BottomSheet({ selected, data, onClose }) {
  const isOpen = selected !== null && data !== null

  const content = (() => {
    if (!selected || !data) return null
    if (selected.type === 'hebergement') {
      const h = data.hebergements.find(x => x.id === selected.id)
      return h ? <HebergementContent h={h} /> : null
    }
    // Un cas par réseau déclaré, au lieu d'une branche écrite à la main pour chacun.
    for (const reseau of BORNE_TYPES) {
      if (selected.type !== `borne_${reseau}`) continue
      const b = (data[`bornes_${reseau}`] ?? []).find(x => x.id === selected.id)
      return b ? <PointReseauContent borne={b} reseau={reseau} /> : null
    }
    return null
  })()

  return (
    <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
      <div className="bottom-sheet-handle" onClick={onClose} style={{ cursor: 'pointer' }} />
      {content}
    </div>
  )
}
