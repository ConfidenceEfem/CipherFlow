import React, { createContext, useContext, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme } from '../theme'

const ThemeCtx = createContext()

export const AppThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true)
  const toggle = () => setIsDark(p => !p)
  return (
    <ThemeCtx.Provider value={{ isDark, toggle }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeCtx.Provider>
  )
}

export const useAppTheme = () => useContext(ThemeCtx)
