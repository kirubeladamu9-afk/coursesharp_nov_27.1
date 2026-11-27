import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC, useState } from 'react'
import { StyledButton } from '@/components/styled-button'
import { data as mentorData } from '@/components/home/mentors.data'
import { data as testimonialData } from '@/components/home/testimonial.data'
import { navigateTo } from '@/lib/navigation'

const stats = [
  { value: '20+', label: 'Courses', description: 'Practical subjects for growing skills.' },
  { value: '500+', label: 'Learners', description: 'Students learning and making progress.' },
  { value: '10+', label: 'Instructors', description: 'Experienced tutors ready to help.' },
]

const offers = [
  { title: 'Expert-Led Courses', description: 'Learn from experienced instructors who bring practical knowledge into every lesson.', icon: <MenuBookOutlinedIcon /> },
  { title: 'Flexible Learning', description: 'Study anytime, anywhere, and learn at a pace that works for you.', icon: <ScheduleOutlinedIcon /> },
  { title: 'Hands-On Projects', description: 'Apply new skills with practical projects, quizzes, and exercises.', icon: <TerminalOutlinedIcon /> },
  { title: 'Verified Certificates', description: 'Showcase your achievements with course completion certificates.', icon: <WorkspacePremiumOutlinedIcon /> },
  { title: 'Learning Community', description: 'Connect with learners and tutors as you build skills together.', icon: <GroupsOutlinedIcon /> },
  { title: 'Progress Tracking', description: 'Keep track of your learning and celebrate each milestone.', icon: <InsightsOutlinedIcon /> },
]

const storyContent = {
  'Our Story': 'CourseSharp was founded with a simple idea: make learning easier, more engaging, and focused on practical progress. Today, learners can explore clear courses, get tutor support, and build useful skills in one place.',
  Mission: 'Our mission is to make quality learning accessible, supportive, and practical for students wherever they are.',
  Vision: 'We envision a welcoming learning community where every student can discover their potential and move toward their goals with confidence.',
}

const gallery = [
  { src: '/images/about-students-collaborating.webp', alt: 'Students collaborating around a laptop' },
  { src: '/images/about-ai-classroom.webp', alt: 'Students learning together in a computer classroom' },
  { src: '/images/about-young-learners.webp', alt: 'Young learners exploring a laptop together' },
  { src: '/images/about-study-group-banner.webp', alt: 'A study group sharing ideas around a laptop' },
]

const AboutUsSection: FC = () => {
  const [storyTab, setStoryTab] = useState<keyof typeof storyContent>('Our Story')

  return <Box id="about-us-section" component="section" aria-label="About CourseSharp" sx={{ color: 'text.primary' }}>
    <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 8 } }}>
      <Box component="img" src="/images/about-study-group-banner.webp" alt="Students studying together around a laptop" sx={{ display: 'block', width: '100%', height: { xs: 210, sm: 300, md: 390 }, objectFit: 'cover', borderRadius: { xs: 3, md: 4 }, mb: { xs: 4, md: 5 } }} />
      <Grid container spacing={2} sx={{ mb: { xs: 7, md: 10 } }}>
        {stats.map((stat) => <Grid item xs={12} sm={4} key={stat.label}><Box sx={{ p: { xs: 2, sm: 2.5 }, textAlign: 'center' }}><Typography sx={{ color: 'primary.main', fontSize: { xs: 30, md: 38 }, lineHeight: 1, fontWeight: 800, letterSpacing: '-.04em' }}>{stat.value}</Typography><Typography sx={{ mt: 1, fontSize: 15, fontWeight: 700 }}>{stat.label}</Typography><Typography variant="caption" color="text.secondary">{stat.description}</Typography></Box></Grid>)}
      </Grid>

      <Grid container spacing={{ xs: 4, md: 7 }} alignItems="center" sx={{ mb: { xs: 8, md: 11 } }}>
        <Grid item xs={12} md={5}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>WHO WE ARE</Typography>
          <Typography component="h2" sx={{ mt: .5, fontSize: { xs: 29, md: 36 }, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-.04em' }}>Empowering learners to build skills for the future</Typography>
          <Stack direction="row" spacing={.75} sx={{ mt: 2.5, mb: 2 }} role="tablist" aria-label="About CourseSharp">
            {(Object.keys(storyContent) as Array<keyof typeof storyContent>).map((tab) => <Button key={tab} role="tab" aria-selected={storyTab === tab} size="small" onClick={() => setStoryTab(tab)} sx={{ minWidth: 0, px: 1.5, borderRadius: 5, textTransform: 'none', color: storyTab === tab ? 'primary.contrastText' : 'text.secondary', backgroundColor: storyTab === tab ? 'primary.main' : 'transparent', '&:hover': { backgroundColor: storyTab === tab ? 'primary.dark' : 'action.hover' } }}>{tab}</Button>)}
          </Stack>
          <Typography role="tabpanel" sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.8 }}>{storyContent[storyTab]}</Typography>
        </Grid>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridTemplateRows: { xs: '120px 120px', sm: '155px 155px' }, gap: 1.25 }}>
            {gallery.map((image, index) => <Box key={image.src} component="img" src={image.src} alt={image.alt} sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2.5, gridRow: index === 0 || index === 3 ? 'span 1' : 'span 1' }} />)}
          </Box>
        </Grid>
      </Grid>
    </Container>

    <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 9 } }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 700, mx: 'auto', mb: { xs: 4, md: 5 }, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>LEARN WITH PURPOSE</Typography>
          <Typography component="h2" sx={{ mt: .5, fontSize: { xs: 28, md: 36 }, fontWeight: 800, letterSpacing: '-.035em' }}>What We Offer</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14, lineHeight: 1.7 }}>Discover a platform built to make learning simple, interactive, and effective—with flexible schedules, expert-led lessons, and practical ways to apply new skills.</Typography>
        </Box>
        <Grid container spacing={2}>
          {offers.map((offer) => (
            <Grid key={offer.title} item xs={12} sm={6} md={4}>
              <Card elevation={0} sx={{ height: '100%', border: 1, borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2.5, md: 3 } } }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center', color: 'primary.main', bgcolor: 'rgba(18,124,113,.08)', mb: 2 }}>{offer.icon}</Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 750 }}>{offer.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: .75, fontSize: 13, lineHeight: 1.65 }}>{offer.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}><Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>OUR TEAM</Typography><Typography component="h2" sx={{ mt: .5, fontSize: { xs: 28, md: 36 }, fontWeight: 800, letterSpacing: '-.035em' }}>The Minds Behind CourseSharp</Typography><Typography color="text.secondary" sx={{ mt: 1, fontSize: 14 }}>A team of experienced tutors helping learners move forward.</Typography></Box>
      <Grid container spacing={2.5}>
        {mentorData.slice(0, 3).map((mentor) => <Grid item xs={12} sm={4} key={mentor.id}><Card elevation={0} sx={{ overflow: 'hidden', borderRadius: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}><Box component="img" src={mentor.photo} alt={mentor.name} sx={{ display: 'block', width: '100%', height: { xs: 280, sm: 240, md: 285 }, objectFit: 'cover' }} /><Box sx={{ p: 2 }}><Typography sx={{ fontWeight: 750 }}>{mentor.name}</Typography><Typography variant="body2" color="text.secondary">{mentor.category}</Typography></Box></Card></Grid>)}
      </Grid>
    </Container>

    <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center', mb: 4 }}><Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>TESTIMONIALS</Typography><Typography component="h2" sx={{ mt: .5, fontSize: { xs: 28, md: 36 }, fontWeight: 800, letterSpacing: '-.035em' }}>What Our Learners Say</Typography><Typography color="text.secondary" sx={{ mt: 1, fontSize: 14 }}>Learners build skills with expert-led lessons and practical support.</Typography></Box>
        <Grid container spacing={2}>
          {testimonialData.slice(0, 3).map((testimonial) => <Grid item xs={12} md={4} key={testimonial.id}><Paper elevation={0} sx={{ height: '100%', p: 2.5, borderRadius: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}><AutoAwesomeOutlinedIcon sx={{ color: 'primary.main', fontSize: 20, mb: 1 }} /><Typography sx={{ fontWeight: 700, fontSize: 14 }}>{testimonial.title}</Typography><Typography color="text.secondary" sx={{ mt: 1, fontSize: 13, lineHeight: 1.7 }}>{testimonial.content}</Typography><Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}><Box component="img" src={`/images/avatars/${testimonial.user.photo}`} alt="" sx={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} /><Box><Typography sx={{ fontSize: 12, fontWeight: 700 }}>{testimonial.user.name}</Typography><Typography color="text.secondary" sx={{ fontSize: 11 }}>{testimonial.user.professional}</Typography></Box></Stack></Paper></Grid>)}
        </Grid>
      </Container>
    </Box>

    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
      <Paper elevation={0} sx={{ p: { xs: 4, md: 7 }, borderRadius: 4, textAlign: 'center', bgcolor: 'primary.light', background: (theme) => `radial-gradient(ellipse at bottom, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 90%)` }}>
        <Typography component="h2" sx={{ fontSize: { xs: 26, md: 36 }, fontWeight: 800, letterSpacing: '-.04em' }}>Start Your Learning Journey Today</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14, lineHeight: 1.7 }}>Gain new skills, explore new interests, and work toward your goals.</Typography>
        <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mt: 3 }}><StyledButton animated onClick={() => navigateTo('/courses')}>Browse Courses</StyledButton><StyledButton animated variant="outlined" onClick={() => navigateTo('/sign-in')}>Get Started</StyledButton></Stack>
      </Paper>
    </Container>
  </Box>
}

export default AboutUsSection
