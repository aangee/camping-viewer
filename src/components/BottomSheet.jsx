import { BORNE_COLORS } from '@aangee/cottet-plan-lib/constants'

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

function BorneEauContent({ borne }) {
  return (
    <>
      <div className="sheet-title">{borne.num} — Borne eau 💧</div>
      {borne.parcelles.length > 0 ? (
        <>
          <div className="sheet-label" style={{ marginBottom: 8 }}>Parcelles :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {borne.parcelles.map(p => (
              <span key={p} style={{
                background: BORNE_COLORS.eau.fill, color: BORNE_COLORS.eau.stroke,
                borderRadius: 6, padding: '2px 8px', fontSize: 14, fontWeight: 700
              }}>{p}</span>
            ))}
          </div>
        </>
      ) : (
        <div className="sheet-label">Infrastructure (pas de parcelle numérotée)</div>
      )}
      {borne.distribue_vers?.length > 0 && (
        <>
          <div className="sheet-label" style={{ marginTop: 12, marginBottom: 6 }}>Alimente les bornes :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {borne.distribue_vers.map(b => (
              <span key={b} style={{
                background: 'transparent', color: BORNE_COLORS.eau.stroke,
                border: `1px solid ${BORNE_COLORS.eau.stroke}`,
                borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 700
              }}>{b}</span>
            ))}
          </div>
        </>
      )}
      {borne.note && (
        <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
          ⚠ {borne.note}
        </div>
      )}
    </>
  )
}

function BorneElecContent({ borne }) {
  return (
    <>
      <div className="sheet-title">{borne.num} — Borne élec ⚡</div>
      {borne.parcelles.length > 0 ? (
        <>
          <div className="sheet-label" style={{ marginBottom: 8 }}>Parcelles :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {borne.parcelles.map(p => (
              <span key={p} style={{
                background: BORNE_COLORS.elec.fill, color: BORNE_COLORS.elec.stroke,
                borderRadius: 6, padding: '2px 8px', fontSize: 14, fontWeight: 700
              }}>{p}</span>
            ))}
          </div>
        </>
      ) : (
        <div className="sheet-label">Borne sans parcelles enregistrées</div>
      )}
      {borne.distribue_vers?.length > 0 && (
        <>
          <div className="sheet-label" style={{ marginTop: 12, marginBottom: 6 }}>Alimente les bornes :</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {borne.distribue_vers.map(b => (
              <span key={b} style={{
                background: 'transparent', color: BORNE_COLORS.elec.stroke,
                border: `1px solid ${BORNE_COLORS.elec.stroke}`,
                borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 700
              }}>{b}</span>
            ))}
          </div>
        </>
      )}
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
    if (selected.type === 'borne_eau') {
      const b = data.bornes_eau.find(x => x.id === selected.id)
      return b ? <BorneEauContent borne={b} /> : null
    }
    if (selected.type === 'borne_elec') {
      const b = data.bornes_elec.find(x => x.id === selected.id)
      return b ? <BorneElecContent borne={b} /> : null
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
