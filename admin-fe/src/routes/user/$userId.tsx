import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useUserQuery } from '../../query/useUserQuery'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card'
import { ArrowLeft, Save, Loader2, User, Mail, Lock, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/user/$userId')({
  component: UserDetailComponent,
})

function UserDetailComponent() {
  const { userId } = Route.useParams()
  const { user: currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { useUserItemQuery, createUser, updateUser, isCreating, isUpdating } = useUserQuery()

  const isEdit = userId !== 'add-user'
  const { data: userData, isLoading: isDataLoading } = useUserItemQuery(userId)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    portfolioLink: '',
  })

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        navigate({ to: '/login' })
      } else if (!currentUser?.isSuperAdmin) {
        toast.error('Access denied.')
        navigate({ to: '/' })
      }
    }
  }, [isAuthenticated, isAuthLoading, currentUser, navigate])

  useEffect(() => {
    if (isEdit && userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '', // Don't pre-fill password
        portfolioLink: userData.portfolioLink || '',
      })
    }
  }, [isEdit, userData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!isEdit && !formData.password) {
      toast.error('Password is required for new reporters')
      return
    }

    try {
      if (isEdit) {
        const updatePayload: any = { ...formData }
        if (!formData.password) delete updatePayload.password
        await updateUser({ id: userId, data: updatePayload })
        toast.success('Reporter updated successfully')
      } else {
        await createUser(formData)
        toast.success('Reporter created successfully')
      }
      navigate({ to: '/user' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save reporter')
    }
  }

  if (isAuthLoading || (isEdit && isDataLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6 hover:bg-transparent -ml-2 text-gray-500"
        onClick={() => navigate({ to: '/user' })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
      </Button>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b pb-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              {isEdit ? 'Edit Reporter' : 'Add New Reporter'}
            </CardTitle>
            <CardDescription>
              {isEdit ? `Modifying reporter: ${userData?.name}` : 'Create a new reporter account with restricted permissions.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" /> Name
              </Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Full Name"
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email
              </Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="reporter@example.com"
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> Password
              </Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder={isEdit ? "Leave blank to keep current" : "Secure password"}
                required={!isEdit}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="portfolioLink" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground" /> Portfolio Link (Optional)
              </Label>
              <Input 
                id="portfolioLink" 
                value={formData.portfolioLink} 
                onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})} 
                placeholder="https://portfolio.com"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50/50 border-t flex justify-end gap-3 py-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate({ to: '/user' })}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating}
              className="px-8"
            >
              {(isCreating || isUpdating) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEdit ? 'Save Changes' : 'Create Reporter'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
