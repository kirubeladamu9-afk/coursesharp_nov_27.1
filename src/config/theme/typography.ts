import { TypographyOptions } from '@mui/material/styles/createTypography'

export const fontFamily = [
  '"Cabin",-apple-system, BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
].join(',')

export const monoFontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

const headingLineHeight = 1.4
const bodyLineHeight = 1.6

const typography: TypographyOptions = {
  fontFamily,
  fontWeightLight: 400,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: {
    fontSize: 'clamp(30px, 1.5rem + 1.25vw, 36px)',
    lineHeight: headingLineHeight,
    fontWeight: 700,
  },
  h2: {
    fontSize: 'clamp(26px, 1.25rem + 0.9vw, 30px)',
    lineHeight: headingLineHeight,
    fontWeight: 700,
  },
  h3: {
    fontSize: 'clamp(22px, 1.25rem + 0.4vw, 24px)',
    lineHeight: headingLineHeight,
    fontWeight: 700,
  },
  h4: {
    fontSize: 'clamp(19px, 1.1rem + 0.25vw, 20px)',
    lineHeight: headingLineHeight,
    fontWeight: 600,
  },
  h5: {
    fontSize: 'clamp(17px, 1rem + 0.2vw, 18px)',
    lineHeight: headingLineHeight,
    fontWeight: 600,
  },
  h6: {
    fontSize: '1rem',
    lineHeight: headingLineHeight,
    fontWeight: 600,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: bodyLineHeight,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.9375rem',
    lineHeight: bodyLineHeight,
    fontWeight: 400,
  },
  subtitle1: {
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.875rem',
    lineHeight: 1.4,
    fontWeight: 500,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    fontWeight: 400,
  },
  button: {
    fontSize: '0.9375rem',
    lineHeight: 1.4,
    fontWeight: 600,
  },
}

export default typography
