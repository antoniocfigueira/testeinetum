import { Heart } from 'lucide-react'
import PagePlaceholder from '../components/common/PagePlaceholder.jsx'

function FavoritesPage() {
  return (
    <PagePlaceholder
      description="Os países que guardares ficarão reunidos aqui para os consultares quando quiseres."
      icon={Heart}
      title="Destinos favoritos."
    />
  )
}

export default FavoritesPage

