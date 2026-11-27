import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import Box from '@mui/material/Box'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState, type FC } from 'react'
import { StyledButton } from '@/components/styled-button'
import HomeOurMentors from '@/components/home/mentors'
import DotNetPillars from '@/components/home/dotnet-pillars'
import { navigateTo } from '@/lib/navigation'

const aboutPillars = {
  'Our Story': [
    'CourseSharp began with a simple idea: make learning easier, more engaging, and results-driven for every student.',
    'Today, we bring clear courses, supportive tutors, and flexible practice together to help learners build skills and confidence.',
  ],
  Mission: [
    'Our mission is to make practical, high-quality learning accessible to every learner, wherever they are.',
    'We create a supportive place to explore new subjects, practice skills, and make steady progress.',
  ],
  Vision: [
    'We envision a future where every learner can build the skills and confidence to pursue their goals.',
    'Learning should open doors, inspire curiosity, and help people shape the opportunities ahead of them.',
  ],
}
const faqCategories = {
  General: [
    { question: 'What is CourseSharp?', answer: 'CourseSharp is an online learning platform offering practical courses, tutor-led support, and practice to help learners build skills.' },
    { question: 'Who can learn with CourseSharp?', answer: 'Students can explore courses, practice new skills, and get support from experienced tutors.' },
    { question: 'How do I get started?', answer: 'Browse the course catalog, choose a course that fits your goals, and follow its enrollment steps.' },
    { question: 'Where can I see available courses?', answer: 'Visit the Courses page to browse the catalog, search topics, and compare course details.' },
  ],
  Platform: [
    { question: 'How do I find the right course?', answer: 'Browse the course catalog, compare course details, and use the available filters to find a course that fits your goals.' },
    { question: 'Can I search by subject or topic?', answer: 'Yes. Use the catalog search field to look for courses, topics, or skills.' },
    { question: 'How do I view course details?', answer: 'Select a course in the catalog to view its description, lessons, and other available information.' },
    { question: 'Can I browse different course types?', answer: 'Use the catalog filters to browse self-paced courses, live classes, and practice options.' },
  ],
  Features: [
    { question: 'Can I learn at my own pace?', answer: 'Yes. Explore self-paced courses and practice activities, or choose live classes when you want guided learning.' },
    { question: 'Are live classes available?', answer: 'Some courses include live classes. Check each course page for its learning format and schedule.' },
    { question: 'Can I practice what I learn?', answer: 'CourseSharp offers practice activities and exams to help learners apply their knowledge.' },
    { question: 'Can I track my learning?', answer: 'Your learning area shows your course enrollments and progress.' },
  ],
  Support: [
    { question: 'How can I get help with a course?', answer: 'Use the Contact Us page to send our support team a message, and we’ll help you with your question.' },
    { question: 'Who can help with a payment question?', answer: 'Contact the support team with your course name and payment question so they can assist.' },
    { question: 'Where can I get account help?', answer: 'Send a message through the Contact Us page and include the email address on your account.' },
    { question: 'How do I contact the support team?', answer: 'Visit Contact Us and send a message using the support form.' },
  ],
}

const AboutPage: FC = () => {
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<keyof typeof faqCategories>('General')
  const [selectedAboutPillar, setSelectedAboutPillar] = useState<keyof typeof aboutPillars>('Our Story')
  const [expandedFaq, setExpandedFaq] = useState<string | null>('General-0')

  return <Box component="main" sx={{ backgroundColor: 'background.default', color: 'text.primary' }}>
  <Box sx={{ position: 'relative', overflow: 'hidden', color: 'common.white', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)' }}>
    <Box aria-hidden="true" sx={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', right: { xs: -240, md: -90 }, top: -225, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 0 0 48px rgba(255,255,255,.035), 0 0 0 96px rgba(255,255,255,.025)' }} />
    <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 6, md: 9 } }}>
      <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
        <Grid item xs={12} md={12} lg={7}>
          <Chip icon={<AutoAwesomeOutlinedIcon />} label="ABOUT COURSESPACE" size="small" sx={{ mb: 2.5, px: 0.5, color: 'common.white', backgroundColor: 'rgba(255,255,255,.12)', '& .MuiChip-icon': { color: '#b9f0dd' }, fontWeight: 700, letterSpacing: '.06em' }} />
          <Typography component="h1" sx={{ maxWidth: 700, mb: 2, fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.045em' }}>Learning that meets you where you are.</Typography>
          <Typography sx={{ maxWidth: 590, mb: 3.5, color: 'rgba(255,255,255,.78)', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>CourseSpace helps learners build practical skills through clear courses, supportive tutors, and relaxed practice.</Typography>
        </Grid>
        <Grid item xs={12} md={5} lg={5} sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', minHeight: { xs: 220, sm: 280, md: 360 } }}>
          <Box component="img" src="/images/about-study-group-banner.webp" alt="Students studying together around a laptop" sx={{ position: 'relative', top: 84, right: '56%', height: '100%', width: 'auto', maxWidth: 'none' }} />
        </Grid>
      </Grid>
    </Container>
  </Box>

  <Container id="about-story" maxWidth="lg" sx={{ px: 1.5, py: { xs: 8, sm: 10, md: 14 } }}>
    <Grid container spacing={{ xs: 5, sm: 4, md: 4 }} alignItems="center">
      <Grid item xs={12} sm={6}>
        <Typography component="h2" sx={{ maxWidth: { xs: 480, sm: 320, md: 480 }, fontSize: 'clamp(2rem, calc(1.6087rem + 1.7391vw), 3rem)', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-.02em' }}>
          Empowering Learners to Build Skills for the Future
        </Typography>
        <Stack direction="row" spacing={{ xs: 1, sm: 2, md: 3 }} role="group" aria-label="About CourseSharp" sx={{ mt: 3, mb: 3 }}>
          {(Object.keys(aboutPillars) as Array<keyof typeof aboutPillars>).map((pillar) => <Button key={pillar} aria-pressed={selectedAboutPillar === pillar} onClick={() => setSelectedAboutPillar(pillar)} sx={{ minWidth: 0, minHeight: 44, px: 2.5, py: 1.5, border: 1, borderColor: selectedAboutPillar === pillar ? 'primary.main' : 'divider', borderRadius: 99, color: selectedAboutPillar === pillar ? 'common.white' : 'text.secondary', backgroundColor: selectedAboutPillar === pillar ? 'primary.main' : 'transparent', fontSize: 14, fontWeight: 500, letterSpacing: '.04em', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { borderColor: 'primary.main', color: 'common.white', backgroundColor: 'primary.main' } }}>{pillar}</Button>)}
        </Stack>
        <Stack aria-live="polite" spacing={2} sx={{ maxWidth: 480, color: 'text.secondary', fontSize: 14, lineHeight: '24px', letterSpacing: '.03em' }}>
          {aboutPillars[selectedAboutPillar].map((paragraph) => <Typography key={paragraph} component="p" sx={{ color: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', letterSpacing: 'inherit' }}>{paragraph}</Typography>)}
        </Stack>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, height: { xs: 370, sm: 360, md: 540 } }}>
          <Box sx={{ display: 'grid', gridTemplateRows: '1.5fr 1fr', gap: 1.5, minWidth: 0, minHeight: 0 }}>
            <Box component="img" src="/images/about-students-collaborating.webp" alt="Students collaborating around a laptop" sx={{ width: '100%', height: '100%', minHeight: 0, borderRadius: 2, objectFit: 'cover' }} />
            <Box component="img" src="/images/about-ai-classroom.webp" alt="Students learning together in a classroom" sx={{ width: '100%', height: '100%', minHeight: 0, borderRadius: 2, objectFit: 'cover' }} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateRows: '1fr 1.5fr', gap: 1.5, minWidth: 0, minHeight: 0 }}>
            <Box component="img" src="/images/about-young-learners.webp" alt="Young learners exploring a laptop together" sx={{ width: '100%', height: '100%', minHeight: 0, borderRadius: 2, objectFit: 'cover' }} />
            <Box component="img" src="/images/about-study-group-banner.webp" alt="Students studying together" sx={{ width: '100%', height: '100%', minHeight: 0, borderRadius: 2, objectFit: 'cover' }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Container>

  <Box sx={{ backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#171717' : '#f5f7fa', pt: { xs: 7, md: 10 } }}>
    <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
      <Typography component="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 600, lineHeight: 1.15, letterSpacing: '-.04em' }}>What We Offer</Typography>
      <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.5 }}>Discover a platform built to make learning simple, interactive, and effective — with real-world projects, flexible schedules, and expert-led lessons designed to help you master new skills faster.</Typography>
    </Container>
    <DotNetPillars variant="offers" />
  </Box>

  <HomeOurMentors autoplay />

  <Container maxWidth="md" sx={{ pt: { xs: 7, md: 10 }, pb: { xs: 9, md: 12 } }}>
    <Box sx={{ mb: 3.5, textAlign: 'center' }}>
      <Typography component="h2" variant="h3" sx={{ fontWeight: 800, letterSpacing: '-.035em', fontSize: { xs: '2rem', md: '2.75rem' } }}>Frequently Asked Questions</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>Clear answers about courses, learning, and support.</Typography>
    </Box>

    <Stack direction="row" justifyContent="center" flexWrap="wrap" useFlexGap spacing={.75} sx={{ mb: 3.5 }} role="group" aria-label="FAQ categories">
      {(Object.keys(faqCategories) as Array<keyof typeof faqCategories>).map((category) => <Button key={category} aria-pressed={selectedFaqCategory === category} size="small" onClick={() => { setSelectedFaqCategory(category); setExpandedFaq(null) }} sx={{ minWidth: 0, px: 1.75, borderRadius: 6, color: selectedFaqCategory === category ? 'text.primary' : 'text.secondary', backgroundColor: selectedFaqCategory === category ? 'background.paper' : 'transparent', boxShadow: selectedFaqCategory === category ? 1 : 'none', textTransform: 'none' }}>{category}</Button>)}
    </Stack>

    <Stack spacing={1.5}>
      {faqCategories[selectedFaqCategory].map((faq, index) => {
        const faqId = `${selectedFaqCategory}-${index}`
        return (
          <Accordion key={faq.question} expanded={expandedFaq === faqId} onChange={(_, isExpanded) => setExpandedFaq(isExpanded ? faqId : null)} disableGutters elevation={0} sx={{ border: 1, borderColor: 'transparent', borderRadius: '10px !important', backgroundColor: 'background.paper', color: 'text.primary', '&:before': { display: 'none' }, '&.Mui-expanded': { borderColor: 'primary.main', backgroundColor: 'background.paper' } }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} aria-controls={`about-faq-${selectedFaqCategory}-${index}-content`} id={`about-faq-${selectedFaqCategory}-${index}-header`} sx={{ px: { xs: 2, sm: 2.5 }, '& .MuiAccordionSummary-content': { my: 1.75 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails id={`about-faq-${selectedFaqCategory}-${index}-content`} sx={{ pt: 0, px: { xs: 2, sm: 2.5 }, pb: 2.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Stack>
  </Container>

  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 6, md: 8 } }}>
    <Paper elevation={0} sx={{ overflow: 'hidden', p: { xs: 3.5, sm: 5, md: 6 }, borderRadius: 3, textAlign: 'center', color: 'common.white', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)' }}>
      <Typography component="h2" variant="h4" sx={{ fontWeight: 800, letterSpacing: '-.025em', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>Let’s make your next step count</Typography>
      <Typography sx={{ mt: 1, color: 'rgba(255,255,255,.9)' }}>Find a course, meet a tutor, and build skills with confidence.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1.5} sx={{ mt: 3 }}>
        <StyledButton animated onClick={() => navigateTo('/courses')}>Explore courses</StyledButton>
        <StyledButton animated onClick={() => navigateTo('/contact-us')}>Contact support</StyledButton>
      </Stack>
    </Paper>
  </Container>
</Box>
}

export default AboutPage
