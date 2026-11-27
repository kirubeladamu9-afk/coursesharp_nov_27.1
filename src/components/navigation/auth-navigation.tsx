import React, { FC } from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import { StyledButton } from '@/components/styled-button'

interface Props {
  isAdmin?: boolean
  isTutor?: boolean
  isStudent?: boolean
  studentName?: string
  darkMode?: boolean
  onSignIn: () => void
  onAdminDashboard: () => void
  onTutorDashboard: () => void
  onStudentDashboard: () => void
  onSignOut: () => void
}

const AuthNavigation: FC<Props> = ({ isAdmin = false, isTutor = false, isStudent = false, studentName, darkMode = false, onSignIn, onAdminDashboard, onTutorDashboard, onStudentDashboard, onSignOut }) => {
  return (
    <Box sx={{ '& button:first-of-type': { mr: 2 } }}>
      {isAdmin ? <><StyledButton disableHoverEffect={true} variant="outlined" onClick={onAdminDashboard}>Admin Dashboard</StyledButton><StyledButton disableHoverEffect={true} onClick={onSignOut}>Sign Out</StyledButton></> : isTutor ? <><StyledButton disableHoverEffect={true} variant="outlined" onClick={onTutorDashboard}>Tutor Portal</StyledButton><StyledButton disableHoverEffect={true} onClick={onSignOut}>Sign Out</StyledButton></> : isStudent ? <><StyledButton disableHoverEffect={true} variant="outlined" onClick={onStudentDashboard}>My learning</StyledButton><IconButton aria-label="Open learner profile" onClick={onStudentDashboard}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText' }}>{studentName?.trim().charAt(0).toUpperCase() || 'S'}</Avatar></IconButton><StyledButton disableHoverEffect={true} onClick={onSignOut}>Sign Out</StyledButton></> : <><StyledButton animated onClick={onSignIn}>Sign In</StyledButton></>}
    </Box>
  )
}

export default AuthNavigation
