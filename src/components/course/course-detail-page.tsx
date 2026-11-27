import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { StyledButton } from '@/components/styled-button'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined'
import { type FC, useEffect, useState } from 'react'
import { type AdminCourse, type AdminLesson } from '@/components/admin/admin-data'
import EnrollmentModal from '@/components/course/enrollment-modal'
import CourseReviews from '@/components/course/course-reviews'
import Footer from '@/components/footer/footer'
import { getAuthenticatedUser, getAdminCourse, getCourse as getCourseFromApi } from '@/services/api'
import { navigateTo } from '@/lib/navigation'

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.max(1, Math.round(seconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours ? `${hours}h${minutes ? ` ${minutes}m` : ''}` : `${minutes}m`
}

const getLessonLabel = (lesson: AdminLesson) => {
  if (lesson.type === 'video') return lesson.duration ? formatDuration(lesson.duration) : 'Video'
  if (lesson.type === 'article') return 'Article'
  if (lesson.type === 'interactive') return 'Interactive'
  if (lesson.type === 'simulation') return 'Simulation'
  if (lesson.type === 'quiz') return 'Quiz'
  if (lesson.type === 'practice') return 'Practice'
  if (lesson.type === 'stepByStepSolver') return 'Step-by-Step Solver'
  return 'Live'
}

const LessonTypeIcon: FC<{ type: AdminLesson['type'] }> = ({ type }) => {
  if (type === 'article') return <MenuBookOutlinedIcon fontSize="small" />
  if (type === 'stepByStepSolver') return <FormatListNumberedOutlinedIcon fontSize="small" />
  return <PlayCircleOutlineIcon fontSize="small" />
}

const CourseDetailPage: FC<{ courseId: string }> = ({ courseId }) => {
  const [course, setCourse] = useState<AdminCourse | null>(null)
  const [expandedModules, setExpandedModules] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false)
  const isAdmin = getAuthenticatedUser()?.role === 'admin'

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    const loadCourse = isAdmin ? getAdminCourse(Number(courseId)) : getCourseFromApi(courseId)
    loadCourse.then((nextCourse) => {
      if (!isCurrent) return
      setCourse(nextCourse)
      setExpandedModules(nextCourse.modules.length ? [nextCourse.modules[0].id] : [])
    }).catch(() => {
      if (isCurrent) setCourse(null)
    }).finally(() => {
      if (isCurrent) setIsLoading(false)
    })
    return () => { isCurrent = false }
  }, [courseId, isAdmin])

  if (isLoading && !course) return <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}><Typography variant="h4">Loading course...</Typography></Container>
  if (!course) return <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}><Typography variant="h4" sx={{ mb: 1 }}>Course not found</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>This course may have been removed or is not available yet.</Typography><Button variant="contained" onClick={() => navigateTo('/')}>Back to courses</Button></Container>

  const lessons = course.modules.flatMap((module) => module.lessons)
  const totalDurationSeconds = lessons.reduce((total, lesson) => total + (lesson.duration ?? lesson.estimatedDuration ?? 0), 0)
  const firstVideo = lessons.find((lesson) => lesson.type === 'video' && lesson.videoUrl)
  const allExpanded = course.modules.length > 0 && expandedModules.length === course.modules.length
  const toggleExpandAll = () => setExpandedModules(allExpanded ? [] : course.modules.map((module) => module.id))
  const toggleModule = (moduleId: number) => setExpandedModules((current) => current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId])

  return <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f6fa', color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.primary : '#10131c' }}>
    <Container maxWidth={false} sx={{ maxWidth: '1040px', pt: { xs: 4, md: 7 }, pb: { xs: 7, md: 11 } }}>
      <Button onClick={() => navigateTo('/')} startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />} sx={{ mb: { xs: 3, md: 5 }, px: 0, color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#69707d', textTransform: 'none', fontSize: 13 }}>Back</Button>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 350px' }, gap: { xs: 4, md: 6 }, alignItems: 'start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ display: 'inline-block', px: 1.25, py: 0.5, mb: 2, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff', color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#737887', fontSize: 11, fontWeight: 600 }}><Box component="span" sx={{ color: 'primary.main', mr: 0.6 }}>◈</Box> Course Details</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1.15, letterSpacing: '-0.04em', fontWeight: 700, mb: 2 }}>{course.title}</Typography>
          <Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#69707d', fontSize: 15, lineHeight: 1.65, mb: 3 }}>{course.description}</Typography>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 13 }}>{course.tutor.charAt(0)}</Avatar><Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.primary : '#555d6a', fontSize: 13 }}>{course.tutor}</Typography></Stack>
            <Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#737887', fontSize: 13 }}>◢ &nbsp;{course.level}</Typography>
          </Stack>
          <Box sx={{ overflow: 'hidden', borderRadius: '16px', aspectRatio: '1.72', bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.action.hover : '#e6e7ee' }}>
            {firstVideo?.videoUrl ? <Box component="video" controls preload="metadata" src={firstVideo.videoUrl} poster={firstVideo.thumbnailUrl || course.cover} sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}>Your browser does not support video playback.</Box> : <Box component="img" src={course.cover} alt={course.title} sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />}
          </Box>

          <Stack spacing={5} sx={{ mt: 5 }}>
            <Box><Typography component="h2" sx={{ fontSize: 23, fontWeight: 700, mb: 2, letterSpacing: '-0.02em' }}>Overview</Typography><Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#69707d', fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{course.longDescription || course.description}</Typography></Box>
            <Box id="course-content" sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff', borderRadius: '16px', p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1} sx={{ mb: 2 }}><Typography component="h2" sx={{ fontSize: 22, fontWeight: 700 }}>Course Content</Typography><Button size="small" onClick={toggleExpandAll} sx={{ color: 'primary.main', textTransform: 'none', fontSize: 12 }}>{allExpanded ? 'Collapse all' : 'Expand all'}</Button></Stack>
              <Stack spacing={1}>{course.modules.map((module) => <Accordion key={module.id} expanded={expandedModules.includes(module.id)} onChange={() => toggleModule(module.id)} disableGutters elevation={0} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : '#f5f6f9', borderRadius: '10px !important', overflow: 'hidden', '&::before': { display: 'none' }, '&.Mui-expanded': { my: 0 } }}><AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} aria-controls={`module-${module.id}-content`} id={`module-${module.id}-header`} sx={{ minHeight: 50, '&.Mui-expanded': { minHeight: 50 }, '& .MuiAccordionSummary-content': { my: 1.5 } }}><Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 1, pr: 1 }}><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{module.title}</Typography><Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#858b96', fontSize: 11, whiteSpace: 'nowrap' }}>{module.lessons.length} lessons · {formatDuration(module.lessons.reduce((total, lesson) => total + (lesson.duration ?? lesson.estimatedDuration ?? 0), 0))}</Typography></Box></AccordionSummary><AccordionDetails sx={{ p: 1, pt: 0 }}><Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff', borderRadius: 2, px: 1.5 }}>{module.lessons.map((lesson) => <Box key={lesson.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.25 }}><Box sx={{ display: 'flex', color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#9297a2', '& svg': { fontSize: 17 } }}><LessonTypeIcon type={lesson.type} /></Box><Typography sx={{ flexGrow: 1, fontSize: 12, color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.primary : '#525866' }}>{lesson.title}</Typography><Typography sx={{ fontSize: 11, color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#9297a2' }}>{getLessonLabel(lesson)}</Typography></Box>)}</Stack></AccordionDetails></Accordion>)}</Stack>
            </Box>
            {(course.learningOutcomes.length > 0 || course.requirements.length > 0) && <Box><Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>What you'll learn</Typography><Stack spacing={1}>{course.learningOutcomes.map((outcome) => <Typography key={outcome} sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#69707d', fontSize: 14, lineHeight: 1.6 }}><Box component="span" sx={{ color: 'primary.main', mr: 1 }}>✓</Box>{outcome}</Typography>)}</Stack>{course.requirements.length > 0 && <><Typography component="h3" sx={{ fontSize: 18, fontWeight: 700, mt: 3, mb: 1.5 }}>Requirements</Typography><Stack spacing={1}>{course.requirements.map((requirement) => <Typography key={requirement} sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#69707d', fontSize: 14, lineHeight: 1.6 }}><Box component="span" sx={{ color: 'primary.main', mr: 1 }}>✓</Box>{requirement}</Typography>)}</Stack></>}</Box>}
            <Box><Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>About The Instructor</Typography><Stack direction="row" alignItems="center" spacing={2} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff', borderRadius: '16px', p: 2.5 }}><Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 26 }}>{course.tutor.charAt(0)}</Avatar><Box><Typography sx={{ fontSize: 16, fontWeight: 700 }}>{course.tutor}</Typography><Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#858b96', fontSize: 13, mt: 0.5 }}>Course instructor</Typography><Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#69707d', fontSize: 12, mt: 1 }}>{course.students.toLocaleString()} {course.students === 1 ? 'learner' : 'learners'} · {course.category}</Typography></Box></Stack></Box>
            <CourseReviews courseId={course.id} rating={course.rating} ratingCount={course.ratingCount} />
          </Stack>
        </Box>
        <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff', borderRadius: '20px', p: 3, boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 24px 55px rgba(0, 0, 0, 0.22)' : '0 24px 55px rgba(32, 37, 59, 0.07)', position: { md: 'sticky' }, top: { md: 24 } }}>
          <Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#858b96', fontSize: 12, mb: 0.5 }}>Course Pricing</Typography>
          <Typography sx={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', mb: 3 }}>${course.price}</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>This Course includes:</Typography>
          <Stack spacing={1.5} sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#737b88', '& svg': { fontSize: 17 } }}>
            <Stack direction="row" spacing={1} alignItems="center"><MenuBookOutlinedIcon /><Typography sx={{ fontSize: 13 }}>{lessons.length} Lessons</Typography></Stack>
            {totalDurationSeconds > 0 && <Stack direction="row" spacing={1} alignItems="center"><AccessTimeOutlinedIcon /><Typography sx={{ fontSize: 13 }}>{formatDuration(totalDurationSeconds)}</Typography></Stack>}
            <Stack direction="row" spacing={1} alignItems="center"><PeopleOutlineIcon /><Typography sx={{ fontSize: 13 }}>{course.students.toLocaleString()} {course.students === 1 ? 'learner' : 'learners'}</Typography></Stack>
            <Stack direction="row" spacing={1} alignItems="center"><WorkspacePremiumOutlinedIcon /><Typography sx={{ fontSize: 13 }}>{course.certificate ? 'Certificate of completion' : 'No certificate included'}</Typography></Stack>
            <Stack direction="row" spacing={1} alignItems="center"><SchoolOutlinedIcon /><Typography sx={{ fontSize: 13 }}>Lifetime access</Typography></Stack>
          </Stack>
          <Box sx={{ mt: 3, width: '100%', '& > button': { width: '100%', justifyContent: 'space-between' } }}><StyledButton animated size="large" onClick={() => setIsEnrollmentOpen(true)}>Enroll Now</StyledButton></Box>
        </Box>
      </Box>
    </Container>
    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : '#fff', py: { xs: 6, md: 10 }, px: 3 }}><Box sx={{ maxWidth: 1140, mx: 'auto', px: 3, py: { xs: 6, md: 9 }, borderRadius: '26px', textAlign: 'center', background: (theme) => `radial-gradient(ellipse at bottom, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 75%)` }}><Typography component="h2" sx={{ fontSize: { xs: 28, md: 38 }, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.2 }}>Start Your Learning Journey Today</Typography><Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? theme.palette.text.secondary : '#696d80', fontSize: 14, lineHeight: 1.6, mt: 1.5 }}>Gain new skills, explore creative fields, and achieve<br /> your career goals — all in one platform.</Typography><Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mt: 3 }}><StyledButton animated onClick={() => navigateTo('/')}>Browse Courses</StyledButton><StyledButton animated onClick={() => setIsEnrollmentOpen(true)}>Get Started</StyledButton></Stack></Box></Box>
    <EnrollmentModal course={course} open={isEnrollmentOpen} onClose={() => setIsEnrollmentOpen(false)} />
    <Footer />
  </Box>
}

export default CourseDetailPage
