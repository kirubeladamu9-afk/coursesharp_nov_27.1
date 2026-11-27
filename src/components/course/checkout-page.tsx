import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import EnrollmentModal from '@/components/course/enrollment-modal'
import { getCourseCartIds, getCourses, loadCourseCartIds, saveCourseCartIds, type EnrollmentOrderTarget } from '@/services/api'
import { navigateTo } from '@/lib/navigation'
import { type Course } from '@/interfaces/course'

interface Props {
  darkMode: boolean
  onToggleDarkMode: () => void
}

const CheckoutSkeleton: React.FC = () => <div role="status" aria-label="Loading checkout" className="grid gap-8 md:grid-cols-[minmax(0,1fr)_360px]">
  <div className="animate-pulse space-y-6">
    <div className="mx-auto flex max-w-md items-center justify-between gap-4">
      {[0, 1, 2].map((item) => <div key={item} className="flex flex-1 flex-col items-center gap-2">
        <div className="size-8 rounded-full bg-slate-200" />
        <div className="h-3 w-16 rounded bg-slate-200" />
      </div>)}
    </div>
    <div className="space-y-4">
      <div className="h-14 rounded-2xl bg-slate-200" />
      <div className="h-14 rounded-2xl bg-slate-200" />
      <div className="h-14 rounded-2xl bg-slate-200" />
      <div className="h-14 rounded-2xl bg-teal-100" />
    </div>
  </div>
  <div className="animate-pulse space-y-5 rounded-xl bg-[#F6F8F8] p-6">
    <div className="h-6 w-40 rounded bg-slate-200" />
    <div className="space-y-3 border-b border-[#d9e2df] pb-5">
      <div className="h-4 w-full rounded bg-slate-200" />
      <div className="h-4 w-2/3 rounded bg-slate-200" />
    </div>
    <div className="flex items-center justify-between">
      <div className="h-5 w-20 rounded bg-slate-200" />
      <div className="h-7 w-24 rounded bg-slate-200" />
    </div>
  </div>
</div>

const CheckoutPage: React.FC<Props> = ({ darkMode, onToggleDarkMode }) => {
  const [cartCourses, setCartCourses] = useState<Course[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getCourses(), loadCourseCartIds().catch(() => getCourseCartIds())])
      .then(([catalog, ids]) => {
        if (!active) return
        const courses = ids.flatMap((id) => {
          const course = catalog.find((item) => Number(item.id) === id)
          return course ? [course] : []
        })
        if (courses.length === 0) navigateTo('/cart', true)
        else setCartCourses(courses)
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Your order could not be loaded.')
      })
    return () => { active = false }
  }, [])

  const initialItems = useMemo(() => (cartCourses ?? []).map((course) => ({ target: { courseId: Number(course.id) } as EnrollmentOrderTarget, title: course.title })), [cartCourses])
  const leadCourse = cartCourses?.[0]

  return <div className="min-h-screen bg-white">
    <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
    <main className="mx-auto min-h-[65vh] max-w-[1120px] px-4 py-6 sm:px-6 md:px-8 md:py-10">
      <button type="button" onClick={() => navigateTo('/cart')} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#127C71] hover:text-[#0D6A69] hover:underline">
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        Back to cart
      </button>
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#17172B] md:text-4xl">Checkout</h1>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!error && !leadCourse && <CheckoutSkeleton />}
      {leadCourse && <EnrollmentModal variant="page" course={{ id: Number(leadCourse.id), title: leadCourse.title, price: leadCourse.price }} initialItems={initialItems} open onSubmitted={() => { void saveCourseCartIds([]) }} />}
    </main>
    <Footer />
  </div>
}

export default CheckoutPage
