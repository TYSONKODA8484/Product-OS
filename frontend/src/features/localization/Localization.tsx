import { I } from '../../components/ui/Icon'

export function Localization() {
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Localization</h1>
          <p className="page-sub">This module is being redesigned.</p>
        </div>
      </div>
      <div className="card empty" style={{ marginTop: 24 }}>
        <I.Globe size={28}/>
        <div className="e-title">Coming soon</div>
        <div className="e-sub">The localization workflow is being reworked and will land in a future update.</div>
      </div>
    </div>
  )
}
