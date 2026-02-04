import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNewsQuery } from '../query/useNewsQuery'
import { Button } from '../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
export const Route = createFileRoute('/')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { news, isLoading, deleteNews } = useNewsQuery()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteNews(id)
        toast.success('News deleted successfully')
      } catch (error: any) {
        toast.error('Failed to delete news')
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">News Dashboard</h1>
          <p className="text-gray-500 text-lg">Manage your news articles and publications</p>
        </div>
        <Button 
          size="lg" 
          className="shadow-md hover:shadow-lg transition-all h-12 px-6 text-base font-semibold"
          onClick={() => navigate({ to: '/$newsId', params: { newsId: 'add-news' } })}
        >
          <Plus className="mr-2 h-5 w-5" /> Add New News
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50/50 border-b pb-6">
          <CardTitle className="text-xl font-bold">Recent Articles</CardTitle>
          <CardDescription>A list of all news articles in the system</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="w-[40%] font-semibold py-4 px-6">Title</TableHead>
                  <TableHead className="font-semibold py-4">Status</TableHead>
                  <TableHead className="font-semibold py-4">Created At</TableHead>
                  <TableHead className="font-semibold py-4">Reporter</TableHead>
                  <TableHead className="text-right font-semibold py-4 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news && news.length > 0 ? (
                  news.map((item: any) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 line-clamp-1">{item.title}</span>
                          <span className="text-xs text-gray-400 font-mono mt-1">{item.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.isPublished 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-gray-600">
                        {format(new Date(item.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="py-4 text-gray-600">
                        {item.userId === null ? 'System' : (item.userName || 'Admin')}
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                            onClick={() => navigate({ to: '/$newsId', params: { newsId: item.id } })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(item.id, item.title)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                      No news articles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
