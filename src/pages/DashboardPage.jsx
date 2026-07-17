import { Globe2 } from 'lucide-react'
import PagePlaceholder from '../components/common/PagePlaceholder.jsx'

function DashboardPage() {
  return (
    <PagePlaceholder
      description="Pesquisa países, roda o globo e encontra toda a informação necessária para preparar a próxima viagem."
      eyebrow="A tua próxima aventura"
      icon={Globe2}
      title="O mundo está à tua espera."
    />
  )
}

export default DashboardPage

