import { FC } from 'react'
import { getAuthenticatedUser } from '@/services/api'

interface Props {
  name?: string
  onDashboard: () => void
  onSignOut: () => void
  dashboardLabel: string
}

const UserMenu: FC<Props> = ({ name, onDashboard, onSignOut, dashboardLabel }) => {
  const email = (getAuthenticatedUser() as { email?: string } | null)?.email
  const initial = name?.trim().charAt(0).toUpperCase() || 'U'
  const itemClass = 'block w-full cursor-pointer border-0 bg-transparent px-5 py-3 text-left text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-hover)] hover:text-[#127C71]'

  return (
    <div className="group relative">
      <button type="button" aria-label="Open account menu" onClick={onDashboard} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-slate-900 text-sm font-bold text-white transition hover:ring-4 hover:ring-[#127C71]/20">{initial}</button>
      <div className="invisible absolute right-0 top-full z-50 w-72 translate-y-2 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[var(--app-border)] p-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#127C71] text-xl font-bold text-white">{initial}</span>
            <div className="min-w-0">
              <p className="m-0 truncate font-bold text-[var(--app-text)]">{name}</p>
              {email && <p className="m-0 truncate text-xs text-[var(--app-text-muted)]">{email}</p>}
            </div>
          </div>
          <div className="py-2">
            <button type="button" className={itemClass} onClick={onDashboard}>{dashboardLabel}</button>
          </div>
          <div className="border-t border-[var(--app-border)] py-2">
            <button type="button" className={itemClass} onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserMenu
