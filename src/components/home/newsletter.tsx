import React, { FC } from 'react'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { StyledButton } from '../styled-button'

const HomeNewsLetter: FC = () => {
  return (
    <Box sx={{ backgroundColor: 'background.paper', py: { xs: 8, md: 10 } }}>
      <Container>
        <Box
          sx={{
            background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(120deg, #102b3f 0%, #0b514b 100%)' : 'linear-gradient(120deg, #102b3f 0%, #12685d 68%, #168276 100%)',
            color: 'common.white',
            borderRadius: 10,
            py: { xs: 4, md: 10 },
            px: { xs: 4, md: 8 },
            textAlign: 'center',
          }}
        >
          <Typography component="p" variant="overline" sx={{ mb: 0.5, color: 'rgba(255,255,255,.72)', fontWeight: 800, letterSpacing: 1.2, lineHeight: 1.4 }}>
            STAY CONNECTED
          </Typography>
          <Typography variant="h1" component="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.25, fontWeight: 800 }}>
            Subscribe to Our Newsletter
          </Typography>
          <Typography sx={{ mb: 6 }}>Get new batch openings and learning tips sent to your inbox.</Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-around',
              width: { xs: '100%', md: 560 },
              mx: 'auto',
            }}
          >
            <InputBase
              sx={{
                backgroundColor: 'background.paper',
                color: 'text.primary',
                borderRadius: 3,
                width: '100%',
                height: 48,
                px: 2,
                mr: { xs: 0, md: 3 },
                mb: { xs: 2, md: 0 },
              }}
              placeholder="Enter your Email Address"
            />
            <Box>
              <StyledButton disableHoverEffect size="large">
                Subscribe
              </StyledButton>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default HomeNewsLetter
