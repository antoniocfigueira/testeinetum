import { MapPinned } from 'lucide-react'
import PagePlaceholder from '../components/common/PagePlaceholder.jsx'

function LocalPage() {
  return (
    <PagePlaceholder
      description="Consulta contexto geográfico e meteorologia relevante para a tua localização."
      icon={MapPinned}
      title="Descobre o teu local."
    />
  )
}

export default LocalPage

