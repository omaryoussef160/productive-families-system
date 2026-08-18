import { createRoot } from 'react-dom/client'
import App from './App'
import './assets/styles/styles.css'
import './assets/styles/hero.css'
import './assets/styles/hero-overrides.css'
import './assets/styles/hero-exact.css'
import './assets/styles/hero-fix.css'
import './assets/styles/source-layout.css'
import './assets/styles/header-mobile-overrides.css'
import './assets/styles/header-desktop-overrides.css'
import './assets/styles/source-sections.css'
import './assets/styles/header-fix.css'
import './assets/styles/hero-button-align.css'
import './assets/styles/how-exact.css'
import './assets/styles/product-image-fix.css'
import './assets/styles/join-exact.css'
import './assets/styles/join-form-enhanced.css'
import './assets/styles/dashboard.css'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
