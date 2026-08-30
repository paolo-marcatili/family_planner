import { createPortal } from 'react-dom'
import type { Importance, Names, Owner, PlannerItem } from '../domain/types'
import { IMPORTANCES, OWNERS } from '../domain/constants'

type Props = {
  item: PlannerItem
  names: Names
  onOwner: (id: string, owner: Owner) => void
  onImportance: (id: string, importance: Importance) => void
  onToggle: (id: string) => void
  onEdit: (item: PlannerItem) => void
}

const ownerLabel = (owner: Owner, names: Names) => owner === 'Paolo' ? names.paolo : owner === 'Anna' ? names.anna : owner

export function QuickActionMenu({ item, names, onOwner, onImportance, onToggle, onEdit }: Props) {
  const anchor = document.querySelector<HTMLElement>(`[data-planner-item="${CSS.escape(item.id)}"]`)?.getBoundingClientRect()
  const top = anchor ? (anchor.bottom + 230 < window.innerHeight ? anchor.bottom + 6 : Math.max(8, anchor.top - 230)) : 80
  const left = anchor ? Math.max(8, Math.min(anchor.left, window.innerWidth - 220)) : 80
  return createPortal(
    <div className="quick-actions quick-actions-portal" style={{ top, left }} role="menu" aria-label={`Quick actions for ${item.title}`} onClick={(event) => event.stopPropagation()}>
      <span className="quick-label">Assign owner</span>
      {OWNERS.map((owner) => <button className={owner === item.owner ? 'selected' : ''} key={owner} onClick={() => onOwner(item.id, owner)}>{ownerLabel(owner, names)}</button>)}
      <span className="quick-label">Importance</span>
      {IMPORTANCES.map((importance) => <button className={importance === item.importance ? 'selected' : ''} key={importance} onClick={() => onImportance(item.id, importance)}>{importance}</button>)}
      {item.kind === 'task' && <button onClick={() => onToggle(item.id)}>{item.status === 'done' ? 'Reopen task' : 'Confirm done'}</button>}
      <button onClick={() => onEdit(item)}>Edit</button>
    </div>,
    document.body,
  )
}
