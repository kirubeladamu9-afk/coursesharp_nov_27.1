import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
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

  return <Box sx={{ minHeight: '100vh', bgcolor: '#F4F7F6' }}>
    <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
    <Box component="main" sx={{ maxWidth: 1120, minHeight: '65vh', mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigateTo('/cart')} sx={{ mb: 2, px: 0, color: '#127C71', textTransform: 'none', fontWeight: 600 }}>Back to cart</Button>
      <Typography component="h1" sx={{ mb: 3, fontSize: { xs: 28, md: 34 }, fontWeight: 800, letterSpacing: '-0.02em', color: '#17172B' }}>Checkout</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && !leadCourse && <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress aria-label="Loading checkout" /></Box>}
      {leadCourse && <EnrollmentModal variant="page" course={{ id: Number(leadCourse.id), title: leadCourse.title, price: leadCourse.price }} initialItems={initialItems} open onSubmitted={() => { void saveCourseCartIds([]) }} />}
    </Box>
    <Footer />
  </Box>
}

export default CheckoutPage
