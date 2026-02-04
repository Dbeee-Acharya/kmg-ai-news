import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import Header from '../components/Header'

import type { QueryClient } from '@tanstack/react-query'

import { Toaster } from 'sonner'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  ),
})
