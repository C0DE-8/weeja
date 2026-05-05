import { createContext, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredUser } from '../../api/session'
import CreatePoolModal from './CreatePoolModal'

const CreatePoolModalContext = createContext(null)

export function CreatePoolModalProvider({ children }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo(
    () => ({
      openCreatePoolModal() {
        const user = getStoredUser()
        if (!user) {
          navigate('/login')
          return
        }
        setIsOpen(true)
      },
      closeCreatePoolModal() {
        setIsOpen(false)
      },
    }),
    [navigate],
  )

  return (
    <CreatePoolModalContext.Provider value={value}>
      {children}
      {isOpen ? <CreatePoolModal onClose={() => setIsOpen(false)} /> : null}
    </CreatePoolModalContext.Provider>
  )
}

export function useCreatePoolModal() {
  const context = useContext(CreatePoolModalContext)

  if (!context) {
    throw new Error('useCreatePoolModal must be used within CreatePoolModalProvider')
  }

  return context
}
