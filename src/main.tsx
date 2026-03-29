import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Implementation de QueryStack pour les caches
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes, temps destale avant de considérer les données comme périmées
      gcTime: 5 * 60 * 1000, // 5 minutes, temps avant de purger les données du cache après être devenues périmées
      retry: 2, // nombre de tentatives de retry en cas d'échec d'une requête
      refetchOnWindowFocus: false,
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </StrictMode>
    </QueryClientProvider>
  </BrowserRouter>,
)
