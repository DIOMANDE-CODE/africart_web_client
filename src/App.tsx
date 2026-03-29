import './App.css'
import { AppProviders } from './client/app/providers'
import { AppRoutes } from './router'

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}

export default App
