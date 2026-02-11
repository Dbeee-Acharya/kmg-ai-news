import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNewsQuery } from '../query/useNewsQuery'
import { useTagsQuery } from '../query/useTagsQuery'
import { Button } from '../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  Filter, 
  X, 
  Calendar,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { MultiSelect } from '../components/ui/multi-select'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select'

export const Route = createFileRoute('/')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { tags: allTags } = useTagsQuery()

  // Filter & Sort State
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // Server-side query with filters
  const { news, total, totalPages, currentPage, isLoading, deleteNews } = useNewsQuery({
    page,
    limit: 20,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    sortOrder,
  })

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setSelectedTags([])
    setPage(1)
  }

  // Reset page to 1 when filters change
  const handleStartDate = (v: string) => { setStartDate(v); setPage(1) }
  const handleEndDate = (v: string) => { setEndDate(v); setPage(1) }
  const handleTags = (v: string[]) => { setSelectedTags(v); setPage(1) }
  const handleSort = (v: 'asc' | 'desc') => { setSortOrder(v); setPage(1) }

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

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const hasActiveFilters = startDate || endDate || selectedTags.length > 0

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold font-mukta">Articles</CardTitle>
              <CardDescription>
                {total > 0 ? `${total} article${total !== 1 ? 's' : ''} found` : 'Manage and track all news publications'}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={sortOrder} onValueChange={(v: any) => handleSort(v)}>
                <SelectTrigger className="w-[140px] h-9 bg-white border-gray-200">
                  <div className="flex items-center gap-2">
                    {sortOrder === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                    <SelectValue placeholder="Sort" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-3 p-4 bg-muted/30 rounded-xl border border-gray-100">
            <div className="grid gap-1.5 min-w-[140px]">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">From Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => handleStartDate(e.target.value)}
                  className="h-9 pl-8 bg-white border-gray-200 text-sm w-full"
                />
              </div>
            </div>

            <div className="grid gap-1.5 min-w-[140px]">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">To Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => handleEndDate(e.target.value)}
                  className="h-9 pl-8 bg-white border-gray-200 text-sm w-full"
                />
              </div>
            </div>

            <div className="grid gap-1.5 flex-1 min-w-[200px]">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Filter by Tags</Label>
              <MultiSelect
                options={allTags?.map((t: any) => ({ id: t.name, name: t.name })) || []}
                selected={selectedTags}
                onChange={handleTags}
                placeholder="Choose tags..."
                maxItems={10}
              />
            </div>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-9 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
              >
                <X size={14} />
                <span className="text-xs font-medium">Clear</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
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
                          <span className="text-xs text-gray-400 font-mono mt-1 line-clamp-1">{item.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isPublished 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        {format(new Date(item.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">
                        {item.reporterId === null ? 'System' : (item.userName || 'Admin')}
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
                    <TableCell colSpan={5} className="h-48 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="opacity-20 h-10 w-10" />
                        <p>No articles found</p>
                        {hasActiveFilters && (
                          <Button variant="link" onClick={clearFilters} className="text-primary text-xs">
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/30">
              <p className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-700">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalPages}</span>
                <span className="ml-2 text-gray-400">({total} total)</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="h-8 gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
