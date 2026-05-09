import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppThemeProvider } from './context/ThemeContext'
import { WalletProvider } from './hooks/useWallet'
import AppLayout from './components/layout/AppLayout'
import SwapPage from './components/pages/SwapPage'
import LiquidityPage from './components/pages/LiquidityPage'
import VaultPage from './components/pages/VaultPage'

const App = () => (
  <AppThemeProvider>
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/swap" replace />} />
            <Route path="/swap"      element={<SwapPage />} />
            <Route path="/liquidity" element={<LiquidityPage />} />
            <Route path="/vault"     element={<VaultPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  </AppThemeProvider>
)

export default App
