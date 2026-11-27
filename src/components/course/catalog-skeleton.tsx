import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { type FC } from 'react'

const CatalogCardSkeleton: FC = () => <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, border: 1, borderColor: 'transparent', borderRadius: 4, backgroundColor: 'background.paper' }}>
  <Skeleton variant="rectangular" sx={{ width: '100%', aspectRatio: '16 / 9', height: 'auto', borderRadius: 3 }} />
  <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: '85%' }} />
  <Stack direction="row" spacing={0.75}>
    <Skeleton variant="rectangular" sx={{ width: 96, height: 24, borderRadius: 3 }} />
    <Skeleton variant="rectangular" sx={{ width: 64, height: 24, borderRadius: 3 }} />
  </Stack>
  <Skeleton variant="text" sx={{ width: '60%' }} />
  <Skeleton variant="text" sx={{ width: '40%' }} />
  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 1 }}>
    <Skeleton variant="text" sx={{ width: 80, fontSize: '1.5rem' }} />
    <Skeleton variant="circular" width={40} height={40} />
  </Stack>
</Box>

export const CatalogSkeletonGrid: FC<{ label: string; count?: number }> = ({ label, count = 6 }) => <Box role="status" aria-busy="true" aria-label={label} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 1, md: 2 } }}>
  {Array.from({ length: count }, (_, index) => <CatalogCardSkeleton key={index} />)}
</Box>
