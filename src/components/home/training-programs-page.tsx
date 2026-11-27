import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Rating from '@mui/material/Rating'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Grid from '@mui/material/Grid'
import IconButton, { iconButtonClasses } from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Pagination from '@mui/material/Pagination'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FC, useEffect, useMemo, useState } from 'react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import EnrollmentModal from '@/components/course/enrollment-modal'
import { CatalogSkeletonGrid } from '@/components/course/catalog-skeleton'
import { type Course } from '@/interfaces/course'
import { getPublicClasses, type PublicClass } from '@/services/api'
import { AvailabilityBadge, formatSchedule, programs, type ProgramDefinition } from './training-programs'
import TrainingProgramDetailPage from './training-program-detail-page'
import { navigateTo } from '@/lib/navigation'
import { toast } from '@/components/toast'

interface TrainingProgramsPageProps {
  courses: Course[]
  darkMode: boolean
  onToggleDarkMode: () => void
  programId?: string
}

type SortOrder = 'popular' | 'rating' | 'newest' | 'price-low' | 'price-high'
type ProgramView = 'grid' | 'list'
type CheckoutCourse = Pick<Course, 'id' | 'title' | 'price'> & { id: number }

interface ClassListing {
  program: ProgramDefinition
  classRecord: PublicClass
  description: string
}

interface ProgramClassCardProps {
  listing: ClassListing
  onEnroll: (classRecord: PublicClass) => void
  viewMode: ProgramView
  isFavorite: boolean
  onToggleFavorite: (id: number) => void
}

const ProgramClassCard: FC<ProgramClassCardProps> = ({ listing: { program, classRecord, description }, onEnroll, viewMode, isFavorite, onToggleFavorite }) => {
  const canEnroll = !classRecord.enrollmentClosed && (classRecord.status === 'open' || classRecord.status === 'full')
  const actionLabel = `${classRecord.status === 'full' ? 'Join waitlist for' : 'Join'} ${classRecord.title}`
  const duration = classRecord.schedule.duration
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  const durationLabel = hours ? `${hours}h${minutes ? ` ${minutes}m` : ''}` : `${duration}m`

  return <Box sx={{ height: '100%', display: viewMode === 'list' ? { xs: 'block', sm: 'flex' } : 'flex', flexDirection: 'column', gap: viewMode === 'list' ? 2 : 0, p: 2, backgroundColor: 'background.paper', border: 1, borderColor: viewMode === 'list' ? 'divider' : 'transparent', borderRadius: 4, position: 'relative', transition: (theme) => theme.transitions.create(['box-shadow']), '&:hover': { boxShadow: 2, [`& .${iconButtonClasses.root}`]: { backgroundColor: 'primary.main', color: 'primary.contrastText', boxShadow: 2 } } }}>
    <Box sx={{ position: 'relative', lineHeight: 0, overflow: 'hidden', width: viewMode === 'list' ? { xs: '100%', sm: 240 } : '100%', flexShrink: 0, aspectRatio: viewMode === 'list' ? { xs: '16 / 9', sm: '4 / 3' } : '16 / 9', borderRadius: 3, mb: viewMode === 'list' ? { xs: 2, sm: 0 } : 2, '& .program-cover-image': { display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3 } }}>
      <img className="program-cover-image" src={classRecord.cover ?? program.image} width={760} height={428} alt={classRecord.title} loading="lazy" />
      <IconButton color={isFavorite ? 'error' : 'default'} aria-label={`${isFavorite ? 'Remove' : 'Add'} ${classRecord.title} ${isFavorite ? 'from' : 'to'} favorites`} aria-pressed={isFavorite} onClick={() => onToggleFavorite(classRecord.id)} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'background.paper' } }}>
        {isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
      </IconButton>
    </Box>
    <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography component="h4" variant="h5" sx={{ mb: 1, minHeight: viewMode === 'list' ? 'auto' : 56, overflow: 'hidden', fontSize: '1.2rem' }}>{classRecord.title}</Typography>
      <Stack direction="row" flexWrap="wrap" spacing={0.75} useFlexGap sx={{ mb: 1.25 }}>
        <Chip size="small" label={program.title} color="primary" variant="outlined" />
        {duration > 0 && <Chip size="small" label={durationLabel} variant="outlined" />}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
        <Rating value={classRecord.rating} max={5} readOnly size="small" sx={{ color: '#ffce31' }} />
        <Typography variant="body2" color="text.secondary">{classRecord.ratingCount ? `(${classRecord.ratingCount} ${classRecord.ratingCount === 1 ? 'review' : 'reviews'})` : 'No reviews yet'}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6, display: viewMode === 'list' ? { xs: 'none', sm: '-webkit-box' } : '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</Typography>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">{formatSchedule(classRecord.schedule)}</Typography>
        <Typography variant="body2" color="text.secondary">Tutor: {classRecord.tutorName}</Typography>
        <Box sx={{ pt: 0.5 }}><AvailabilityBadge classRecord={classRecord} /></Box>
      </Stack>
      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="h5" color="primary.main">{`$${classRecord.price}`}</Typography>
          <Typography variant="h6">/ class</Typography>
        </Box>
        <IconButton color="primary" aria-label={canEnroll ? actionLabel : `${classRecord.title} is not open for enrollment`} disabled={!canEnroll} onClick={() => onEnroll(classRecord)} sx={{ '&:hover': { color: 'primary.dark' } }}><ArrowForwardIcon /></IconButton>
      </Box>
    </Box>
  </Box>
}

const TrainingProgramsPage: FC<TrainingProgramsPageProps> = ({ courses, darkMode, onToggleDarkMode, programId }) => {
  const [search, setSearch] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sortOrder, setSortOrder] = useState<SortOrder>('popular')
  const [viewMode, setViewMode] = useState<ProgramView>(() => localStorage.getItem('coursesharp-program-view') === 'list' ? 'list' : 'grid')
  const [favorites, setFavorites] = useState<string[]>(() => (localStorage.getItem('coursesharp-program-favorites') ?? '').split(',').filter(Boolean))
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6
  const [liveClasses, setLiveClasses] = useState<PublicClass[]>([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [enrollmentCourse, setEnrollmentCourse] = useState<CheckoutCourse | null>(null)
  const [enrollmentClassId, setEnrollmentClassId] = useState<number | null>(null)

  const listings = useMemo<ClassListing[]>(() => liveClasses.flatMap((classRecord) => {
    const program = programs.find((candidate) => candidate.id === classRecord.programId)
    if (!program || !classRecord.published || classRecord.status === 'closed') return []
    const course = courses.find((candidate) => Number(candidate.id) === classRecord.courseId)
    return [{ program, classRecord, description: course?.description ?? program.description }]
  }), [courses, liveClasses])
  const priceMaximum = Math.max(50, Math.ceil(Math.max(0, ...listings.map((listing) => listing.classRecord.price)) / 50) * 50)
  const activePriceRange = priceRange ?? [0, priceMaximum]
  const hasFilters = selectedProgramIds.length > 0 || minRating > 0 || activePriceRange[0] > 0 || activePriceRange[1] < priceMaximum

  useEffect(() => {
    let isCurrent = true
    getPublicClasses().then((records) => {
      if (isCurrent) {
        setLiveClasses(records)
        setClassesLoading(false)
      }
    }).catch(() => {
      if (isCurrent) {
        setLiveClasses([])
        setClassesLoading(false)
      }
    })
    return () => {
      isCurrent = false
    }
  }, [])

  const visibleListings = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return listings
      .filter(({ program, classRecord }) => selectedProgramIds.length === 0 || selectedProgramIds.includes(program.id))
      .filter(({ classRecord }) => classRecord.rating >= minRating)
      .filter(({ classRecord }) => classRecord.price >= activePriceRange[0] && classRecord.price <= activePriceRange[1])
      .filter(({ program, classRecord, description }) => !query || `${program.title} ${program.eyebrow} ${program.features.join(' ')} ${classRecord.title} ${classRecord.tutorName} ${description}`.toLocaleLowerCase().includes(query))
      .sort((a, b) => {
        if (sortOrder === 'rating') return b.classRecord.rating - a.classRecord.rating || b.classRecord.ratingCount - a.classRecord.ratingCount
        if (sortOrder === 'newest') return (Date.parse(b.classRecord.createdAt ?? '') || b.classRecord.id) - (Date.parse(a.classRecord.createdAt ?? '') || a.classRecord.id)
        if (sortOrder === 'price-low') return a.classRecord.price - b.classRecord.price
        if (sortOrder === 'price-high') return b.classRecord.price - a.classRecord.price
        return b.classRecord.enrolledCount - a.classRecord.enrolledCount || b.classRecord.rating - a.classRecord.rating
      })
  }, [activePriceRange, listings, minRating, search, selectedProgramIds, sortOrder])

  const pageCount = Math.max(1, Math.ceil(visibleListings.length / pageSize))
  const pageListings = visibleListings.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const activeFilters = [
    ...selectedProgramIds.map((value) => ({ key: 'program', value, label: programs.find((program) => program.id === value)?.title ?? value, remove: () => setSelectedProgramIds((current) => current.filter((item) => item !== value)) })),
    ...(minRating > 0 ? [{ key: 'rating', value: String(minRating), label: `${minRating.toFixed(1)}+ stars`, remove: () => setMinRating(0) }] : []),
    ...(activePriceRange[0] > 0 || activePriceRange[1] < priceMaximum ? [{ key: 'price', value: `${activePriceRange[0]}-${activePriceRange[1]}`, label: `$${activePriceRange[0]}–$${activePriceRange[1]}`, remove: () => setPriceRange(null) }] : []),
    ...(search ? [{ key: 'search', value: search, label: `Search: ${search}`, remove: () => setSearch('') }] : []),
  ]
  const handleViewChange = (_event: unknown, nextView: ProgramView | null) => {
    if (!nextView) return
    setViewMode(nextView)
    localStorage.setItem('coursesharp-program-view', nextView)
  }
  const toggleFavorite = (id: number) => setFavorites((current) => current.includes(String(id)) ? current.filter((item) => item !== String(id)) : [...current, String(id)])
  useEffect(() => localStorage.setItem('coursesharp-program-favorites', favorites.join(',')), [favorites])

  const clearFilters = () => {
    setSearch('')
    setPriceRange(null)
    setSelectedProgramIds([])
    setMinRating(0)
    setCurrentPage(1)
  }

  const filterPanel = <Paper elevation={0} component="aside" aria-label="Program filters" sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: 'divider', borderRadius: 3, backgroundColor: 'background.paper', position: { md: 'sticky' }, top: { md: 24 } }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 750 }}>Filters</Typography>
      {(hasFilters || search) && <Button size="small" onClick={clearFilters}>Clear all</Button>}
    </Stack>
    <Divider />
    <Box sx={{ py: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Program</Typography>
      <FormGroup>{programs.map((program) => <FormControlLabel key={program.id} control={<Checkbox checked={selectedProgramIds.includes(program.id)} onChange={(event) => { setSelectedProgramIds((current) => event.target.checked ? [...current, program.id] : current.filter((value) => value !== program.id)); setCurrentPage(1) }} />} label={<Typography variant="body2">{program.title} <Typography component="span" variant="caption" color="text.secondary">({listings.filter((listing) => listing.program.id === program.id).length})</Typography></Typography>} sx={{ ml: 0, mr: 0, minHeight: 34 }} />)}</FormGroup>
    </Box>
    <Divider />
    <Box sx={{ py: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700 }}>Price range</Typography>
      <Typography variant="caption" color="text.secondary">${activePriceRange[0]} – ${activePriceRange[1]}</Typography>
      <Slider getAriaLabel={(index) => (index === 0 ? 'Minimum class price' : 'Maximum class price')} value={activePriceRange} min={0} max={priceMaximum} step={1} onChange={(_, value) => { if (Array.isArray(value)) { setPriceRange([value[0], value[1]]); setCurrentPage(1) } }} valueLabelDisplay="auto" valueLabelFormat={(value) => `$${value}`} sx={{ mt: 1, mb: 0.5, color: 'primary.main' }} />
      <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Min</Typography><Typography variant="caption" color="text.secondary">Max</Typography></Stack>
    </Box>
    <Divider />
    <Box sx={{ pt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Ratings</Typography>
      <RadioGroup aria-label="Filter by minimum program rating" value={String(minRating)} onChange={(event) => { setMinRating(Number(event.target.value)); setCurrentPage(1) }}>
        {[4.5, 4, 3.5, 3].map((rating) => <FormControlLabel key={rating} value={String(rating)} control={<Radio size="small" />} label={<Stack direction="row" alignItems="center" spacing={0.75}><Rating value={rating} precision={0.5} readOnly size="small" sx={{ color: '#c18120', fontSize: 16 }} /><Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{rating.toFixed(1)} & up</Typography><Typography variant="caption" color="text.secondary">({listings.filter((listing) => listing.classRecord.rating >= rating).length.toLocaleString()})</Typography></Stack>} sx={{ ml: 0, mr: 0, minHeight: 42 }} />)}
      </RadioGroup>
    </Box>
  </Paper>

  const handleEnroll = (classRecord?: PublicClass, preferInternational = false) => {
    if (classRecord) {
      setEnrollmentCourse({ id: classRecord.courseId ?? classRecord.id, title: classRecord.title, price: classRecord.price })
      setEnrollmentClassId(classRecord.id)
      return
    }
    const course = courses.find((candidate) => candidate.category.toLowerCase().includes('international') || candidate.title.toLowerCase().includes('interactive'))
    if (!preferInternational) return
    if (!course || typeof course.id !== 'number') {
      toast.add({ title: 'Enrollment is not ready', description: 'Create a published International Online Interactive course before checkout can begin.', type: 'error' })
      return
    }
    setEnrollmentCourse({ id: course.id, title: course.title, price: course.price })
    setEnrollmentClassId(null)
  }

  const selectedProgram = programs.find((program) => program.id === programId)
  const selectedProgramClasses = selectedProgram ? liveClasses.filter((classRecord) => classRecord.programId === selectedProgram.id && classRecord.published && classRecord.status !== 'closed') : []

  return <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
    <Header darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
    <Box component="main">{programId ? <TrainingProgramDetailPage program={selectedProgram} classes={selectedProgramClasses} onBack={() => navigateTo('/training-programs')} onEnrollClass={handleEnroll} onEnrollProgram={() => handleEnroll(undefined, true)} /> : <>
      <Box sx={{ position: 'relative', overflow: 'hidden', color: 'common.white', background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)' }}>
        <Box aria-hidden="true" sx={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', right: { xs: -240, md: -90 }, top: -225, border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 0 0 48px rgba(255,255,255,.035), 0 0 0 96px rgba(255,255,255,.025)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 6, md: 9 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={12} lg={7}>
              <Chip icon={<AutoAwesomeOutlinedIcon />} label="FIND YOUR PATH" size="small" sx={{ mb: 2.5, px: 0.5, color: 'common.white', backgroundColor: 'rgba(255,255,255,.12)', '& .MuiChip-icon': { color: '#b9f0dd' }, fontWeight: 700, letterSpacing: '.06em' }} />
              <Typography component="h1" sx={{ maxWidth: 700, mb: 2, fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' }, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.045em' }}>Our Training Programs</Typography>
              <Typography sx={{ maxWidth: 590, mb: 3.5, color: 'rgba(255,255,255,.78)', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>Choose the learning experience that fits your goals, schedule, and stage. Small groups, expert tutors, and real progress.</Typography>
            </Grid>
            <Grid item xs={12} md={5} lg={5} sx={{ display: { xs: 'none', lg: 'block' }, position: 'relative', minHeight: { xs: 220, sm: 280, md: 360 } }}>
              <Box component="img" src="/images/courses-banner-student.webp" alt="Smiling student holding a notebook with learning illustrations" sx={{ position: 'absolute', top: 77, right: 0, height: '100%', width: 'auto', maxWidth: 'none' }} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="program-catalog" maxWidth="lg" sx={{ py: { xs: 5, md: 7 }, scrollMarginTop: 24 }}>
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 1.25 }}>Browse and discover</Typography>
          <Typography component="h2" variant="h4" sx={{ mt: 0.25, fontWeight: 800, letterSpacing: '-.035em' }}>Explore all programs</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>Search the programs or filter by price to find your next step.</Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2.5, justifyContent: { md: 'space-between' } }}>
          <TextField fullWidth value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }} placeholder="Search programs, formats, or features" aria-label="Search programs" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon color="action" /></InputAdornment> }} sx={{ flex: { xs: '1 1 100%', md: '0 0 400px' }, '& .MuiOutlinedInput-root': { backgroundColor: 'background.paper', borderRadius: 2 } }} />
          <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'space-between', md: 'flex-end' }}>
            <FormControl size="small" sx={{ width: { xs: 'auto', md: 220 }, flex: { xs: 1, md: '0 0 220px' }, minWidth: 0 }}>
              <Select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value as SortOrder); setCurrentPage(1) }} inputProps={{ 'aria-label': 'Sort programs' }} sx={{ minHeight: 56, backgroundColor: 'background.paper', borderRadius: 2 }}>
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small" aria-label="Program view" sx={{ flexShrink: 0, height: 56, backgroundColor: 'background.paper', '& .MuiToggleButton-root': { px: 1.25, color: 'text.secondary', borderColor: 'divider' }, '& .Mui-selected': { color: 'primary.main', backgroundColor: 'action.selected' } }}>
              <ToggleButton value="grid" aria-label="Grid view"><GridViewRoundedIcon /></ToggleButton>
              <ToggleButton value="list" aria-label="List view"><ViewListRoundedIcon /></ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="flex-start">
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>{filterPanel}</Grid>
          <Grid item xs={12} md={9}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: activeFilters.length ? 1.5 : 1 }}>
              <Typography variant="body2" color="text.secondary">Showing <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{pageListings.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, visibleListings.length)}` : 0}</Box> of <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{visibleListings.length}</Box> classes</Typography>
              <Button size="small" startIcon={<FilterListRoundedIcon />} onClick={() => setMobileFiltersOpen(true)} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>Filters{activeFilters.length ? ` (${activeFilters.length})` : ''}</Button>
            </Stack>
            {activeFilters.length > 0 && <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 2 }}>
              {activeFilters.map((filter) => <Chip key={`${filter.key}-${filter.value}`} size="small" label={filter.label} onDelete={() => { filter.remove(); setCurrentPage(1) }} color="primary" variant="outlined" />)}
              <Button size="small" onClick={clearFilters}>Clear all</Button>
            </Stack>}
            {classesLoading ? <CatalogSkeletonGrid label="Loading programs" /> : visibleListings.length ? <>
              <Box sx={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1, md: 2 } } : { display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                {pageListings.map((listing) => <ProgramClassCard key={listing.classRecord.id} listing={listing} onEnroll={handleEnroll} viewMode={viewMode} isFavorite={favorites.includes(String(listing.classRecord.id))} onToggleFavorite={toggleFavorite} />)}
              </Box>
              <Stack alignItems="center" sx={{ mt: 3 }}><Pagination count={pageCount} page={currentPage} onChange={(_, page) => { setCurrentPage(page); document.getElementById('program-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} color="primary" aria-label="Program pages" /></Stack>
            </> : <Paper variant="outlined" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 3, backgroundColor: 'background.paper' }}>
              <SearchRoundedIcon color="disabled" sx={{ fontSize: 38 }} />
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>{hasFilters || search ? 'No programs match your search or filters' : 'No published classes yet'}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>{hasFilters || search ? 'Try adjusting your filters or using a different search term.' : 'Check back soon for upcoming program classes.'}</Typography>
              {(hasFilters || search) && <Button variant="outlined" onClick={clearFilters}>Reset Filters</Button>}
            </Paper>}
          </Grid>
        </Grid>
        <Drawer anchor="left" open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: 'min(360px, 90vw)', p: 2 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 750 }}>Filters</Typography>
            <IconButton aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)}><CloseRoundedIcon /></IconButton>
          </Stack>
          {filterPanel}
          <Button variant="contained" onClick={() => setMobileFiltersOpen(false)} sx={{ mt: 2 }}>Show {visibleListings.length} classes</Button>
        </Drawer>
      </Container>
    </>}</Box>
    {enrollmentCourse && <EnrollmentModal course={enrollmentCourse} classId={enrollmentClassId} open={Boolean(enrollmentCourse)} onClose={() => { setEnrollmentCourse(null); setEnrollmentClassId(null) }} />}
    <Footer />
  </Box>
}

export default TrainingProgramsPage
