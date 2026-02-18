"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface RTLContextType {
  isRTL: boolean
  direction: 'ltr' | 'rtl'
  setDirection: (dir: 'ltr' | 'rtl') => void
}

const RTLContext = createContext<RTLContextType | undefined>(undefined)

export const useRTL = () => {
  const context = useContext(RTLContext)
  if (!context) {
    throw new Error('useRTL must be used within an RTLProvider')
  }
  return context
}

interface RTLProviderProps {
  children: React.ReactNode
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { i18n } = useTranslation()
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')

  useEffect(() => {
    const isArabic = i18n.language === 'ar'
    const newDirection = isArabic ? 'rtl' : 'ltr'
    setDirection(newDirection)
    
    // Apply direction to document
    document.documentElement.dir = newDirection
    document.documentElement.lang = i18n.language
    
    // Add RTL class to body for styling
    if (isArabic) {
      document.body.classList.add('rtl')
    } else {
      document.body.classList.remove('rtl')
    }
  }, [i18n.language])

  const value: RTLContextType = {
    isRTL: direction === 'rtl',
    direction,
    setDirection,
  }

  return (
    <RTLContext.Provider value={value}>
      {children}
    </RTLContext.Provider>
  )
}
