import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTagsQuery } from '../query/useTagsQuery'
import { Button } from '../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Plus, Trash2, Loader2, Tag as TagIcon, Search } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"

export const Route = createFileRoute('/tags')({
  component: TagsComponent,
})

function TagsComponent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const { tags, isLoading, createTag, deleteTag } = useTagsQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    try {
      await createTag(newTagName.trim())
      toast.success('Tag created successfully')
      setNewTagName('')
      setIsCreateDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tag')
    }
  }

  const handleDeleteTag = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the tag "${name}"? This will remove it from all news articles.`)) {
      try {
        await deleteTag(id)
        toast.success('Tag deleted successfully')
      } catch (error: any) {
        toast.error('Failed to delete tag')
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

  const filteredTags = tags?.filter((tag: any) => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2 flex items-center gap-3">
            <TagIcon className="text-primary h-8 w-8" />
            Tags Management
          </h1>
          <p className="text-gray-500 text-lg">Organize and manage tags for your news articles</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="shadow-md hover:shadow-lg transition-all h-12 px-6 text-base font-semibold"
            >
              <Plus className="mr-2 h-5 w-5" /> Add New Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateTag}>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Enter a name for the new tag. Tags are automatically converted to lowercase.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="e.g. Technology"
                    className="col-span-3"
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Tag</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold">All Tags</CardTitle>
              <CardDescription>A complete list of tags available in the system</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="w-[60%] font-semibold py-4 px-6">Tag Name</TableHead>
                  <TableHead className="font-semibold py-4">Created At</TableHead>
                  <TableHead className="text-right font-semibold py-4 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag: any) => (
                    <TableRow key={tag.id} className="hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                          <span className="font-medium text-gray-900">{tag.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-gray-600">
                        {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => handleDeleteTag(tag.id, tag.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-gray-400">
                      {searchTerm ? 'No tags matching your search' : 'No tags found'}
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
