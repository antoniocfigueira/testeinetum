import { SlidersHorizontal } from 'lucide-react'
import PagePlaceholder from '../components/common/PagePlaceholder.jsx'

function SettingsPage() {
  return (
    <PagePlaceholder
      description="Gere os teus dados de perfil, preferências visuais e opções da aplicação."
      eyebrow="Preferências"
      icon={SlidersHorizontal}
      title="Definições da conta."
    />
  )
}

export default SettingsPage

