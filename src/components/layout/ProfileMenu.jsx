import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import styles from './ProfileMenu.module.css'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function ProfileMenu({ onLogout, user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const menuRef = useRef(null)
  const displayName = user?.name ?? 'Utilizador Inetum'
  const displayEmail = user?.email ?? 'utilizador@inetum.com'

  useEffect(() => {
    setImageFailed(false)
  }, [user?.picture])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={styles.trigger}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={styles.avatar} aria-hidden="true">
          {user?.picture && !imageFailed ? (
            <img
              alt=""
              onError={() => setImageFailed(true)}
              src={user.picture}
            />
          ) : (
            getInitials(displayName)
          )}
        </span>
        <span className={styles.triggerName}>{displayName}</span>
        <ChevronDown
          aria-hidden="true"
          className={isOpen ? styles.chevronOpen : styles.chevron}
          size={15}
        />
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          <div className={styles.profileSummary}>
            <span className={styles.summaryIcon} aria-hidden="true">
              <UserRound size={19} />
            </span>
            <span>
              <strong>{displayName}</strong>
              <small>{displayEmail}</small>
            </span>
          </div>
          <div className={styles.separator} />
          <button
            className={styles.logout}
            onClick={handleLogout}
            role="menuitem"
            type="button"
          >
            <LogOut size={18} />
            Terminar sessão
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileMenu

