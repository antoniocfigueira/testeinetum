import { Check, Image, LockKeyhole, Moon, Save, Sun, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import useAuth from '../hooks/useAuth.js'
import useTheme from '../hooks/useTheme.js'
import useToast from '../hooks/useToast.js'
import styles from './SettingsPage.module.css'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function isValidPictureUrl(value) {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function SettingsPage() {
  const { updateProfile, user } = useAuth()
  const { setTheme, theme } = useTheme()
  const { addToast } = useToast()
  const [form, setForm] = useState({ name: user?.name ?? '', picture: user?.picture ?? '' })
  const [imageFailed, setImageFailed] = useState(false)
  const [errors, setErrors] = useState({})
  const initials = useMemo(() => getInitials(form.name || user?.email || 'IT'), [form.name, user?.email])

  useEffect(() => {
    setForm({ name: user?.name ?? '', picture: user?.picture ?? '' })
    setImageFailed(false)
  }, [user?.name, user?.picture])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: null }))
    if (name === 'picture') setImageFailed(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Indica o nome a apresentar.'
    if (!isValidPictureUrl(form.picture.trim())) {
      nextErrors.picture = 'Introduz um endereço http ou https válido.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const wasSaved = updateProfile(form)

    addToast(
      wasSaved
        ? 'As alterações da conta foram guardadas neste dispositivo.'
        : 'O perfil foi atualizado, mas não foi possível guardá-lo neste dispositivo.',
      {
        title: wasSaved ? 'Perfil atualizado' : 'Falha ao guardar',
        type: wasSaved ? 'success' : 'error',
      },
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Definições da conta.</h1>
        <p>Personaliza o teu perfil e a forma como a aplicação é apresentada.</p>
      </header>

      <div className={styles.layout}>
        <form className={styles.profileCard} onSubmit={handleSubmit}>
          <div className={styles.sectionHeading}>
            <span aria-hidden="true">
              <User size={20} />
            </span>
            <div>
              <h2>Dados do perfil</h2>
              <p>Esta informação é apresentada no menu da tua conta.</p>
            </div>
          </div>

          <div className={styles.profilePreview}>
            {form.picture && !imageFailed ? (
              <img
                alt="Pré-visualização do perfil"
                onError={() => setImageFailed(true)}
                src={form.picture}
              />
            ) : (
              <span aria-label={`Iniciais ${initials}`}>{initials}</span>
            )}
            <div>
              <strong>{form.name || 'O teu nome'}</strong>
              <small>{user?.email}</small>
            </div>
          </div>

          <label className={styles.field}>
            <span>Nome</span>
            <input
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
              name="name"
              onChange={handleChange}
              value={form.name}
            />
            {errors.name && <small id="name-error">{errors.name}</small>}
          </label>

          <label className={styles.field}>
            <span>Fotografia de perfil</span>
            <div className={styles.inputWithIcon}>
              <Image aria-hidden="true" size={17} />
              <input
                aria-describedby={errors.picture ? 'picture-error' : undefined}
                aria-invalid={Boolean(errors.picture)}
                inputMode="url"
                name="picture"
                onChange={handleChange}
                placeholder="https://exemplo.com/fotografia.jpg"
                value={form.picture}
              />
            </div>
            {errors.picture && (
              <small id="picture-error">{errors.picture}</small>
            )}
          </label>

          <label className={styles.field}>
            <span>Email Google</span>
            <div className={styles.inputWithIcon}>
              <LockKeyhole aria-hidden="true" size={17} />
              <input disabled readOnly value={user?.email ?? ''} />
            </div>
            <em>O email é gerido pela conta Google utilizada no login.</em>
          </label>

          <button className={styles.saveButton} type="submit">
            <Save size={17} />
            Guardar alterações
          </button>
        </form>

        <aside className={styles.preferences}>
          <div className={styles.sectionHeading}>
            <span aria-hidden="true">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </span>
            <div>
              <h2>Aparência</h2>
              <p>Escolhe o tema mais confortável para ti.</p>
            </div>
          </div>

          <div className={styles.themePicker} aria-label="Tema da aplicação">
            <button
              aria-pressed={theme === 'light'}
              className={theme === 'light' ? styles.selectedTheme : ''}
              onClick={() => setTheme('light')}
              type="button"
            >
              <Sun size={19} />
              Claro
              {theme === 'light' && <Check size={17} />}
            </button>
            <button
              aria-pressed={theme === 'dark'}
              className={theme === 'dark' ? styles.selectedTheme : ''}
              onClick={() => setTheme('dark')}
              type="button"
            >
              <Moon size={19} />
              Escuro
              {theme === 'dark' && <Check size={17} />}
            </button>
          </div>

          <div className={styles.accountStatus}>
            <span aria-hidden="true">
              <Check size={18} />
            </span>
            <div>
              <strong>Conta Google ligada</strong>
              <p>A sessão está protegida e expira automaticamente.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default SettingsPage
