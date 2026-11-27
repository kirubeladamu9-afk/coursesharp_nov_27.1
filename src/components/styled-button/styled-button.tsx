import React, { FC, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { Theme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { ButtonProps } from '@mui/material/Button'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { fontFamily } from '@/config/theme/typography'

interface BaseButtonProps extends Pick<ButtonProps, 'onClick' | 'type' | 'startIcon' | 'endIcon' | 'disabled'> {
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'default' | 'primary' | 'secondary' | 'dark' | 'light'
  size?: 'small' | 'medium' | 'large'
  disableHoverEffect?: boolean
  animated?: boolean
  borderRadius?: number
}
interface StyledButtonRootProps extends BaseButtonProps {
  theme?: Theme
}

const StyledButtonRoot = styled('button', {
  shouldForwardProp: (prop) =>
    prop !== 'variant' && prop !== 'color' && prop !== 'size' && prop !== 'disableHoverEffect' && prop !== 'animated' && prop !== 'borderRadius',
})<StyledButtonRootProps>(({ theme, color, variant, size, disableHoverEffect, animated, borderRadius }) => ({
  fontFamily,
  cursor: 'pointer',
  minWidth: 40,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: 1,
  borderRadius: borderRadius ?? Number(theme.shape.borderRadius) * 3,

  display: 'inline-flex',
  alignItems: 'center',
  userSelect: 'none',
  transform: 'unset',
  position: 'relative',
  overflow: 'hidden',
  border: 'none',
  whiteSpace: 'nowrap',
  WebkitTapHighlightColor: 'transparent',
  verticalAlign: 'middle',
  outline: 'none !important',
  transition: theme.transitions.create(['transform']),
  '&:disabled': { cursor: 'not-allowed', opacity: 0.6, transform: 'none' },

  // hover
  '&:hover': {
    ...(!disableHoverEffect && {
      transform: 'translateY(-3px)',
    }),
  },

  '& svg': {
    fontSize: 20,
  },

  // sizes and variants
  ...(size === 'small' &&
    variant === 'outlined' && {
      padding: '4px 10px',
    }),
  ...(size === 'medium' &&
    variant === 'outlined' && {
      padding: '6px 14px',
    }),
  ...(size === 'large' &&
    variant === 'outlined' && {
      padding: '10px 18px',
      fontSize: 15,
    }),

  ...(size === 'small' &&
    variant !== 'outlined' && {
      padding: '6px 12px',
    }),
  ...(size === 'medium' &&
    variant !== 'outlined' && {
      padding: '8px 16px',
    }),
  ...(size === 'large' &&
    variant !== 'outlined' && {
      padding: '12px 20px',
      fontSize: 15,
    }),

  // variants
  ...(variant !== 'contained' && {
    backgroundColor: 'transparent',
    boxShadow: 'none !important',
  }),

  // colors & varians
  ...(color === 'default' &&
    variant === 'contained' && {
      backgroundColor: theme.palette.text.primary,
      color: theme.palette.background.paper,
    }),
  ...(color === 'primary' &&
    variant === 'contained' && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: theme.shadows[2],
    }),
  ...(color === 'secondary' &&
    variant === 'contained' && {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.primary.contrastText,
    }),
  ...(color === 'dark' &&
    variant === 'contained' && {
      backgroundColor: theme.palette.text.primary,
      color: theme.palette.background.paper,
    }),
  ...(color === 'light' &&
    variant === 'contained' && {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    }),

  ...(color === 'primary' &&
    variant === 'outlined' && {
      border: `2px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
    }),
  ...(color === 'secondary' &&
    variant === 'outlined' && {
      border: `2px solid ${theme.palette.secondary.main}`,
      color: theme.palette.secondary.main,
    }),
  ...(color === 'dark' &&
    variant === 'outlined' && {
      border: `2px solid ${theme.palette.text.primary}`,
      color: theme.palette.text.primary,
    }),
  ...(color === 'light' &&
    variant === 'outlined' && {
      border: `2px solid ${theme.palette.text.primary}`,
      color: theme.palette.text.primary,
    }),

  ...(color === 'primary' &&
    variant === 'text' && {
      color: theme.palette.primary.main,
    }),
  ...(color === 'secondary' &&
    variant === 'text' && {
      color: theme.palette.secondary.main,
    }),
  ...(color === 'dark' &&
    variant === 'text' && {
      color: theme.palette.text.primary,
    }),
  ...(color === 'light' &&
    variant === 'text' && {
      color: theme.palette.text.primary,
    }),
  ...(color === 'light' &&
    variant === 'text' && {
      color: theme.palette.primary.contrastText,
    }),

  ...(animated && {
    height: 44,
    padding: '4px 6px 4px 24px',
    gap: 10,
    borderRadius: 999,
    fontSize: 16,
    lineHeight: '24px',
    letterSpacing: 0.48,
    transition: 'background-color 500ms ease',
    ...(variant === 'contained' && {
      backgroundColor: '#127C71',
      color: '#fff',
      boxShadow: 'none',
      [theme.breakpoints.up('sm')]: { height: 48 },
    }),
    '&:hover': {
      ...(!disableHoverEffect && { transform: 'none' }),
      ...(variant === 'contained' && { backgroundColor: '#0F6B62' }),
    },
    '& .styled-button-end-icon': {
      position: 'relative',
      width: 36,
      height: 36,
      margin: 0,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      color: '#127C71',
      flexShrink: 0,
      overflow: 'hidden',
    },
    '& .styled-button-arrow': {
      position: 'absolute',
      width: 20,
      height: 20,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 300ms ease-in-out',
    },
    '& .styled-button-arrow-primary': { transform: 'translateX(0)' },
    '& .styled-button-arrow-secondary': { transform: 'translateX(-40px)' },
    '&:hover .styled-button-arrow-primary': { transform: 'translateX(40px)' },
    '&:hover .styled-button-arrow-secondary': { transform: 'translateX(0)' },
    '@media (prefers-reduced-motion: reduce)': {
      '& .styled-button-arrow': { transition: 'none' },
    },
  }),
}))

interface Props extends BaseButtonProps {
  children: ReactNode
}

const StyledButton: FC<Props> = ({ children, onClick, disableHoverEffect = false, animated = false, borderRadius, startIcon, endIcon, color = 'primary', variant = 'contained', size = 'medium', ...rest }) => {
  const resolvedEndIcon = endIcon ?? (animated ? <ArrowForwardRoundedIcon aria-hidden="true" /> : undefined)

  return (
    <StyledButtonRoot onClick={onClick} disableHoverEffect={disableHoverEffect} animated={animated} borderRadius={borderRadius} color={color} variant={variant} size={size} {...rest}>
      {startIcon && (
        <Box component="span" sx={{ display: 'inherit', mr: 1, ml: -0.5 }}>
          {startIcon}
        </Box>
      )}
      <Box component="span">{children}</Box>
      {resolvedEndIcon && (
        <Box component="span" className={animated ? 'styled-button-end-icon' : undefined} sx={{ display: 'inherit', ...(animated ? {} : { ml: 1, mr: -0.5 }) }}>
          {animated ? (
            <>
              <Box component="span" className="styled-button-arrow styled-button-arrow-primary">{resolvedEndIcon}</Box>
              <Box component="span" className="styled-button-arrow styled-button-arrow-secondary">{resolvedEndIcon}</Box>
            </>
          ) : resolvedEndIcon}
        </Box>
      )}
    </StyledButtonRoot>
  )
}

export default StyledButton
