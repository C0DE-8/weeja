import { createContext, useContext } from 'react'

export const CreatePoolModalContext = createContext(null)

export function useCreatePoolModal() {
  const context = useContext(CreatePoolModalContext)

  if (!context) {
    throw new Error('useCreatePoolModal must be used within CreatePoolModalProvider')
  }

  return context
}
