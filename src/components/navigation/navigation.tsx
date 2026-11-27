import React, { FC, useState } from 'react'
import { useRef } from 'react'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Link as ScrollLink } from 'react-scroll'
import { navigateTo } from '@/lib/navigation'
import { navigations } from './navigation.data'

const programPaths = new Set(['popular-course', '/training-programs', '/courses', '/practice-exams'])

interface Props {
  isAdmin?: boolean
  onNavigate?: () => void
}

const Navigation: FC<Props> = ({ isAdmin = false, onNavigate }) => {
  const [programsAnchor, setProgramsAnchor] = useState<HTMLElement | null>(null)
  const programsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeDestination, setActiveDestination] = useState(() => navigations.find(({ path }) => path.startsWith('/') && window.location.pathname.startsWith(path))?.path ?? 'hero')

  if (isAdmin) return null

  const destinations = navigations
  const programDestinations = destinations.filter(({ path }) => programPaths.has(path))
  const primaryDestinations = destinations.filter(({ path }) => !programPaths.has(path))
  const programsOpen = Boolean(programsAnchor)
  const programsActive = programDestinations.some(({ path }) => path === activeDestination)
  const openPrograms = (anchor: HTMLElement) => {
    if (programsCloseTimer.current) clearTimeout(programsCloseTimer.current)
    setProgramsAnchor(anchor)
  }
  const scheduleProgramsClose = () => {
    programsCloseTimer.current = setTimeout(() => setProgramsAnchor(null), 150)
  }
  const keepProgramsOpen = () => {
    if (programsCloseTimer.current) clearTimeout(programsCloseTimer.current)
  }

  const handleDestinationClick = (destination: string, event: React.MouseEvent<HTMLElement>) => {
    setActiveDestination(destination)
    if (destination === 'hero' && window.location.pathname !== '/') {
      event.preventDefault()
      navigateTo('/')
    } else if (destination.startsWith('/')) {
      event.preventDefault()
      navigateTo(destination)
    }
    setProgramsAnchor(null)
    onNavigate?.()
  }

  const headlineCurve = <Box aria-hidden="true" sx={{ position: 'absolute', top: 22, left: '50%', width: 44, transform: 'translateX(-50%) rotate(3deg)', '& img': { display: 'block', width: 44, height: 'auto' } }}><img src="/images/headline-curve.svg" alt="" /></Box>
  const linkSx = {
    position: 'relative',
    color: 'text.disabled',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: { xs: 0, md: 3 },
    mb: { xs: 3, md: 0 },
    fontSize: { xs: '1.2rem', md: 'inherit' },
    '& > div': { display: 'none' },
    '&.current': { color: 'primary.main', '&>div': { display: 'block' } },
    '&:hover': { color: 'primary.main' },
  }

  const renderDestination = ({ path: destination, label }: typeof primaryDestinations[number]) => {
    const isRoute = destination.startsWith('/')
    return <Box
      component={isRoute ? 'a' : ScrollLink}
      key={destination}
      onClick={(event: React.MouseEvent<HTMLElement>) => handleDestinationClick(destination, event)}
      {...(isRoute
        ? { href: destination }
        : {
            activeClass: 'current',
            onSetActive: (to: string) => setActiveDestination(to),
            to: destination,
            href: `#${destination}`,
            spy: true,
            smooth: true,
            duration: 350,
          })}
      sx={{
        ...linkSx,
        ...(destination === 'hero' && { color: 'primary.main' }),
        ...(activeDestination === destination && { color: 'primary.main', '&>div': { display: 'block' } }),
      }}
    >
      {headlineCurve}
      {label}
    </Box>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' } }}>
      {primaryDestinations.filter(({ path }) => path === 'hero').map(renderDestination)}
      <Box onMouseLeave={scheduleProgramsClose} sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: { xs: 3, md: 0 } }}>
        <Box
          component="button"
          type="button"
          aria-haspopup="menu"
          aria-expanded={programsOpen ? 'true' : undefined}
          onMouseEnter={(event: React.MouseEvent<HTMLElement>) => openPrograms(event.currentTarget)}
          onClick={(event: React.MouseEvent<HTMLElement>) => openPrograms(event.currentTarget)}
          sx={{
            ...linkSx,
            border: 0,
            background: 'none',
            p: 0,
            mb: 0,
            color: programsActive || programsOpen ? 'primary.main' : 'text.disabled',
            '& > div': { display: programsActive || programsOpen ? 'block' : 'none' },
          }}
        >
          {headlineCurve}
          Programs
          <KeyboardArrowDownIcon sx={{ ml: 0.5, flexShrink: 0, fontSize: '1.25rem', color: 'primary.main', transition: 'transform 150ms', transform: programsOpen ? 'rotate(180deg)' : 'none' }} />
        </Box>
        <Menu
          anchorEl={programsAnchor}
          open={programsOpen}
          onClose={() => setProgramsAnchor(null)}
          PaperProps={{
            className: '!mt-2 !min-w-64 !overflow-hidden !rounded-2xl !shadow-lg',
            onMouseEnter: keepProgramsOpen,
            onMouseLeave: scheduleProgramsClose,
          }}
          MenuListProps={{ 'aria-label': 'Programs', className: '!flex !flex-col !gap-1 !p-2' }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          {programDestinations.map(({ path: destination, label }) => {
            const isRoute = destination.startsWith('/')
            const destinationHref = isRoute ? destination : `/#${destination}`
            return <MenuItem
              key={destination}
              component="a"
              href={destinationHref}
              className="min-h-11 !rounded-xl px-4 py-3 text-sm transition-colors"
              onClick={(event) => {
                if (isRoute) handleDestinationClick(destination, event)
                else {
                  setProgramsAnchor(null)
                  onNavigate?.()
                }
              }}
            >{label}</MenuItem>
          })}
        </Menu>
      </Box>
      {primaryDestinations.filter(({ path }) => path !== 'hero').map(renderDestination)}
    </Box>
  )
}

export default Navigation
