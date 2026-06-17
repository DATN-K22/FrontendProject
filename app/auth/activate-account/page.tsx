import { Suspense } from 'react'
import ActivateAccountClient from './ActivateAccountClient'

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={null}>
      <ActivateAccountClient />
    </Suspense>
  )
}
