import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUserQuery } from '../../query/useUserQuery'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Trash2, Edit, Loader2, UserPlus, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export const Route = createFileRoute('/user/')({
  component: UserListingComponent,
})

function UserListingComponent() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { useUsersQuery, deleteUser } = useUserQuery()
  const { data: users, isLoading } = useUsersQuery()

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        navigate({ to: '/login' })
      } else if (!user?.isSuperAdmin) {
        toast.error('Access denied. Superadmin only.')
        navigate({ to: '/' })
      }
    }
  }, [isAuthenticated, isAuthLoading, user, navigate])

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete reporter "${name}"?`)) {
      try {
        await deleteUser(id)
        toast.success('Reporter deleted successfully')
      } catch (error: any) {
        toast.error('Failed to delete reporter')
      }
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1 flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="text-gray-500">Manage reporters and their access permissions</p>
        </div>
        <Button 
          onClick={() => navigate({ to: '/user/$userId', params: { userId: 'add-user' } })}
          className="shadow-sm"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add Reporter
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle>System Reporters</CardTitle>
          <CardDescription>Reporters can only manage news they have created.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/30">
              <TableRow>
                <TableHead className="font-semibold py-4 px-6">Name</TableHead>
                <TableHead className="font-semibold py-4">Email</TableHead>
                <TableHead className="font-semibold py-4">Created At</TableHead>
                <TableHead className="text-right font-semibold py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 px-6 font-medium text-gray-900">
                      {u.name}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {u.email}
                    </TableCell>
                    <TableCell className="py-4 text-gray-600">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600 hover:text-primary hover:border-primary/30"
                          onClick={() => navigate({ to: '/user/$userId', params: { userId: u.id } })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(u.id, u.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-gray-400">
                    No reporters found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
