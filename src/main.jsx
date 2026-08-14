import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './hero.css'
import './hero-overrides.css'
import './hero-exact.css'
import './hero-fix.css'
import './source-layout.css'
import './header-mobile-overrides.css'
import './header-desktop-overrides.css'
import './source-sections.css'
import './header-fix.css'
import './hero-button-align.css'
import './how-exact.css'
import './product-image-fix.css'
import './join-exact.css'
import './join-form-enhanced.css'
import './dashboard.css'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
