export type ProjectCategory = 'profile' | 'website' | 'app' | 'card' | 'proposal'

export interface Project {
  id: string
  title: string
  titleSw: string
  category: ProjectCategory
  client: string
  year: string
  image: string   // unsplash URL
  description: string
  descriptionSw: string
}

// All images from Unsplash – free to use as placeholders
export const projects: Project[] = [

  {
    id: 'p2',
    title: 'Summit Realty — Corporate Website',
    titleSw: 'Summit Realty — Tovuti ya Kampuni',
    category: 'website',
    client: 'Summit Realty',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    description: 'Dynamic property listing platform with search, filtering, and agent contact system.',
    descriptionSw: 'Jukwaa la kuorodhesha mali isiyohamishika lenye nguvu na utafutaji, uchujaji, na mfumo wa mawasiliano ya wakala.',
  },
  {
    id: 'p3',
    title: 'TanzaBuild — Mobile App',
    titleSw: 'TanzaBuild — Programu ya Simu',
    category: 'app',
    client: 'TanzaBuild Group',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    description: 'Site inspection and contractor management app for Android. QR-based site check-ins and daily report generation.',
    descriptionSw: 'Programu ya ukaguzi wa tovuti na usimamizi wa wakandarasi kwa Android. Ukaguzi wa tovuti unaotegemea QR na uzalishaji wa ripoti za kila siku.',
  },
  {
    id: 'p4',
    title: 'Kilimanjaro Properties — Business Cards',
    titleSw: 'Kilimanjaro Properties — Kadi za Biashara',
    category: 'card',
    client: 'Kilimanjaro Properties',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    description: 'Premium matte-finish business cards for a luxury real estate agency. Two-sided full-bleed design.',
    descriptionSw: 'Kadi za biashara zenye kumalizia vizuri kwa wakala wa mali isiyohamishika wa kifahari. Muundo wa pande mbili ulio kamili.',
  },
  {
    id: 'p5',
    title: 'Coastal Developers — Business Proposal',
    titleSw: 'Coastal Developers — Pendekezo la Biashara',
    category: 'proposal',
    client: 'Coastal Developers Ltd',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    description: '42-page investor pitch and project proposal for a coastal residential development in Bagamoyo.',
    descriptionSw: 'Mapendekezo ya wawekezaji na mradi wa kurasa 42 kwa maendeleo ya makazi ya pwani huko Bagamoyo.',
  },
  {
    id: 'p6',
    title: 'Horizon Engineering — Company Profile',
    titleSw: 'Horizon Engineering — Maelezo ya Kampuni',
    category: 'profile',
    client: 'Horizon Engineering',
    year: '2023',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
    description: '36-page bilingual (English/Swahili) company profile for a structural engineering consultancy.',
    descriptionSw: 'Maelezo ya kampuni ya kurasa 36 kwa lugha mbili (Kiingereza/Kiswahili) kwa ushauri wa uhandisi wa miundo.',
  },
  {
    id: 'p7',
    title: 'NyumbaYako — Static Website',
    titleSw: 'NyumbaYako — Tovuti ya Kimya',
    category: 'website',
    client: 'NyumbaYako',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    description: 'Clean informational site for a property rental platform. Mobile-first, fast load times.',
    descriptionSw: 'Tovuti safi ya maelezo kwa jukwaa la kukodisha mali isiyohamishika. Inayozingatia simu, muda mfupi wa kupakia.',
  },
  {
    id: 'p8',
    title: 'BuildRight — Agent Business Cards',
    titleSw: 'BuildRight — Kadi za Wakala wa Biashara',
    category: 'card',
    client: 'BuildRight Tanzania',
    year: '2024',
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=800&q=80',
    description: 'Set of 12 unique agent cards for a construction materials supplier. One template, personalised per rep.',
    descriptionSw: 'Seti ya kadi 12 za kipekee za wakala kwa msambazaji wa vifaa vya ujenzi. Kiolezo kimoja, kimebinafsi kwa kila mwakilishi.',
  },
]