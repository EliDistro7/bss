import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import ServiceTabs from './ServiceTabs'

type ServiceKey = 'profile' | 'website' | 'app' | 'card' | 'proposal'
const VALID: ServiceKey[] = ['profile', 'website', 'app', 'card', 'proposal']

const META: Record<ServiceKey, { title: string; description: string }> = {
  profile:  { title: 'Company Profile Design | BSS',         description: 'Print-ready company profiles for Tanzanian businesses.' },
  website:  { title: 'Website Development | BSS',            description: 'Fast, mobile-ready websites built in Dar es Salaam.' },
  app:      { title: 'Mobile App Development | BSS',         description: 'Android and iOS apps scoped to your workflow.' },
  card:     { title: 'Business Card Design | BSS',           description: 'Sharp, memorable cards that carry your brand.' },
  proposal: { title: 'Business Proposal Writing & Design | BSS', description: 'Professionally written proposals that win contracts.' },
}

export function generateStaticParams() {
  return VALID.map((service) => ({ service }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ service: string }> }
): Promise<Metadata> {
  const { service } = await params
  if (!VALID.includes(service as ServiceKey)) return {}
  const m = META[service as ServiceKey]
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://bari-software-services.online/services/${service}` },
  }
}

export default async function ServicePage(
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params
  if (!VALID.includes(service as ServiceKey)) redirect('/services/profile')
  return <ServiceTabs activeService={service as ServiceKey} />
}