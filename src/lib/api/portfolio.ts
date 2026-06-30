// Public (unauthenticated) portfolio API — mirrors the admin types but
// only exposes what the public routes return.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export type PortfolioCategory = 'profile' | 'website' | 'app' | 'card' | 'proposal'

export interface PortfolioItem {
  _id: string
  title: string
  titleSw: string
  category: PortfolioCategory
  client: string
  year: string
  description: string
  descriptionSw: string
  link: string
  coverUrl: string
  epubKey: string
  published: boolean
  createdAt: string
  updatedAt: string
}

export async function listPortfolio(category?: PortfolioCategory): Promise<PortfolioItem[]> {
  const url = new URL(`${API_URL}/api/portfolio`)
  if (category) url.searchParams.set('category', category)
  const res = await fetch(url.toString(), { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Failed to fetch portfolio: ${res.status}`)
  const data = await res.json()
  //console.log(data.data);
  return data.data as PortfolioItem[]
}

export async function getPortfolioItem(id: string): Promise<PortfolioItem> {
  const res = await fetch(`${API_URL}/api/portfolio/${id}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Not found: ${res.status}`)
  const data = await res.json()
  return data.data as PortfolioItem
}