import { type ReactNode } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import type { Theme } from '@mui/material/styles'

const primary = '#127C71'
const primaryHover = '#0D6A69'
const muted = '#77788C'
const hairline = '#d9e2df'
const navy = '#17172B'

export const formFieldSx = {
  '& .MuiInputLabel-root': { color: (theme: Theme) => theme.palette.mode === 'dark' ? '#9AA7A4' : muted, fontWeight: 500, border: 0, outline: 'none', boxShadow: 'none', '&.MuiInputLabel-shrink': { bgcolor: 'background.paper' } },
  '& .MuiInputLabel-root.Mui-focused': { color: primary },
  '& .MuiFormControl-root:has(.MuiInputAdornment-positionStart) .MuiInputLabel-root:not(.MuiInputLabel-shrink)': { transform: 'translate(46px, 16px) scale(1)' },
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    pl: 2,
    borderRadius: '16px',
    bgcolor: (theme: Theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#fff',
    transition: 'box-shadow 0.2s ease',
    '& fieldset': { borderColor: (theme: Theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : hairline },
    '&:hover fieldset': { borderColor: '#A8D9CE' },
    '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(18, 124, 113, 0.14)' },
    '&.Mui-focused fieldset': { borderColor: primary, borderWidth: 1 },
  },
  '& .MuiOutlinedInput-input, & .MuiSelect-select': { py: 2, pl: 0, color: (theme: Theme) => theme.palette.mode === 'dark' ? theme.palette.text.primary : navy },
  '& .MuiInputAdornment-root': { mr: 1.25, color: muted },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': { fontSize: 20 },
} as const

export const withLeadingIcon = (icon: ReactNode, endAdornment?: ReactNode) => ({
  InputProps: {
    startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
    endAdornment,
  },
})

export const formPrimaryButtonSx = {
  height: 56,
  width: '100%',
  borderRadius: '16px',
  fontWeight: 700,
  fontSize: 16,
  textTransform: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg, #1A9A8C 0%, #0D6A69 100%)',
  boxShadow: '0 10px 24px rgba(18, 124, 113, 0.28)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
  '&:hover': { background: 'linear-gradient(135deg, #1A9A8C 0%, #0D6A69 100%)', filter: 'brightness(1.05)', transform: 'translateY(-1px)', boxShadow: '0 14px 28px rgba(18, 124, 113, 0.32)' },
  '&:active': { transform: 'translateY(0)' },
  '&.Mui-disabled': { background: '#B5DCD5', color: '#fff', boxShadow: 'none' },
  '&:focus-visible': { outline: `2px solid ${primaryHover}`, outlineOffset: 2 },
} as const
