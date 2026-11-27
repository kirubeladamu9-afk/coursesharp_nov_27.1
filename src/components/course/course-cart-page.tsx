import { useEffect, useMemo, useState } from 'react'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 }, minHeight: '65vh' }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <ShoppingCartOutlinedIcon color="primary" />
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>Your cart</Typography>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading ? <Typography color="text.secondary">Loading your cart…</Typography> : cartCourses.length === 0 ? <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Your cart is empty</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2.5 }}>Explore the catalog and add a course when you find the right fit.</Typography>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => navigateTo('/courses')}>Explore courses</Button>
      </Paper> : <Stack spacing={2}>
        {unavailableCount > 0 && <Alert severity="warning">{unavailableCount} cart {unavailableCount === 1 ? 'course is' : 'courses are'} no longer available. Remove it before checkout.</Alert>}
        {cartCourses.map((course) => <Paper key={course.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box component="img" src={course.cover} alt="" sx={{ width: { xs: 76, sm: 116 }, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 750 }}>{course.title}</Typography>
              <Typography variant="body2" color="text.secondary">{course.category}</Typography>
              {blockedCourseIds.includes(Number(course.id)) && <Typography variant="caption" color="warning.main">Already enrolled or awaiting payment review</Typography>}
            </Box>
            <Typography sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>${course.price.toFixed(2)}</Typography>
            <IconButton aria-label={`Remove ${course.title} from cart`} onClick={() => removeCourse(Number(course.id))}><DeleteOutlineIcon /></IconButton>
          </Stack>
        </Paper>)}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 750 }}>Total</Typography>
            <Typography variant="h5" sx={{ fontWeight: 850 }}>${total.toFixed(2)}</Typography>
          </Stack>
          {blockedCount > 0 && <Alert severity="warning" sx={{ mb: 2 }}>Remove courses you already have or that are awaiting payment verification before checkout.</Alert>}
          <Button fullWidth variant="contained" size="large" disabled={checkingAccess || blockedCount > 0 || unavailableCount > 0 || !cartCourses.length} onClick={() => setIsCheckoutOpen(true)}>Checkout</Button>
        </Paper>
      </Stack>}
    </Container>
    <Footer />
    {modalCourse && <EnrollmentModal course={{ id: Number(modalCourse.id), title: modalCourse.title, price: modalCourse.price }} initialItems={orderItems} open={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSubmitted={() => { setIsCheckoutOpen(false); setCartIds([]); void saveCourseCartIds([]) }} />}
  </Box>
}

export default CourseCartPage
