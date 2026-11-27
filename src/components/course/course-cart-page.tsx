import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import EnrollmentModal from '@/components/course/enrollment-modal'
import { getAuthenticatedUser, getCourseCartIds, getCourses, getMyEnrollments, getMyPayments, loadCourseCartIds, saveCourseCartIds, type EnrollmentOrderTarget } from '@/services/api'
import { navigateTo } from '@/lib/navigation'
import { type Course } from '@/interfaces/course'

interface Props {
  darkMode: boolean
  onToggleDarkMode: () => void
}

const CourseCartPage: React.FC<Props> = ({ darkMode, onToggleDarkMode }) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [cartIds, setCartIds] = useState<number[]>(getCourseCartIds())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [blockedCourseIds, setBlockedCourseIds] = useState<number[]>([])
  const [checkingAccess, setCheckingAccess] = useState(Boolean(getAuthenticatedUser()))

  useEffect(() => {
    let active = true
    Promise.all([getCourses(), loadCourseCartIds()]).then(([catalog, ids]) => {
      if (!active) return
      setCourses(catalog)
      setCartIds(ids)
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Your cart could not be loaded.')
    }).finally(() => { if (active) setIsLoading(false) })
    const onCartChange = () => setCartIds(getCourseCartIds())
    window.addEventListener('course-cart-change', onCartChange)
    return () => { active = false; window.removeEventListener('course-cart-change', onCartChange) }
  }, [])

  useEffect(() => {
    if (getAuthenticatedUser()?.role !== 'student') return
    let active = true
    Promise.all([getMyEnrollments(), getMyPayments()]).then(([enrollments, payments]) => {
      if (!active) return
      const enrolled = enrollments.filter((entry) => entry.courseId !== null && entry.classId === null).map((entry) => entry.courseId!)
      const pending = payments.flatMap((payment) => payment.status === 'Pending Verification' ? [payment.courseId, ...(payment.items ?? []).filter((item) => !item.removed).map((item) => item.courseId)] : []).filter((id): id is number => id !== null)
      setBlockedCourseIds([...new Set([...enrolled, ...pending])])
    }).catch(() => undefined).finally(() => { if (active) setCheckingAccess(false) })
    return () => { active = false }
  }, [])

  const cartCourses = useMemo(() => cartIds.flatMap((id) => {
    const course = courses.find((item) => Number(item.id) === id)
    return course ? [course] : []
  }), [cartIds, courses])
  const orderItems = useMemo(() => cartCourses.map((course) => ({ target: { courseId: Number(course.id) } as EnrollmentOrderTarget, title: course.title })), [cartCourses])
  const total = cartCourses.reduce((sum, course) => sum + course.price, 0)
  const blockedCount = cartIds.filter((id) => blockedCourseIds.includes(id)).length
  const unavailableCount = cartIds.length - cartCourses.length
  const modalCourse = cartCourses[0]

  const removeCourse = (id: number) => {
    const next = cartIds.filter((courseId) => courseId !== id)
    setCartIds(next)
    void saveCourseCartIds(next).catch((reason) => setError(reason instanceof Error ? reason.message : 'Your cart could not be updated.'))
  }

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
    <main className="mx-auto min-h-[65vh] max-w-6xl px-4 py-10 md:py-14">
      <h1 className="m-0 text-3xl font-extrabold tracking-tight md:text-4xl">Shopping Cart</h1>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {isLoading ? <p className="mt-6 text-slate-500">Loading your cart…</p> : cartCourses.length === 0 ? <div className="mt-8 rounded-3xl border border-slate-200 p-10 text-center dark:border-slate-700">
        <p className="m-0 text-lg font-bold">Your cart is empty</p>
        <p className="mb-5 mt-1 text-slate-500">Explore the catalog and add a course when you find the right fit.</p>
        <button type="button" onClick={() => navigateTo('/courses')} className="cursor-pointer rounded-xl border-0 bg-[#127C71] px-6 py-3 font-bold text-white transition hover:bg-[#0D6A69]">Explore courses</button>
      </div> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <p className="m-0 mb-3 text-sm font-bold">{cartCourses.length} {cartCourses.length === 1 ? 'Course' : 'Courses'} in Cart</p>
          {unavailableCount > 0 && <Alert severity="warning" sx={{ mb: 2 }}>{unavailableCount} cart {unavailableCount === 1 ? 'course is' : 'courses are'} no longer available. Remove it before checkout.</Alert>}
          <ul className="m-0 list-none divide-y divide-slate-200 border-y border-slate-200 p-0 dark:divide-slate-700 dark:border-slate-700">
            {cartCourses.map((course) => <li key={course.id} className="flex gap-4 py-5">
              <img src={course.cover} alt="" className="h-20 w-32 shrink-0 rounded-xl object-cover shadow-sm sm:h-24 sm:w-40" />
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-base font-bold leading-snug">{course.title}</h2>
                <p className="m-0 mt-1 text-xs text-slate-500">{course.category}{course.level ? ` · ${course.level}` : ''}</p>
                <p className="m-0 mt-1 text-xs"><span className="font-bold text-amber-600">{course.rating.toFixed(1)}</span> <span className="text-amber-500">★</span> <span className="text-slate-500">({course.ratingCount.toLocaleString()} ratings)</span></p>
                {blockedCourseIds.includes(Number(course.id)) && <p className="m-0 mt-2 text-xs font-semibold text-amber-600">Already enrolled or awaiting payment review</p>}
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="text-lg font-extrabold text-[#127C71] dark:text-[#9FF1D2]">${course.price.toFixed(2)}</span>
                <button type="button" aria-label={`Remove ${course.title} from cart`} onClick={() => removeCourse(Number(course.id))} className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-[#127C71] hover:underline">Remove</button>
              </div>
            </li>)}
          </ul>
        </section>
        <aside className="h-fit rounded-3xl border border-slate-200 p-6 shadow-sm lg:sticky lg:top-6 dark:border-slate-700">
          <p className="m-0 text-sm font-bold text-slate-500">Total:</p>
          <p className="m-0 mt-1 text-4xl font-extrabold tracking-tight">${total.toFixed(2)}</p>
          {blockedCount > 0 && <Alert severity="warning" sx={{ mt: 2 }}>Remove courses you already have or that are awaiting payment verification before checkout.</Alert>}
          <button type="button" disabled={checkingAccess || blockedCount > 0 || unavailableCount > 0 || !cartCourses.length} onClick={() => setIsCheckoutOpen(true)} className="mt-5 w-full cursor-pointer rounded-xl border-0 bg-[#127C71] py-3.5 text-base font-bold text-white transition hover:bg-[#0D6A69] disabled:cursor-not-allowed disabled:opacity-50">Proceed to Checkout →</button>
          <p className="m-0 mt-3 text-xs text-slate-500">You won't be charged yet</p>
        </aside>
      </div>}
    </main>
    <Footer />
    {modalCourse && <EnrollmentModal course={{ id: Number(modalCourse.id), title: modalCourse.title, price: modalCourse.price }} initialItems={orderItems} open={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSubmitted={() => { setIsCheckoutOpen(false); setCartIds([]); void saveCourseCartIds([]) }} />}
  </Box>
}

export default CourseCartPage
