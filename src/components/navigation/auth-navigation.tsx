import React, { FC } from 'react'
import Box from '@mui/material/Box'
import UserMenu from '@/components/header/user-menu'
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
    <Box>
      {isAdmin ? <UserMenu name={studentName ?? 'Admin'} dashboardLabel="Admin Dashboard" onDashboard={onAdminDashboard} onSignOut={onSignOut} /> : isTutor ? <UserMenu name={studentName ?? 'Tutor'} dashboardLabel="Tutor Portal" onDashboard={onTutorDashboard} onSignOut={onSignOut} /> : isStudent ? <UserMenu name={studentName} dashboardLabel="My learning" onDashboard={onStudentDashboard} onSignOut={onSignOut} /> : <StyledButton animated onClick={onSignIn}>Sign In</StyledButton>}
    </Box>
  )
}

export default AuthNavigation
