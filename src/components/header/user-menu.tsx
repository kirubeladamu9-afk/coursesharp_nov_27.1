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
  const itemClass = 'block w-full cursor-pointer border-0 bg-transparent px-5 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-violet-600 dark:text-slate-200 dark:hover:bg-slate-800'

  return (
    <div className="group relative">
      <button type="button" aria-label="Open account menu" onClick={onDashboard} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-slate-900 text-sm font-bold text-white transition hover:ring-4 hover:ring-violet-500/20">{initial}</button>
      <div className="invisible absolute right-0 top-full z-50 w-72 translate-y-2 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">{initial}</span>
            <div className="min-w-0">
              <p className="m-0 truncate font-bold text-slate-900 dark:text-white">{name}</p>
              {email && <p className="m-0 truncate text-xs text-slate-500">{email}</p>}
            </div>
          </div>
          <div className="py-2">
            <button type="button" className={itemClass} onClick={onDashboard}>{dashboardLabel}</button>
          </div>
          <div className="border-t border-slate-100 py-2 dark:border-slate-800">
            <button type="button" className={itemClass} onClick={onSignOut}>Sign out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserMenu
