import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/n/$newsSlug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/n/$newsSlug"!</div>
}
