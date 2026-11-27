import { FC, useEffect, useState } from 'react'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { getCourseCartIds, getCourses } from '@/services/api'
import { navigateTo } from '@/lib/navigation'
import { type Course } from '@/interfaces/course'

const CartDropdown: FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const [ids, setIds] = useState(() => getCourseCartIds())
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const update = () => setIds(getCourseCartIds())
    window.addEventListener('course-cart-change', update)
    return () => window.removeEventListener('course-cart-change', update)
  }, [])

  useEffect(() => {
    if (ids.length && !courses.length) getCourses().then(setCourses).catch(() => undefined)
  }, [ids.length, courses.length])

  const items = ids.flatMap((id) => courses.find((course) => Number(course.id) === id) ?? [])
  const total = items.reduce((sum, course) => sum + course.price, 0)
  const go = () => { onNavigate?.(); navigateTo('/cart') }

  return (
    <div className="group relative">
      <button type="button" aria-label={`Shopping cart, ${ids.length} items`} onClick={go} className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[var(--mui-palette-primary-main,#127C71)] transition hover:bg-slate-500/10 [[data-theme=dark]_&]:text-white">
        <ShoppingCartOutlinedIcon />
        {ids.length > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#127C71] px-1 text-[11px] font-bold text-white">{ids.length}</span>}
      </button>
      <div className="invisible absolute right-0 top-full z-50 w-80 translate-y-2 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] shadow-2xl">
          {ids.length === 0 ? (
            <div className="p-6 text-center">
              <p className="m-0 text-sm text-[var(--app-text-muted)]">Your cart is empty.</p>
              <button type="button" onClick={() => { onNavigate?.(); navigateTo('/courses') }} className="mt-3 cursor-pointer border-0 bg-transparent text-sm font-bold text-[#127C71] [[data-theme=dark]_&]:text-[#9FF1D2]">Keep shopping</button>
            </div>
          ) : (
            <>
              <ul className="m-0 max-h-80 list-none divide-y divide-[var(--app-border)] overflow-y-auto p-0">
                {items.map((course) => (
                  <li key={course.id} className="flex gap-3 p-4">
                    <img src={course.cover} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="m-0 line-clamp-2 text-sm font-bold leading-snug">{course.title}</p>
                      <p className="m-0 mt-0.5 truncate text-xs text-[var(--app-text-muted)]">{course.category}</p>
                      <p className="m-0 mt-1 text-sm font-extrabold">${course.price.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[var(--app-border)] p-4">
                <div className="mb-3 space-y-1">
                  <p className="m-0 flex justify-between text-sm text-[var(--app-text-muted)]"><span>Subtotal</span><span>${total.toFixed(2)}</span></p>
                  <p className="m-0 flex justify-between text-base font-bold"><span>Total</span><span>${total.toFixed(2)}</span></p>
                </div>
                <button type="button" onClick={go} className="w-full cursor-pointer rounded-xl border-0 bg-[#127C71] py-3 text-sm font-bold text-white transition hover:bg-[#0D6A69]">Go to cart</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartDropdown
