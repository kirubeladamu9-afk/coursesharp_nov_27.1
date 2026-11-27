import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import { type StepIconProps } from '@mui/material/StepIcon'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { type FC, type FormEvent, type ReactNode, useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { type AdminCourse } from '@/components/admin/admin-data'
import { type Course } from '@/interfaces/course'
import { getAuthenticatedUser, getCourses, getManualOrderInfo, getPublicClasses, saveAuthenticatedUser, sendEnrollmentOrderVerificationCode, submitManualOrder, verifyEnrollmentOrderEmail, type EnrollmentOrderTarget, type ManualOrderInfo, type PublicClass } from '@/services/api'
import { navigateTo } from '@/lib/navigation'

interface EnrollmentModalProps {
  course: Pick<AdminCourse, 'id' | 'title' | 'price'>
  classId?: number | null
  initialItems?: Array<{ target: EnrollmentOrderTarget; title: string }>
  open: boolean
  onClose: () => void
  onSubmitted?: () => void
}

const steps = ['Account', 'Verify Email', 'Payment']
const maximumProofSize = 6 * 1024 * 1024
type CartItem = { target: EnrollmentOrderTarget; title: string }

const primary = '#127C71'
const primaryHover = '#0D6A69'
const lavender = '#E6F4F1'
const navy = '#17172B'
const muted = '#77788C'
const hairline = '#d9e2df'
const primaryGradient = 'linear-gradient(135deg, #1A9A8C 0%, #0D6A69 100%)'

const formContainerSx = { width: '100%', maxWidth: 600, mx: 'auto' } as const

const fieldSx = {
  '& .MuiInputLabel-root': { color: muted, fontWeight: 500, border: 0, outline: 'none', boxShadow: 'none', '&.MuiInputLabel-shrink': { bgcolor: '#fff' } },
  '& .MuiInputLabel-root.Mui-focused': { color: primary },
  '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': { transform: 'translate(46px, 16px) scale(1)' },
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    pl: 2,
    borderRadius: '16px',
    bgcolor: '#fff',
    transition: 'box-shadow 0.2s ease',
    '& fieldset': { borderColor: hairline },
    '&:hover fieldset': { borderColor: '#A8D9CE' },
    '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(18, 124, 113, 0.14)' },
    '&.Mui-focused fieldset': { borderColor: primary, borderWidth: 1 },
  },
  '& .MuiOutlinedInput-input': { py: 2, pl: 0, color: navy },
  '& .MuiInputAdornment-root': { mr: 1.25, color: muted },
  '& .MuiInputAdornment-root .MuiSvgIcon-root': { fontSize: 20 },
} as const

const withIcon = (icon: ReactNode, endAdornment?: ReactNode) => ({ InputProps: { startAdornment: <InputAdornment position="start">{icon}</InputAdornment>, endAdornment } })

const passwordVisibilityToggle = (label: string, visible: boolean, onToggle: () => void) => <InputAdornment position="end">
  <IconButton aria-label={`${visible ? 'Hide' : 'Show'} ${label}`} onClick={onToggle} edge="end" size="small" sx={{ color: muted, '&:hover': { color: primary, bgcolor: lavender } }}>
    {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
  </IconButton>
</InputAdornment>

const primaryButtonSx = {
  height: 56,
  borderRadius: '16px',
  fontWeight: 700,
  fontSize: 16,
  textTransform: 'none',
  color: '#fff',
  background: primaryGradient,
  boxShadow: '0 10px 24px rgba(18, 124, 113, 0.28)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease',
  '&:hover': { background: primaryGradient, filter: 'brightness(1.05)', transform: 'translateY(-1px)', boxShadow: '0 14px 28px rgba(18, 124, 113, 0.32)' },
  '&:active': { transform: 'translateY(0)' },
  '&.Mui-disabled': { background: '#B5DCD5', color: '#fff', boxShadow: 'none' },
} as const

const secondaryButtonSx = {
  height: 56,
  borderRadius: '16px',
  fontWeight: 600,
  textTransform: 'none',
  color: muted,
  borderColor: hairline,
  bgcolor: '#fff',
  '&:hover': { borderColor: '#A8D9CE', bgcolor: '#F6FBFA' },
} as const

const stepperSx = {
  mb: { xs: 3, sm: 4 },
  '& .MuiStepConnector-alternativeLabel': { top: 18, left: 'calc(-50% + 22px)', right: 'calc(50% + 22px)' },
  '& .MuiStepConnector-line': { borderColor: hairline, borderTopWidth: 2 },
  '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': { borderColor: primary },
  '& .MuiStepLabel-label': { mt: 1, fontSize: { xs: 12, sm: 14 }, color: muted, fontWeight: 500 },
  '& .MuiStepLabel-label.Mui-active': { color: primary, fontWeight: 700 },
  '& .MuiStepLabel-label.Mui-completed': { color: navy, fontWeight: 600 },
} as const

const StepBadge: FC<StepIconProps> = ({ active, completed, icon }) => {
  const filled = active || completed
  return <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', fontSize: 15, fontWeight: 700, color: filled ? '#fff' : muted, bgcolor: filled ? primary : '#DDEFEA', boxShadow: active ? '0 0 0 6px rgba(18, 124, 113, 0.16), 0 6px 14px rgba(18, 124, 113, 0.35)' : 'none', transition: 'background-color 0.2s ease, box-shadow 0.2s ease' }}>
    {completed ? <CheckOutlinedIcon sx={{ fontSize: 18 }} /> : icon}
  </Box>
}

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result))
  reader.onerror = () => reject(new Error('We could not read this image.'))
  reader.readAsDataURL(file)
})

const EnrollmentModal: FC<EnrollmentModalProps> = ({ course, classId = null, initialItems, open, onClose, onSubmitted }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmSignupPassword, setConfirmSignupPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<ManualOrderInfo | null>(null)
  const [paymentInfoError, setPaymentInfoError] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogTab, setCatalogTab] = useState<'courses' | 'classes'>('courses')
  const [catalogCourses, setCatalogCourses] = useState<Course[]>([])
  const [catalogClasses, setCatalogClasses] = useState<PublicClass[]>([])
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofData, setProofData] = useState<string | null>(null)
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthenticatedUser()))
  const [submitted, setSubmitted] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [resendAvailableAt, setResendAvailableAt] = useState(0)
  const [, setClock] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    if (resendAvailableAt <= Date.now()) return
    const timer = window.setInterval(() => {
      const now = Date.now()
      setClock(now)
      if (now >= resendAvailableAt) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [resendAvailableAt])

  const resendSecondsRemaining = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000))
  const orderTargets = cartItems.map((item) => item.target)
  const selectedTargetKeys = new Set(orderTargets.map((target) => 'courseId' in target ? `course:${target.courseId}` : `class:${target.classId}`))
  const availableCourses = catalogCourses.filter((item) => !selectedTargetKeys.has(`course:${item.id}`))
  const availableClasses = catalogClasses.filter((item) => item.published && !item.enrollmentClosed && ['open', 'full'].includes(item.status) && !selectedTargetKeys.has(`class:${item.id}`))
  const updateCartItems = (items: CartItem[]) => {
    setCartItems(items)
    setActiveStep(0)
    setVerificationCode('')
    setProofFile(null)
    setProofData(null)
    setPaymentError(null)
    setPaymentInfoError(null)
  }
  const addCourseToCart = (item: Course) => {
    if (cartItems.length >= 10) return
    updateCartItems([...cartItems, { target: { courseId: Number(item.id) }, title: item.title }])
  }
  const addClassToCart = (item: PublicClass) => {
    if (cartItems.length >= 10) return
    updateCartItems([...cartItems, { target: { classId: item.id }, title: item.title }])
  }
  const removeCartItem = (index: number) => {
    if (cartItems.length <= 1) return
    updateCartItems(cartItems.filter((_, itemIndex) => itemIndex !== index))
  }

  useEffect(() => {
    if (!open) return
    let current = true
    const user = getAuthenticatedUser()
    setIsAuthenticated(Boolean(user))
    setContact({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' })
    setActiveStep(user ? 2 : 0)
    setAccountError(null)
    setPaymentError(null)
    setPaymentInfo(null)
    setPaymentInfoError(null)
    setCopyFeedback(null)
    setProofFile(null)
    setProofData(null)
    setSignupPassword('')
    setConfirmSignupPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setSubmitted(false)
    setVerificationCode('')
    setVerificationError(null)
    setVerificationNotice(null)
    setResendAvailableAt(0)
    const initialTarget: EnrollmentOrderTarget = classId === null ? { courseId: Number(course.id) } : { classId }
    setCartItems(initialItems?.length ? initialItems : [{ target: initialTarget, title: course.title }])
    setCatalogOpen(false)
    return () => { current = false }
  }, [classId, course.id, course.title, initialItems, open])

  useEffect(() => {
    if (!open || cartItems.length === 0) return
    let current = true
    setPaymentInfo(null)
    setPaymentInfoError(null)
    getManualOrderInfo(cartItems.map((item) => item.target))
      .then((info) => { if (current) setPaymentInfo(info) })
      .catch((error) => { if (current) setPaymentInfoError(error instanceof Error ? error.message : 'Payment instructions are unavailable.') })
    return () => { current = false }
  }, [cartItems, open])

  useEffect(() => {
    if (!catalogOpen) return
    let current = true
    setCatalogError(null)
    Promise.all([getCourses(), getPublicClasses()])
      .then(([courses, classes]) => { if (current) { setCatalogCourses(courses); setCatalogClasses(classes) } })
      .catch((error) => { if (current) setCatalogError(error instanceof Error ? error.message : 'Unable to load the catalog.') })
    return () => { current = false }
  }, [catalogOpen])

  const requestVerificationCode = async (email: string) => {
    setIsSendingCode(true)
    try {
      const { resendAfterSeconds } = await sendEnrollmentOrderVerificationCode(email, cartItems.map((item) => item.target))
      setResendAvailableAt(Date.now() + resendAfterSeconds * 1000)
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'We could not send the verification code.'
    } finally {
      setIsSendingCode(false)
    }
  }

  const handlePersonalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!name || !email || !phone) {
      setAccountError('Enter your name, email, and phone number to continue.')
      return
    }
    if (!isAuthenticated && password !== String(formData.get('confirmPassword') ?? '')) {
      setAccountError('The passwords do not match.')
      return
    }

    setAccountError(null)
    setContact({ name, email, phone })
    if (!isAuthenticated) {
      setSignupPassword(password)
      setConfirmSignupPassword(String(formData.get('confirmPassword') ?? ''))
    }
    const sendError = await requestVerificationCode(email)
    if (sendError) {
      setAccountError(sendError)
      return
    }
    setVerificationCode('')
    setVerificationError(null)
    setVerificationNotice(null)
    setActiveStep(1)
  }

  const handleResendCode = async () => {
    setVerificationError(null)
    setVerificationNotice(null)
    const sendError = await requestVerificationCode(contact.email)
    if (sendError) setVerificationError(sendError)
    else setVerificationNotice('A new code was sent to your email.')
  }

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setVerificationError(null)
    setVerificationNotice(null)
    setIsVerifyingCode(true)
    try {
      await verifyEnrollmentOrderEmail(contact.email, cartItems.map((item) => item.target), verificationCode)
      setVerificationCode('')
      setActiveStep(2)
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'We could not verify this code.')
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const handleCopyAccount = async (provider: string, accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopyFeedback(`${provider} account copied.`)
    } catch {
      setCopyFeedback('Copy failed. Please select the account number and copy it manually.')
    }
  }

  const handleProofChange = async (file: File | undefined) => {
    setPaymentError(null)
    if (!file) {
      setProofFile(null)
      setProofData(null)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > maximumProofSize) {
      setProofFile(null)
      setProofData(null)
      setPaymentError('Choose a JPG, PNG, or WebP screenshot no larger than 6 MB.')
      return
    }
    try {
      setProofData(await readFileAsDataUrl(file))
      setProofFile(file)
    } catch (error) {
      setProofFile(null)
      setProofData(null)
      setPaymentError(error instanceof Error ? error.message : 'We could not read this image.')
    }
  }

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!paymentInfo?.configured) {
      setPaymentError('Payment details are not available yet. Please contact support before sending money.')
      return
    }
    if (!proofFile || !proofData) {
      setPaymentError('Attach a screenshot of your completed payment to continue.')
      return
    }
    setPaymentError(null)
    setIsSubmittingPayment(true)
    try {
      const result = await submitManualOrder(cartItems.map((item) => item.target), proofData, proofFile.name, contact, signupPassword)
      if (isAuthenticated) saveAuthenticatedUser(result.user)
      setSubmitted(true)
      onSubmitted?.()
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'We could not submit your payment for review.')
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const renderPersonalInfo = () => <Box component="form" onSubmit={(event) => void handlePersonalSubmit(event)} sx={formContainerSx}>
    <Stack spacing={2} sx={fieldSx}>
      <TextField {...withIcon(<PersonOutlineIcon />)} required fullWidth label="Full Name" name="fullName" autoComplete="name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} />
      <TextField {...withIcon(<MailOutlineIcon />)} required fullWidth label="Email" name="email" type="email" autoComplete="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
      <TextField {...withIcon(<PhoneOutlinedIcon />)} required fullWidth label="Phone" name="phone" type="tel" autoComplete="tel" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
      {!isAuthenticated && <>
        <TextField {...withIcon(<LockOutlinedIcon />, passwordVisibilityToggle('password', showPassword, () => setShowPassword((value) => !value)))} required fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" inputProps={{ minLength: 8 }} value={signupPassword} onChange={(event) => setSignupPassword(event.target.value)} />
        <TextField {...withIcon(<LockOutlinedIcon />, passwordVisibilityToggle('confirm password', showConfirmPassword, () => setShowConfirmPassword((value) => !value)))} required fullWidth label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" inputProps={{ minLength: 8 }} value={confirmSignupPassword} onChange={(event) => setConfirmSignupPassword(event.target.value)} />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: '16px', bgcolor: lavender }}>
          <VerifiedUserOutlinedIcon sx={{ color: primary, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: navy, fontWeight: 500 }}>Your account will be created after you submit your payment proof.</Typography>
        </Stack>
      </>}
      {accountError && <Alert severity="error">{accountError}</Alert>}
      <Button type="submit" variant="contained" size="large" disabled={isSendingCode} endIcon={<ArrowForwardIcon />} sx={primaryButtonSx}>
        {isSendingCode ? 'Sending code...' : 'Continue'}
      </Button>
    </Stack>
  </Box>

  const renderVerifyEmail = () => <Box component="form" onSubmit={(event) => void handleVerifySubmit(event)} sx={formContainerSx}>
    <Stack spacing={2} sx={fieldSx}>
      <Typography variant="body1" sx={{ color: navy, textAlign: 'center' }}>We sent a 6-digit code to <strong>{contact.email}</strong>.</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Enter the code below to continue. It expires in 10 minutes.</Typography>
      <TextField {...withIcon(<LockOutlinedIcon />)} required fullWidth label="Verification code" name="verificationCode" autoComplete="one-time-code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric', maxLength: 6 }} />
      {verificationError && <Alert severity="error">{verificationError}</Alert>}
      {verificationNotice && <Alert severity="success">{verificationNotice}</Alert>}
      <Button type="submit" variant="contained" size="large" disabled={isVerifyingCode || verificationCode.length !== 6} endIcon={<ArrowForwardIcon />} sx={primaryButtonSx}>
        {isVerifyingCode ? 'Verifying...' : 'Verify'}
      </Button>
      <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
        <Button variant="text" onClick={() => setActiveStep(0)} disabled={isVerifyingCode || isSendingCode} sx={{ color: muted, textTransform: 'none', fontWeight: 600 }}>Back</Button>
        <Button variant="text" onClick={() => void handleResendCode()} disabled={isSendingCode || isVerifyingCode || resendSecondsRemaining > 0} sx={{ color: primary, textTransform: 'none', fontWeight: 600 }}>
          {isSendingCode ? 'Sending...' : resendSecondsRemaining > 0 ? `Resend code in ${resendSecondsRemaining}s` : 'Resend code'}
        </Button>
      </Stack>
    </Stack>
  </Box>

  const renderConfirmation = () => <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4, textAlign: 'center' }} aria-live="polite">
    <Typography variant="h5" sx={{ fontWeight: 800, color: navy }}>Payment Pending Verification</Typography>
    <Typography color="text.secondary">Your payment screenshot for {cartItems.map((item) => item.title).join(', ')} has been received and is under review. {isAuthenticated ? 'Check Payment History in your dashboard for updates.' : 'Sign in with your email and password to check Payment History.'} Access will be available after approval.</Typography>
    <Button size="large" onClick={() => navigateTo(isAuthenticated ? '/dashboard' : '/sign-in')} endIcon={<ArrowForwardIcon />} sx={{ ...primaryButtonSx, px: 4 }}>{isAuthenticated ? 'Go to Dashboard' : 'Sign in'}</Button>
  </Box>

  const renderPaymentInfo = () => <Stack spacing={{ xs: 2, sm: 2.5 }}>
    {paymentInfoError && <Alert severity="error">{paymentInfoError}</Alert>}
    {!paymentInfo && !paymentInfoError && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress aria-label="Loading payment information" /></Box>}
    {paymentInfo && <Box>
      <Box>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '12px', color: primary, bgcolor: lavender }}><QrCode2OutlinedIcon /></Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: navy }}>Scan to Pay</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Open your mobile banking or payment app and scan the QR code to complete your payment.</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 0.9fr) minmax(0, 1.1fr)' }, gap: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: 'grid', alignContent: 'start', justifyItems: 'center', gap: 1.5, p: { xs: 2, sm: 2.5 }, border: 1, borderColor: hairline, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 8px 24px rgba(18, 124, 113, 0.06)' }}>
            <Typography variant="subtitle2" sx={{ alignSelf: 'start', fontWeight: 700, color: navy }}>Business payment QR</Typography>
            <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', minHeight: { xs: 240, sm: 280 }, borderRadius: '14px', bgcolor: '#F4FAF8' }}>
              <Box component="img" src="/images/payment-qr.webp" alt="QR code for business payment" sx={{ display: 'block', width: 'min(100%, 286px)', aspectRatio: '1', objectFit: 'contain', bgcolor: 'white' }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>Scan with any supported bank or mobile money app.</Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 2.5 }, border: 1, borderColor: hairline, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 8px 24px rgba(18, 124, 113, 0.06)' }}>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 750, color: navy }}>Payment details</Typography>
            <Stack divider={<Box sx={{ borderBottom: 1, borderColor: hairline }} />}>
              {paymentInfo.paymentMethods.map((method) => {
                const copied = copyFeedback === `${method.provider} account copied.`
                return <Box key={method.provider} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 1.25, py: 1.35 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.35, color: 'text.secondary' }}>
                      {method.provider === 'Telebirr' ? <PhoneIphoneOutlinedIcon fontSize="small" /> : <AccountBalanceOutlinedIcon fontSize="small" />}
                      <Typography variant="body2">{method.provider}</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ pl: 3.5, fontWeight: 700, color: navy, overflowWrap: 'anywhere' }}>{method.accountNumber}</Typography>
                  </Box>
                  <Button size="small" variant="text" aria-label={`Copy ${method.provider} account number`} startIcon={copied ? <CheckOutlinedIcon /> : <ContentCopyOutlinedIcon />} onClick={() => void handleCopyAccount(method.provider, method.accountNumber)} sx={{ minWidth: 0, color: primary, textTransform: 'none', fontWeight: 600 }}>{copied ? 'Copied' : 'Copy'}</Button>
                </Box>
              })}
            </Stack>
            {copyFeedback && <Typography variant="caption" role="status" sx={{ display: 'block', mt: 0.75, color: copyFeedback.startsWith('Copy failed') ? 'error.main' : '#047857' }}>{copyFeedback}</Typography>}
            <Alert icon={<InfoOutlinedIcon />} severity="info" sx={{ mt: 1.5, borderRadius: '14px', bgcolor: lavender, color: navy, '& .MuiAlert-icon': { color: primary } }}>
              Please include the exact order total ({paymentInfo.currency} {paymentInfo.amount.toFixed(2)}) when paying.
            </Alert>
            {paymentInfo.instructions && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>{paymentInfo.instructions}</Typography>}
          </Box>
        </Box>
      </Box>

      <Box component="form" onSubmit={(event) => void handlePaymentSubmit(event)}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, p: { xs: 2, sm: 2.25 }, border: 1, borderStyle: 'dashed', borderColor: 'rgba(18, 124, 113, 0.35)', borderRadius: '16px', bgcolor: 'rgba(18, 124, 113, 0.04)' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: 'grid', placeItems: 'center', flexShrink: 0, width: 44, height: 44, borderRadius: '12px', color: primary, bgcolor: lavender }}><CloudUploadOutlinedIcon /></Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 750, color: navy }}>Payment screenshot</Typography>
                <Typography variant="body2" color="text.secondary">After paying, upload a screenshot as proof.</Typography>
              </Box>
            </Stack>
            <Button component="label" variant="outlined" disabled={!paymentInfo.configured || isSubmittingPayment} startIcon={<CloudUploadOutlinedIcon />} sx={{ flexShrink: 0, px: 2, py: 1.1, borderRadius: '14px', textTransform: 'none', fontWeight: 600, borderColor: primary, color: primary, bgcolor: '#fff', '&:hover': { borderColor: primaryHover, bgcolor: lavender } }}>
              {proofFile ? 'Choose another image' : 'Upload screenshot'}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void handleProofChange(event.target.files?.[0]); event.target.value = '' }} />
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">Supported formats: JPG, PNG, or WebP. Maximum file size: 6 MB.</Typography>
          {proofFile && <Typography variant="body2" sx={{ color: '#047857', overflowWrap: 'anywhere' }}>Attached: {proofFile.name}</Typography>}
          {paymentError && <Alert severity="error">{paymentError}</Alert>}
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} sx={{ pt: 1, borderTop: 1, borderColor: hairline }}>
            {!isAuthenticated && <Button fullWidth variant="outlined" size="large" onClick={() => setActiveStep(0)} disabled={isSubmittingPayment} sx={secondaryButtonSx}>Back</Button>}
            <Button fullWidth type="submit" variant="contained" size="large" disabled={!paymentInfo.configured || !proofFile || isSubmittingPayment} sx={primaryButtonSx}>
              {isSubmittingPayment ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6 }}><CheckOutlinedIcon sx={{ fontSize: 15 }} /> Your payment is secure and protected.</Typography>
        </Stack>
      </Box>
    </Box>}
  </Stack>

  const priceFor = (target: EnrollmentOrderTarget) => paymentInfo?.items.find((item) => 'courseId' in target ? item.courseId === target.courseId : item.classId === target.classId)

  const renderOrderSummary = () => <Box component="aside" aria-label="Order summary" sx={{ p: { xs: 2.25, sm: 2.5 }, border: 1, borderColor: hairline, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 8px 24px rgba(18, 124, 113, 0.06)', position: { md: 'sticky' }, top: { md: 0 } }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 750, color: navy }}>Order summary</Typography>
      {!initialItems && <Button size="small" startIcon={<AddIcon />} disabled={cartItems.length >= 10 || isSubmittingPayment} onClick={() => setCatalogOpen(true)} sx={{ textTransform: 'none', color: primary, fontWeight: 600 }}>{cartItems.length >= 10 ? 'Cart full' : 'Add item'}</Button>}
    </Stack>
    <Stack divider={<Box sx={{ borderBottom: 1, borderColor: hairline }} />}>
      {cartItems.map((item, index) => {
        const amount = priceFor(item.target)?.amount
        return <Box key={'courseId' in item.target ? `course-${item.target.courseId}` : `class-${item.target.classId}`} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, py: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 650, color: navy, overflowWrap: 'anywhere', lineHeight: 1.35 }}>{item.title}</Typography>
            <Typography variant="caption" color="text.secondary">{'courseId' in item.target ? 'Course' : 'Class'}</Typography>
            {!initialItems && <Button size="small" aria-label={`Remove ${item.title} from order`} disabled={cartItems.length <= 1 || isSubmittingPayment} onClick={() => removeCartItem(index)} sx={{ display: 'block', p: 0, mt: 0.5, minWidth: 0, color: muted, textTransform: 'none', fontWeight: 600 }}>Remove</Button>}
          </Box>
          {amount !== undefined && paymentInfo && <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{paymentInfo.currency} {amount.toFixed(2)}</Typography>}
        </Box>
      })}
    </Stack>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 2, borderTop: 1, borderColor: hairline }}>
      <Typography sx={{ fontWeight: 700, color: navy }}>Total</Typography>
      {paymentInfo ? <Typography variant="h5" sx={{ color: primary, fontWeight: 800 }}>{paymentInfo.currency} {paymentInfo.amount.toFixed(2)}</Typography> : paymentInfoError ? null : <CircularProgress size={22} aria-label="Loading order total" />}
    </Box>
  </Box>

  return <>
  <Dialog open={open} onClose={onClose} fullScreen={isMobile} maxWidth={false} aria-labelledby="enrollment-dialog-title" PaperProps={{ sx: { width: '100%', maxWidth: { sm: 1000 }, m: { xs: 0, sm: 2 }, borderRadius: { xs: 0, sm: '24px' }, overflow: 'hidden', backgroundImage: 'none', boxShadow: '0 24px 64px rgba(23, 23, 43, 0.14)', maxHeight: { sm: 'min(92vh, 960px)' } } }}>
    <DialogTitle id="enrollment-dialog-title" component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 2, px: { xs: 2.5, sm: 4 }, borderBottom: 1, borderColor: hairline }}>
      <Box>
        <Typography component="span" variant="h5" sx={{ display: 'block', fontWeight: 800, lineHeight: 1.25, color: navy }}>Checkout</Typography>
        <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>Complete your payment to get full access to {classId === null ? 'this course' : 'this class'}.</Typography>
      </Box>
      <IconButton aria-label="Close enrollment" onClick={onClose} sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '12px', color: muted, bgcolor: '#F2F6F5', '&:hover': { color: primary, bgcolor: lavender } }}><CloseIcon /></IconButton>
    </DialogTitle>
    <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, pt: { xs: 3, sm: 3.5 }, pb: { xs: 3, sm: 4 }, overflowY: 'auto' }}>
      {submitted ? renderConfirmation() : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Stepper activeStep={isAuthenticated ? 0 : activeStep} alternativeLabel sx={stepperSx}>
            {(isAuthenticated ? ['Payment'] : steps).map((label, index) => <Step key={label} completed={!isAuthenticated && index < activeStep}><StepLabel StepIconComponent={StepBadge}>{label}</StepLabel></Step>)}
          </Stepper>
          {activeStep === 0 ? renderPersonalInfo() : activeStep === 1 ? renderVerifyEmail() : renderPaymentInfo()}
        </Box>
        {renderOrderSummary()}
      </Box>}
    </DialogContent>
  </Dialog>
  <Dialog open={catalogOpen} onClose={() => setCatalogOpen(false)} fullWidth maxWidth="sm" aria-labelledby="catalog-picker-title">
    <DialogTitle id="catalog-picker-title">Add to your order</DialogTitle>
    <DialogContent dividers>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant={catalogTab === 'courses' ? 'contained' : 'outlined'} onClick={() => setCatalogTab('courses')}>Courses</Button>
        <Button variant={catalogTab === 'classes' ? 'contained' : 'outlined'} onClick={() => setCatalogTab('classes')}>Classes</Button>
      </Stack>
      {catalogError && <Alert severity="error" sx={{ mb: 2 }}>{catalogError}</Alert>}
      {catalogTab === 'courses' ? <Stack spacing={1}>{availableCourses.map((item) => <Button key={item.id} onClick={() => { addCourseToCart(item); setCatalogOpen(false) }} disabled={cartItems.length >= 10} sx={{ justifyContent: 'space-between', textAlign: 'left', py: 1.25 }}><span>{item.title}</span><AddIcon /></Button>)}</Stack> : <Stack spacing={1}>{availableClasses.map((item) => <Button key={item.id} onClick={() => { addClassToCart(item); setCatalogOpen(false) }} disabled={cartItems.length >= 10} sx={{ justifyContent: 'space-between', textAlign: 'left', py: 1.25 }}><span>{item.title}</span><AddIcon /></Button>)}</Stack>}
      {!catalogError && (catalogTab === 'courses' ? availableCourses.length === 0 : availableClasses.length === 0) && <Typography color="text.secondary">No additional {catalogTab} are available to add.</Typography>}
    </DialogContent>
    <DialogActions><Button onClick={() => setCatalogOpen(false)}>Close</Button></DialogActions>
  </Dialog>
  </>
}

export default EnrollmentModal
