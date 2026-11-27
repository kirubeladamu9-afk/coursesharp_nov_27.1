import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined'
import FullscreenExitOutlinedIcon from '@mui/icons-material/FullscreenExitOutlined'
import { type FC, useEffect, useRef, useState } from 'react'

type CatalogLab = { id: string; title: string; subject: string; path: string }

const SimulationLabViewer: FC<{ labId?: string }> = ({ labId }) => {
  const [catalog, setCatalog] = useState<CatalogLab[] | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateFullScreen = () => setFullScreen(document.fullscreenElement === viewerRef.current)
    document.addEventListener('fullscreenchange', updateFullScreen)
    return () => document.removeEventListener('fullscreenchange', updateFullScreen)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/labs.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load lab catalog')
        return response.json() as Promise<CatalogLab[]>
      })
      .then(setCatalog)
      .catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => controller.abort()
  }, [])

  const lab = catalog?.find((item) => item.id === labId)
  const validPath = lab?.path.split('/').every((segment) => /^[a-z0-9-]+(?:\.html)?$/i.test(segment))
  const source = lab && validPath ? `/labs/${encodeURIComponent(lab.subject.toLowerCase())}/${lab.path.split('/').map(encodeURIComponent).join('/')}` : null

  useEffect(() => {
    if (!source) return
    const controller = new AbortController()
    setHtml(null)
    setFailed(false)
    fetch(source, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load simulation')
        return response.text()
      })
      .then((content) => {
        const baseHref = new URL('.', new URL(source, window.location.origin)).href
        setHtml(content.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`))
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true) })
    return () => controller.abort()
  }, [source])

  if (!source || failed) return <Box sx={{ minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><Typography color={failed ? 'error' : 'text.secondary'}>{failed ? 'Simulation lab could not be loaded.' : catalog ? 'This simulation lab is unavailable.' : 'Loading simulation lab...'}</Typography></Box>
  if (!html) return <Box sx={{ minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}><Typography role="status" color="text.secondary">Loading simulation lab...</Typography></Box>
  return <Box ref={viewerRef} sx={fullScreen ? { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 1, backgroundColor: 'background.default' } : { width: '100%' }}><Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}><Button variant="outlined" startIcon={fullScreen ? <FullscreenExitOutlinedIcon /> : <FullscreenOutlinedIcon />} aria-pressed={fullScreen} onClick={() => { if (document.fullscreenElement) void document.exitFullscreen(); else if (viewerRef.current) void viewerRef.current.requestFullscreen() }}>{fullScreen ? 'Exit full screen' : 'Full screen'}</Button></Box><Box component="iframe" title={lab?.title ?? 'Simulation lab'} srcDoc={html} sandbox="allow-scripts allow-forms allow-pointer-lock allow-modals" allow="fullscreen; pointer-lock" sx={{ display: 'block', width: '100%', height: fullScreen ? 0 : { xs: 'min(60vh, 460px)', md: 'min(72vh, 680px)' }, flex: fullScreen ? 1 : undefined, minHeight: fullScreen ? 0 : 280, border: 0, backgroundColor: 'background.paper' }} /></Box>
}

export default SimulationLabViewer
