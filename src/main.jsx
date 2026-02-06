// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { WalletProvider } from './context/WalletContext.jsx'
import { FormProvider } from './context/FormContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FormProvider>
      <WalletProvider>
        <App />
      </WalletProvider>
      </FormProvider>
      </AuthProvider>
    </BrowserRouter>
  // </StrictMode>,
)
