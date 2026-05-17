'use client'

import { useEffect, useState, Suspense } from 'react'
import {
  Box,
  Typography,
  Container,
  Grid,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  FormGroup,
  Checkbox,
  CircularProgress
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { FilterOptionDto, SearchCourseResponseDto, courseApi } from '@/api/courses/search'
import { useDebounce } from '@/hooks/useDebounce'
import CoursesWithGeneralInfo from '@/components/CoursesWithGeneralInfo'

function SearchContent() {
  const searchParams = useSearchParams()
  
  // Parse initial filters from URL
  const initialQ = searchParams.get('q') || ''
  const initialLevels = searchParams.get('levels') ? searchParams.get('levels')!.split(',') : []
  const isPaidParam = searchParams.get('isPaid')
  const initialIsPaid = isPaidParam === 'true' ? true : isPaidParam === 'false' ? false : undefined
  const initialMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const initialMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined

  const [filters, setFilters] = useState<FilterOptionDto>({
    q: initialQ,
    levels: initialLevels as any,
    isPaid: initialIsPaid,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice
  })

  const [searchResults, setSearchResults] = useState<SearchCourseResponseDto | null>(null)
  const [loading, setLoading] = useState(false)
  const debouncedFilters = useDebounce(filters, 500)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const data = await courseApi.searchCourses(debouncedFilters)
        setSearchResults(data)
      } catch (error) {
        console.error('Search failed', error)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [debouncedFilters])

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '80vh' }}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Search Results {filters.q ? `for "${filters.q}"` : ''}
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column: Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Filters</Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Price</Typography>
            <RadioGroup
              value={filters.isPaid === undefined ? 'all' : filters.isPaid ? 'paid' : 'free'}
              onChange={(e) => {
                const val = e.target.value
                setFilters(prev => ({
                  ...prev,
                  isPaid: val === 'all' ? undefined : val === 'paid'
                }))
              }}
            >
              <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
              <FormControlLabel 
                value="paid" 
                control={<Radio size="small" />} 
                label={`Paid ${searchResults?.facets?.priceTypes?.PAID !== undefined ? `(${searchResults.facets.priceTypes.PAID})` : ''}`} 
              />
              <FormControlLabel 
                value="free" 
                control={<Radio size="small" />} 
                label={`Free ${searchResults?.facets?.priceTypes?.FREE !== undefined ? `(${searchResults.facets.priceTypes.FREE})` : ''}`} 
              />
            </RadioGroup>

            <Box sx={{ px: 1, mt: 3, mb: 3 }}>
               <Slider
                 value={[filters.minPrice ?? 0, filters.maxPrice ?? 500]}
                 onChange={(e, val) => {
                   if (Array.isArray(val)) {
                     setFilters(prev => ({ ...prev, minPrice: val[0], maxPrice: val[1] }))
                   }
                 }}
                 min={0}
                 max={500}
                 step={0.01}
                 valueLabelDisplay="auto"
                 valueLabelFormat={(val) => `$${val.toFixed(2)}`}
                 size="small"
               />
               <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                 ${(filters.minPrice ?? 0).toFixed(2)} - ${(filters.maxPrice ?? 500).toFixed(2)}
               </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>Difficulty</Typography>
            <FormGroup>
               {[
                 { value: 'Beginner', label: 'Beginner' },
                 { value: 'Intermediate', label: 'Intermediate' },
                 { value: 'Advanced', label: 'Advanced' }
               ].map(level => {
                 const count = searchResults?.facets?.levels?.[level.value] || 0
                 return (
                   <FormControlLabel
                     key={level.value}
                     control={
                       <Checkbox 
                         size="small"
                         checked={filters.levels?.includes(level.value as any) || false}
                         onChange={(e) => {
                           setFilters(prev => {
                             const currentLevels = prev.levels || []
                             if (e.target.checked) {
                               return { ...prev, levels: [...currentLevels, level.value as any] }
                             } else {
                               return { ...prev, levels: currentLevels.filter(l => l !== level.value) }
                             }
                           })
                         }}
                       />
                     }
                     label={`${level.label} ${count !== undefined ? `(${count})` : ''}`}
                   />
                 )
               })}
            </FormGroup>
          </Box>
        </Grid>

        {/* Right Column: Results */}
        <Grid size={{ xs: 12, md: 9 }}>
          {loading && !searchResults ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
               <CircularProgress />
             </Box>
          ) : searchResults?.data?.length === 0 ? (
             <Box sx={{ py: 8, textAlign: 'center' }}>
               <Typography variant="h6" color="text.secondary">No results found.</Typography>
               <Typography variant="body2" color="text.secondary" mt={1}>Try adjusting your filters or search terms.</Typography>
             </Box>
          ) : (
             <CoursesWithGeneralInfo 
               loading={loading} 
               courses={searchResults?.data || null} 
               visualPreset="default"
             />
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>}>
      <SearchContent />
    </Suspense>
  )
}
