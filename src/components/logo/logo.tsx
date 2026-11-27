import React, { FC } from 'react'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

interface Props {
  onClick?: () => void
  compact?: boolean
}

const Logo: FC<Props> = ({ onClick, compact = false }) => {
  const darkMode = useTheme().palette.mode === 'dark'
  const src = compact
    ? darkMode ? '/brand/coursesharp-dark-icon-40x40.webp' : '/brand/coursesharp-icon-40x40.png'
    : darkMode ? '/brand/coursesharp-dark-wordmark-540x120.webp' : '/brand/coursesharp-wordmark-540x120.png'

  return (
    <Box
      component="a"
      href="/"
      aria-label="Coursesharp home"
      onClick={(event) => {
        if (!onClick) return
        event.preventDefault()
        onClick()
      }}
      sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, lineHeight: 0 }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        sx={
          compact
            ? { display: 'block', width: 40, height: 40, objectFit: 'contain' }
            : { display: 'block', width: 'auto', height: { xs: 32, md: 40 }, objectFit: 'contain' }
        }
      />
    </Box>
  )
}

export default Logo
