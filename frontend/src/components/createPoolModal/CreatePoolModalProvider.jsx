import { useMemo, useState } from 'react'
import { getStoredUser } from '../../api/session'
import CreatePoolModal from './CreatePoolModal'
import { CreatePoolModalContext } from './CreatePoolModalContext'

export default function CreatePoolModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo(
    () => ({
      openCreatePoolModal() {
        const user = getStoredUser()
        if (!user) {
          window.location.assign('/login')
          return
        }
        setIsOpen(true)
      },
      closeCreatePoolModal() {
        setIsOpen(false)
      },
    }),
    [],
  )

  return (
    <CreatePoolModalContext.Provider value={value}>
      {children}
      {isOpen ? <CreatePoolModal onClose={() => setIsOpen(false)} /> : null}
    </CreatePoolModalContext.Provider>
  )
}
