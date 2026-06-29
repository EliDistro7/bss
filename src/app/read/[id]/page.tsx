import EpubReader from '../../../components/EpubReader'

interface Props {
  params: { id: string }
}

export default function ReadPage({ params }: Props) {
  return <EpubReader id={params.id} />
}