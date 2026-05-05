export type Course = {
  id: number
  title: string
  badge: 'Free' | 'Paid' | 'Premium'
  price: number
  chapters: number
  orders: number
  certificates: number
  reviews: number
  addedToShelf: number
}
