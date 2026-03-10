import { redirect } from 'next/navigation'

export default function InstructorPage() {
  redirect('/authenticated/instructor/overview')
}
