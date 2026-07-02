import { listPortfolio } from '../../lib/api/portfolio'
import type { PortfolioItem } from '../../lib/api/portfolio'
import PortfolioClientShell from '../../components/PortfolioClientShell'

export const revalidate = 60

export default async function PortfolioPage() {
  let initialItems: PortfolioItem[] = []
  try {
    initialItems = await listPortfolio()
  } catch {
    // Shell handles error state on client
  }

  return <PortfolioClientShell initialItems={initialItems} />
}