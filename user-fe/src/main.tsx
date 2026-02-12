import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'

// Create a new router instance

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

// Recover once from stale chunk URLs after deploys (cached HTML/entrypoint).
window.addEventListener('vite:preloadError', () => {
  const key = 'kmg:chunk-reload'
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1')
    window.location.reload()
  }
})

window.addEventListener('error', (event) => {
  const key = 'kmg:chunk-reload'
  const message = event.message || ''
  if (
    message.includes('Failed to fetch dynamically imported module') &&
    !sessionStorage.getItem(key)
  ) {
    sessionStorage.setItem(key, '1')
    window.location.reload()
  }
})
